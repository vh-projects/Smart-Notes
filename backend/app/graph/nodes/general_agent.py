# app/graph/nodes/general_agent.py

from langchain_core.output_parsers import StrOutputParser

from app.core.prompts.general_prompt import general_prompt
from app.core.llm_engine import llm, get_streaming_llm


# -------------------------------------------------------
# Existing synchronous node
# -------------------------------------------------------

def general_agent_node(state):

    query = state.get("query", "")
    chain = general_prompt | llm | StrOutputParser()

    response = chain.invoke({
            "query": query
    })

    return {
        **state,
        "general_answer": response.strip()
    }


# -------------------------------------------------------
# NEW
# Streaming version
# -------------------------------------------------------

async def general_agent_stream(state):

    query = state.get("query", "")
    stream_llm = get_streaming_llm()

    chain = general_prompt | stream_llm

    async for chunk in chain.astream({
            "query": query
    }):

        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content

