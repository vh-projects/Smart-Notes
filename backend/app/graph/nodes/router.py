# app/graph/nodes/router.py

from app.core.rag_service import get_rag_context


def router_node(state):
    query = state.get("query")
    doc_id = state.get("doc_id")

    # 🔥 Step 1: Try retrieving context
    context, sources, scores = get_rag_context(query, doc_id)
    print("ROUTER DEBUG → scores:", scores)

    # print("ROUTER DEBUG → context:", context[:100] if context else "EMPTY")

    # # 🔥 Step 2: Decide route based on context presence
    # if context and len(context.strip()) > 50:
    #     route = "rag"
    # else:
    #     route = "general"

    # print("ROUTER DECISION →", route)

    # return {
    #     **state,
    #     "route": route,
    #     "context": context,   # ✅ pass forward (important)
    #     "sources": sources
    # }


     # 🔥 Step 1: get best score
    max_score = max(scores) if scores else 0

    # 🔥 Step 2: threshold decision
    THRESHOLD = 0.75   # 👈 tune this

    if max_score >= THRESHOLD:
        route = "rag"
    else:
        route = "general"
        context = ""   # ❗ important: clear bad context

    print("ROUTER DECISION →", route, "| score:", max_score)

    return {
        **state,
        "route": route,
        "context": context,
        "sources": sources,
        "score": max_score
    }