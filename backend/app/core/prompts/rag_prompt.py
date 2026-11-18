# app/core/prompts/rag_prompt.py

from langchain_core.prompts import PromptTemplate

rag_prompt = PromptTemplate(
    input_variables=["context", "query", "history"],
    template="""You are a technical documentation assistant with access to specific document content.

**Retrieved Context:**
{context}

**Conversation History:**
{history}

**Current Question:** {query}

**Instructions:**
1. Answer ONLY using information from the Retrieved Context above
2. If the context contains relevant information, provide a clear, well-structured answer
3. Use technical terminology appropriately and explain concepts step-by-step
4. If the context is incomplete but contains partial information, state what you know and what's missing
5. NEVER make up information not present in the context
6. If tables/data are in the context, present them clearly
7. Reference specific sections when helpful (e.g., "According to the context...")

**Answer:**"""
)
