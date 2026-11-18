# app/core/prompts/evaluator_prompt.py

from langchain_core.prompts import PromptTemplate

evaluator_prompt = PromptTemplate(
    input_variables=["query", "answer", "context"],
    template="""You are a JSON-only evaluator. Output a single JSON object. No other text.


Query: {query}
Answer: {answer}
Context (first 600 chars): {context}


Score these three fields:
- hallucination (bool): true if answer contains facts NOT in context
- context_usage (float 0-1): how much the answer uses the context
- relevance_score (float 0-1): how well the answer addresses the query

JSON:
""")
