# app/core/rag_service.py

from app.core.embedding_engine import embedder, COLLECTION_NAME
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from qdrant_client import QdrantClient
from app.core.config import QDRANT_URL, QDRANT_API_KEY

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    check_compatibility=False
)


# def get_rag_context(question: str, doc_id: str):
#     question_vector = embedder.encode([question])[0].tolist()

#     hits = qdrant_client.query_points(
#         collection_name=COLLECTION_NAME,
#         query=question_vector,
#         query_filter=Filter(
#             must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
#         ),
#         limit=5,
#     ).points

#     # context = "\n".join([hit.payload["text"] for hit in hits])

#     contexts = []
#     sources = []

#     for hit in hits:
#         text = hit.payload.get("text", "")
#         contexts.append(text)

#         sources.append({
#             "text": text[:300],   # limit for UI
#             # add page if you have it later
#         })

#     context = "\n".join(contexts)

#     return context, sources


# def get_rag_context(query, doc_id, top_k=3):
#     query_vector = embedder.encode(query).tolist()

#     results = qdrant_client.query_points(
#         collection_name=doc_id,
#         query=query_vector,
#         limit=top_k
#     )

#     points = results.points

#     if not points:
#         return "", [], []

#     context = "\n".join([p.payload["text"] for p in points])
#     sources = [p.payload.get("source") for p in points]
#     scores = [p.score for p in points]

#     return context, sources, scores



def get_rag_context(query, doc_id, top_k=3):
    
    # ✅ Embed query
    query_vector = embedder.encode(query).tolist()

    # ✅ Query SINGLE collection + filter by doc_id
    results = qdrant_client.query_points(
        collection_name="smartnotes",   # 🔥 FIXED
        query=query_vector,
        limit=top_k,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="doc_id",
                    match=MatchValue(value=doc_id)
                )
            ]
        )
    )

    points = results.points

    if not points:
        return "", [], []

    context = "\n".join([p.payload["text"] for p in points])
    sources = [p.payload.get("source") for p in points]
    scores = [p.score for p in points]

    return context, sources, scores

