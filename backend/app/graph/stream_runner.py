from app.graph.nodes.router import router_node
from app.graph.nodes.rag_agent import rag_agent_node
from app.graph.nodes.synthesizer import synthesizer_stream
from app.graph.nodes.evaluator import evaluator_node


async def stream_graph(initial_state):
    """
    Streaming execution.

    Emits dictionaries with keys:

    event
    data
    """

    # ---------------- Router ----------------

    yield {
        "event": "status",
        "data": {
            "step": "router",
            "message": "Routing query..."
        }
    }

    state = router_node(initial_state)

    route = state["route"]

    # ---------------- Retrieval ----------------

    if route == "rag":

        yield {
            "event": "status",
            "data": {
                "step": "retrieval",
                "message": "Searching document..."
            }
        }

        state = rag_agent_node(state)

    elif route == "hybrid":

        yield {
            "event": "status",
            "data": {
                "step": "retrieval",
                "message": "Searching document..."
            }
        }

    else:

        yield {
            "event": "status",
            "data": {
                "step": "llm",
                "message": "Using general knowledge..."
            }
        }

    # ---------------- Generation ----------------

    yield {
        "event": "status",
        "data": {
            "step": "generation",
            "message": "Generating answer..."
        }
    }

    answer = ""

    async for token in synthesizer_stream(state):

        answer += token

        yield {
            "event": "token",
            "data": token
        }

    state["final_answer"] = answer

    # ---------------- Evaluation ----------------

    yield {
        "event": "status",
        "data": {
            "step": "evaluation",
            "message": "Evaluating response..."
        }
    }

    state = evaluator_node(state)

    # ---------------- Sources ----------------

    yield {
        "event": "sources",
        "data": state.get("sources", [])
    }

    # ---------------- Evaluation ----------------

    yield {
        "event": "evaluation",
        "data": state.get("evaluation", {})
    }

    # ---------------- Finished ----------------

    yield {
        "event": "done",
        "data": {
            "route": state["route"],
            "answer": answer
        }
    }

    