# app/graph/graph_builder.py

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



