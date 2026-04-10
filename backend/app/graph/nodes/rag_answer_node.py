# # app/graph/rag_answer_node.py

# from langchain_core.prompts import PromptTemplate
# from app.core.llm_engine import run_llm
# from app.core.prompts.rag_prompt import rag_prompt
# # rag_prompt = PromptTemplate(
# #     input_variables=["context", "query"],
# #     template=(
# #         "You are a document intelligence system.\n"
# #         "Answer ONLY using the provided context.\n"
# #         "If answer is not present, say: 'Not in document'.\n\n"

# #         "Keep response concise:\n"
# #         "- Short explanation\n"
# #         "- Bullet points if useful\n"
# #         "- Max 120 words\n\n"

# #         "Avoid repeating the question.\n\n"

# #         "Context:\n{context}\n\n"
# #         "Question:\n{query}\n\n"
# #         "Answer:"
# #     )
# # )
 
# def rag_answer_node(state):
#     response = run_llm(rag_prompt, {
#         "context": state.get("context", ""),
#         "query": state.get("query")
#     })

#     return {
#         **state,
#         "final_answer": response
#     }












from app.core.llm_engine import llm
from app.core.prompts.rag_prompt import rag_prompt
from langchain_core.output_parsers import StrOutputParser

chain = rag_prompt | llm | StrOutputParser()


def rag_answer_node(state):
    response = chain.invoke({
        "context": state.get("context", ""),
        "query": state.get("query")
    })

    return {
        **state,
        "final_answer": response
    }