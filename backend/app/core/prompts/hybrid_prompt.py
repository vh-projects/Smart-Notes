# app/core/prompts/hybrid_prompt.py
from langchain_core.prompts import PromptTemplate

hybrid_prompt = PromptTemplate(
    input_variables=["context", "query", "history"],
    template="""You are a helpful assistant with access to partial document information.

**Document Snippet (Partial Context):**
{context}

**Conversation History:**
{history}

**Question:** {query}

**Instructions:**
1. The document snippet above contains PARTIAL relevant information
2. Supplement it with your general knowledge to provide a complete answer
3. Clearly indicate which parts come from the document vs. your knowledge
4. Format: Start with what the document says, then add general context
5. Be honest about limitations - if the document doesn't cover key aspects, say so
6. Provide a helpful, complete answer that combines both sources

**Answer:**"""
)