from app.core.llm_engine import llm
from app.core.prompts.rag_prompt import rag_prompt
from langchain_core.output_parsers import StrOutputParser

def synthesizer_node(state):
    query= state["query"]
    context= state.get("context", "")
    history= state.get("histroy", "")

    general_answer = state.get("general_answer")

    # If general route, skip RAG context
    if state.get("route") == "general":
        return {
            **state,
            "final_answer": general_answer or "No answer generated."
        }

    full_context= f"""
    Conversation History: 
    {history}

    Retrieved Context: 
    {context}
    """
    
   

    chain = rag_prompt | llm | StrOutputParser()
    answer = chain.invoke({
        "context": full_context,
        "query": query
    })
    
    return {
        **state,
        "final_answer": answer.strip()
    } 