# app/graph/nodes/rag_agent.py

def rag_agent_node(state):
    """
    Context is already fetched by router_node.
    This node exists to rerank or validate — keeps the graph extensible.
    Right now it passes state through; add reranking here later.
    """

    # print("DEBUG → state received:", state)

    # ✅ context already comes from router now
    context = state.get("context", "")
    sources = state.get("sources", [])
    score= state.get("score", 0.0)

    print(f"RAG AGENT → context length: {len(context)} | score: {score:.3f}")

    if not context:
        # Fallback: if somehow context is empty, reroute to general
        return {
            **state,
            "route": "general",
        }

    return {
        **state,
        # "context": context,
        # "sources": sources
    }


