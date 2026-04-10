# evaluator_prompt.py

from langchain_core.prompts import PromptTemplate

evaluator_prompt = PromptTemplate(
    input_variables=["query", "answer", "context"],
    template="""
Evaluate the AI response.

Rules:
- Be strict
- Output ONLY valid JSON
- No explanation

Query:
{query}

Answer:
{answer}

Context:
{context}

Return:
{
  "relevance_score": number (0 to 1),
  "context_usage": number (0 to 1),
  "hallucination": true/false
}
"""
)