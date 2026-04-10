from langgraph.graph import StateGraph, END

from app.graph.state import GraphState
from app.graph.nodes.router import router_node
from app.graph.nodes.rag_agent import rag_agent_node
from app.graph.nodes.synthesizer import synthesizer_node
from app.graph.nodes.evaluator import evaluator_node
from app.graph.nodes.general_agent import general_agent_node


def build_graph():
    builder = StateGraph(GraphState)

    # nodes
    builder.add_node("router", router_node)
    builder.add_node("rag_agent", rag_agent_node)
    builder.add_node("synthesizer", synthesizer_node)
    builder.add_node("evaluator", evaluator_node)
    builder.add_node("general_agent", general_agent_node)

    # edges
    builder.set_entry_point("router")

    builder.add_conditional_edges(
        "router",
        lambda state: state["route"],
        {
            "rag": "rag_agent",
            "general": "general_agent"
        }
    )

    builder.add_edge("rag_agent", "synthesizer")
    builder.add_edge("general_agent", "synthesizer")
    builder.add_edge("synthesizer", "evaluator")
    builder.add_edge("evaluator", END)

    return builder.compile()