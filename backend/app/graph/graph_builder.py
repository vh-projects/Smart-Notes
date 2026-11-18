# # # app/graph/graph_builder.py

# from langgraph.graph import StateGraph, END

# from app.graph.state import GraphState
# from app.graph.nodes.router import router_node
# from app.graph.nodes.rag_agent import rag_agent_node
# from app.graph.nodes.synthesizer import synthesizer_node
# from app.graph.nodes.evaluator import evaluator_node
# from app.graph.nodes.general_agent import general_agent_node
# from app.graph.nodes.hybrid_agent import hybrid_agent_node

# def route_decision(state):
#     return state["route"]

# def build_graph():
#     builder = StateGraph(GraphState)

#     # nodes
#     builder.add_node("router", router_node)
#     builder.add_node("synthesizer", synthesizer_node)
#     builder.add_node("evaluator", evaluator_node)

#     builder.add_node("rag_agent", rag_agent_node)
#     builder.add_node("general_agent", general_agent_node)
#     builder.add_node("hybrid_agent", hybrid_agent_node)


#     # edges
#     builder.set_entry_point("router")

#     builder.add_conditional_edges(
#         "router",
#         route_decision,
#         {
#             "rag": "rag_agent",
#             "hybrid": "hybrid_agent",
#             "general": "general_agent"
#         }
#     )

#     # ✅ both paths merge at synthesizer
#     builder.add_edge("rag_agent", "synthesizer")
#     builder.add_edge("hybrid_agent", "synthesizer")
#     builder.add_edge("general_agent", "synthesizer")

#     # ✅ synthesizer → evaluator → end
#     builder.add_edge("synthesizer", "evaluator")
#     builder.add_edge("evaluator", END)

#     return builder.compile()







# from langgraph.graph import StateGraph, END

# from app.graph.state import GraphState

# from app.graph.nodes.router import router_node
# from app.graph.nodes.rag_agent import rag_agent_node
# from app.graph.nodes.general_agent import general_agent_node
# from app.graph.nodes.hybrid_agent import hybrid_agent_node
# from app.graph.nodes.synthesizer import synthesizer_node
# from app.graph.nodes.evaluator import evaluator_node


# def route_decision(state):
#     return state["route"]


# def build_graph():

#     builder = StateGraph(GraphState)

#     # --------------------------
#     # Nodes
#     # --------------------------

#     builder.add_node("router", router_node)
#     builder.add_node("rag_agent", rag_agent_node)
#     builder.add_node("general_agent", general_agent_node)
#     builder.add_node("hybrid_agent", hybrid_agent_node)
#     builder.add_node("synthesizer", synthesizer_node)
#     builder.add_node("evaluator", evaluator_node)

#     # --------------------------
#     # Entry
#     # --------------------------
#     builder.set_entry_point("router")

#     # --------------------------
#     # Router
#     # --------------------------
#     builder.add_conditional_edges(
#         "router",
#         route_decision,
#         {
#             "rag": "rag_agent",
#             "hybrid": "hybrid_agent",
#             "general": "general_agent",
#         },
#     )

#     # --------------------------
#     # Merge
#     # --------------------------
#     builder.add_edge("rag_agent", "synthesizer")
#     builder.add_edge("hybrid_agent", "synthesizer")
#     builder.add_edge("general_agent", "synthesizer")

#     # --------------------------
#     # Finish
#     # --------------------------
#     builder.add_edge("synthesizer", "evaluator")
#     builder.add_edge("evaluator", END)

#     return builder.compile()





















from langgraph.graph import StateGraph, END

from app.graph.state import GraphState

from app.graph.nodes.router import router_node
from app.graph.nodes.rag_agent import rag_agent_node
from app.graph.nodes.synthesizer import synthesizer_node
from app.graph.nodes.evaluator import evaluator_node


def route_decision(state):
    return state["route"]


def build_graph():

    builder = StateGraph(GraphState)

    builder.add_node("router", router_node)

    builder.add_node("rag_agent", rag_agent_node)

    builder.add_node("synthesizer", synthesizer_node)

    builder.add_node("evaluator", evaluator_node)

    builder.set_entry_point("router")

    builder.add_conditional_edges(
        "router",
        route_decision,
        {
            "rag": "rag_agent",
            "hybrid": "synthesizer",
            "general": "synthesizer",
        },
    )

    builder.add_edge(
        "rag_agent", "synthesizer"
    )

    builder.add_edge(
        "synthesizer", "evaluator"
    )

    builder.add_edge(
        "evaluator", END
    )

    return builder.compile()




