# app/core/rag_service.py

from app.core.embedding_engine import embed_query, COLLECTION_NAME
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from qdrant_client import QdrantClient
from app.core.config import QDRANT_URL, QDRANT_API_KEY

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    check_compatibility=False
)


def get_rag_context(query, doc_id, top_k=5):
    """Retrieve relevant chunks with BGE embeddings."""
    query_vector = embed_query(query)

    results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        score_threshold=0.25,  # ✅ LOWERED from 0.35 — better recall
        query_filter=Filter(
            must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
        )
    )

    points = results.points

    if not points:
        return "", [], []

    context = "\n\n---\n\n".join([p.payload["text"] for p in points])
    sources = [p.payload.get("chunk_id", i) for i, p in enumerate(points)]
    scores = [p.score for p in points]

    return context, sources, scores

