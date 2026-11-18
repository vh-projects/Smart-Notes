# app/graph/nodes/hybrid_agent.py



from langchain_core.output_parsers import StrOutputParser
from app.core.llm_engine import llm, get_streaming_llm
from app.core.prompts.hybrid_prompt import hybrid_prompt


# -------------------------------------------------------
# Existing synchronous node
# -------------------------------------------------------

def hybrid_agent_node(state):

    chain = hybrid_prompt | llm | StrOutputParser()

    response = chain.invoke({
            "context": state.get("context", ""),
            "query": state.get("query", ""),
            "history": state.get("history", ""),
    })

    return {
        **state,
        "general_answer": response.strip()
    }


# -------------------------------------------------------
# Streaming version
# -------------------------------------------------------

async def hybrid_agent_stream(state):

    stream_llm = get_streaming_llm()
    chain = hybrid_prompt | stream_llm

    async for chunk in chain.astream({
            "context": state.get("context", ""),
            "query": state.get("query", ""),
            "history": state.get("history", ""),
    }):

        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content

