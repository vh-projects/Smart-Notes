# app/core/embedding_engine.py

import uuid, time
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import Distance, VectorParams
from sentence_transformers import SentenceTransformer
from app.core.config import QDRANT_URL, QDRANT_API_KEY

MODEL_PATH = "app/core/models/bge-base-en-v1.5"
embedder = SentenceTransformer(MODEL_PATH)

qdrant = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    check_compatibility=False
)

COLLECTION_NAME = "smartnotes"
BATCH_SIZE = 5  # ✅ reduced for free tier


def ensure_collection():
    collections = qdrant.get_collections().collections
    if COLLECTION_NAME not in [c.name for c in collections]:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
    qdrant.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="doc_id",
        field_schema="keyword"
    )


def embed_and_store(text_chunks, doc_id):
    print(f"📊 Final chunks being embedded: {len(text_chunks)}")
    ensure_collection()

    vectors = embed_documents(text_chunks)  # ✅ now uses correct doc prefix

    points = [
        models.PointStruct(
            id=str(uuid.uuid4()),
            vector=vectors[i],
            payload={
                "doc_id": doc_id,
                "text": text_chunks[i],
                "chunk_id": i,
                "length": len(text_chunks[i])
            },
        )
        for i in range(len(vectors))
    ]

    failed_batches = []

    for i in range(0, len(points), BATCH_SIZE):
        batch = points[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        success = False

        for attempt in range(4):  # ✅ 4 attempts with exponential backoff
            try:
                qdrant.upsert(collection_name=COLLECTION_NAME, points=batch)
                success = True
                print(f"   → Batch {batch_num} uploaded")
                break
            except Exception as e:
                wait = 2 ** attempt  # 1s, 2s, 4s, 8s
                print(f"   ⚠️ Batch {batch_num} attempt {attempt+1} failed: {e} | retrying in {wait}s")
                time.sleep(wait)

        if not success:
            failed_batches.append(batch_num)
            print(f"   ❌ Batch {batch_num} permanently failed")

        time.sleep(0.6)  # ✅ throttle between successful batches

    if failed_batches:
        # ✅ raise so the caller (routes.py) knows something went wrong
        raise RuntimeError(f"Failed to upload batches: {failed_batches}")

    print(f"✅ All batches uploaded for doc_id={doc_id}")


def embed_documents(texts):
    """Embed document chunks with correct BGE prefix and normalization."""
    prefixed = [f"Represent this sentence: {t}" for t in texts]  # ✅ correct BGE doc prefix
    vectors = []
    for i in range(0, len(prefixed), 32):
        batch = prefixed[i:i + 32]
        batch_vectors = embedder.encode(
            batch, normalize_embeddings=True, show_progress_bar=False)
        
        vectors.extend(batch_vectors.tolist())
    return vectors


def embed_query(text):
    """Embed a search query — BGE uses 'query:' prefix for retrieval."""
    return embedder.encode(
        f"query: {text}",
        normalize_embeddings=True
    ).tolist() 


