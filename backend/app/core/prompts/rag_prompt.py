# rag_prompt.py
from langchain_core.prompts import PromptTemplate


rag_prompt = PromptTemplate(
    input_variables=["context", "query"],
    template=(
        "You are a document intelligence system.\n"
        "Answer ONLY using the provided context.\n"
        "If answer is not present, say: 'Not in document'.\n\n"

        "Keep response concise:\n"
        "- Short explanation\n"
        "- Bullet points if useful\n"
        "- Max 120 words\n\n"

        "Avoid repeating the question.\n\n"

        "Context:\n{context}\n\n"
        "Question:\n{query}\n\n"
        "Answer:"
    )
)
