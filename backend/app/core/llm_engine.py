# # llm_engine.py

import google.generativeai as genai
from app.core.config import GEMINI_API_KEY
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

# ✅ Configure Gemini client
genai.configure(api_key=GEMINI_API_KEY)


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.4,
    max_output_tokens=500,
    convert_system_message_to_human=True
)


# def ask_gemini(context: str, question: str) -> str:
#     """
#     Ask Gemini a question based on document context using LangChain for better formatting and control.
#     """

#     try:
#         # ✅ Initialize Gemini LLM via LangChain
#         # llm = ChatGoogleGenerativeAI(
#         #     model="gemini-2.5-flash",
#         #     google_api_key=GEMINI_API_KEY,
#         #     temperature=0.4,
#         #     max_output_tokens=2048,
#         #     convert_system_message_to_human=True
#         # )

#         # ✅ Define a structured, formatting-rich prompt
#         prompt = PromptTemplate(
#             input_variables=["context", "question"],
#             template=(
#                 "You are an intelligent document assistant.\n"
#                 "Answer the user's question strictly using the provided context.\n"
#                 "Respond in **clean Markdown formatting** with:\n"
#                 "- Headings (##)\n"
#                 "- Bullet points and numbered lists\n"
#                 "- **Bold keywords**\n"
#                 "- Tables (if useful)\n"
#                 "- Code blocks when necessary\n"
#                 "- Proper spacing and paragraphs for readability\n\n"
#                 "### 📄 Document Context:\n{context}\n\n"
#                 "### 💬 User Question:\n{question}\n\n"
#                 "### 🧠 Answer:"
#             )
#         )

#         # ✅ Combine the prompt, model, and parser (modern LCEL chain)
#         chain = prompt | llm | StrOutputParser()

#         # ✅ Run the chain
#         response = chain.invoke({"context": context, "question": question})

#         return response.strip() if response else "⚠️ No response from Gemini."

#     except Exception as e:
#         return f"⚠️ Gemini (LangChain) error: {str(e)}"





# app/core/llm_engine.py


# def run_llm(prompt, inputs: dict):
#     try:
#         chain = prompt | llm | StrOutputParser()
#         return chain.invoke(inputs)
#     except Exception as e:
#         return f"⚠️ LLM error: {str(e)}"