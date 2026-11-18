# # app/graph/nodes/synthesizer.py

from langchain_core.output_parsers import StrOutputParser

from app.core.llm_engine import (
    llm,
    get_streaming_llm,
)

from app.core.prompts.general_prompt import general_prompt
from app.core.prompts.hybrid_prompt import hybrid_prompt
from app.core.prompts.rag_prompt import rag_prompt


def _select_prompt(route: str):
    """
    Select prompt according to router decision.
    """

    if route == "general":
        return general_prompt

    if route == "hybrid":
        return hybrid_prompt

    return rag_prompt


# ---------------------------------------------------------
# Sync version
# ---------------------------------------------------------

def synthesizer_node(state):

    route = state.get("route")

    prompt = _select_prompt(route)

    chain = prompt | llm | StrOutputParser()

    answer = chain.invoke(
        {
            "query": state.get("query", ""),
            "context": state.get("context", ""),
            "history": state.get("history", ""),
        }
    )

    return {
        **state,
        "final_answer": answer.strip()
    }


# ---------------------------------------------------------
# Streaming version
# ---------------------------------------------------------

async def synthesizer_stream(state):

    route = state.get("route")

    prompt = _select_prompt(route)

    stream_llm = get_streaming_llm()

    chain = prompt | stream_llm

    async for chunk in chain.astream(
        {
            "query": state.get("query", ""),
            "context": state.get("context", ""),
            "history": state.get("history", ""),
        }
    ):

        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content


