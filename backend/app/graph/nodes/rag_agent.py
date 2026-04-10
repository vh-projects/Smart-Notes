# # app/graph/rag_agent.py
# from app.core.rag_service import get_rag_context

# def rag_agent_node(state):

#     print("DEBUG → state received:", state)

#     query= state["query"]
#     doc_id= state["doc_id"]
#     print("DEBUG → query:", query)
#     print("DEBUG → doc_id:", doc_id)

#     context, sources= get_rag_context(query, doc_id)
#     print("DEBUG → context:", context[:200] if context else "EMPTY")

#     return { 
#         **state,
#         "context": context,
#         "sources": sources
#     }




def rag_agent_node(state):

    print("DEBUG → state received:", state)

    # ✅ context already comes from router now
    context = state.get("context")
    sources = state.get("sources")

    print("DEBUG → context:", context[:200] if context else "EMPTY")

    return {
        **state,
        "context": context,
        "sources": sources
    }


