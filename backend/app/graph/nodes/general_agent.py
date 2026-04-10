from app.core.llm_engine import llm
from langchain_core.output_parsers import StrOutputParser
from app.core.prompts.general_prompt import general_prompt

# general_prompt= PromptTemplate(
#     input_variables= ["query"],
#     template= (
#         "Answer clearly and concisely.\n"
#         "Do NOT rely on any external document.\n"
#         "Avoid long explanations.\n"
#         "Use bullet points if helpful.\n"
#         "Max 150 words.\n\n"
#         "Question:\n{query}\n\n"
#         "Answer:"        
#     )
# )

# def general_agent_node(state):
#     query = state.get("query")

#     prompt = f"""
#     Answer the following question directly.

#     Question: {query}

#     Do NOT rely on any external document.
#     Answer clearly and accurately.
#     """

#     response = llm.invoke(prompt)

#     return {
#         **state,
#         "general_answer": response.content
#     }
    

def general_agent_node(state):
    query = state.get("query")

    chain = general_prompt | llm | StrOutputParser()
    response = chain.invoke({"query": query})

    return {
        **state,
        "general_answer": response.strip()
    }
    