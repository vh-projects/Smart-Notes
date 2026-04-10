# embedding_engine.py

import uuid
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import Distance, VectorParams
from sentence_transformers import SentenceTransformer
from app.core.config import QDRANT_URL, QDRANT_API_KEY

# embedder = SentenceTransformer("all-MiniLM-L6-v2")
# embedder.save("models/all-MiniLM-L6-v2")


MODEL_PATH = "app/core/models/all-MiniLM-L6-v2"
embedder = SentenceTransformer(MODEL_PATH)

qdrant = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    check_compatibility=False
    )

COLLECTION_NAME = "smartnotes"
BATCH_SIZE = 100


def ensure_collection():
    collections = qdrant.get_collections().collections
    if COLLECTION_NAME not in [c.name for c in collections]:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            ),
        )

            # ✅ Add this part
    qdrant.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="doc_id",
        field_schema="keyword"
    )


def embed_and_store(text_chunks, doc_id):
    """Embed chunks and store them in Qdrant efficiently."""
    ensure_collection()
    print(f"🔹 Embedding {len(text_chunks)} chunks...")

    # Generate embeddings
    vectors = embedder.encode(text_chunks, show_progress_bar=True).tolist()

    # Prepare points
    points = [
        models.PointStruct(
            id=str(uuid.uuid4()),
            vector=vectors[i],
            payload={"doc_id": doc_id, "text": text_chunks[i]},
        )
        for i in range(len(vectors))
    ]

    # ✅ Upsert in small batches to avoid timeouts
    print("🔹 Uploading to Qdrant in batches...")
    for i in range(0, len(points), BATCH_SIZE):
        batch = points[i:i + BATCH_SIZE]
        qdrant.upsert(collection_name=COLLECTION_NAME, points=batch)
        print(f"   → Uploaded batch {i // BATCH_SIZE + 1}/{len(points) // BATCH_SIZE + 1}")

    print("✅ All embeddings stored successfully!")