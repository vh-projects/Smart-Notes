# app/graph/nodes/evaluator.py

from app.core.llm_engine import eval_llm
from app.core.prompts.evaluator_prompt import evaluator_prompt
from langchain_core.output_parsers import StrOutputParser
import json, re

chain = evaluator_prompt | eval_llm | StrOutputParser()


def _extract_json(text: str) -> dict:
    """Robustly extract JSON from LLM response, handling thinking blocks."""

    # ✅ Strip Gemini thinking/reasoning blocks
    text = re.sub(r"<thinking>.*?</thinking>", "", text, flags=re.DOTALL)
    text = re.sub(r"<thought>.*?</thought>", "", text, flags=re.DOTALL)

    # ✅ Strip markdown code fences
    text = re.sub(r"```(?:json)?", "", text)
    text = text.strip()

    # ✅ Greedy match — finds outermost { ... } correctly
    # [^{}]* fails on any nested structure, use .* with DOTALL instead
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found. Raw: {text[:300]}")

    raw_json = match.group(0).strip()
    return json.loads(raw_json)


def _fallback_evaluation():
    """Explicit fallback — always returns a valid dict."""
    return {
        "relevance_score": 0.5,
        "context_usage": 0.5,
        "hallucination": True,
        "route": "rag"
    }



def evaluator_node(state):
    query = state.get("query")
    answer = state.get("final_answer")
    context = state.get("context", "")
    route = state.get("route", "general")

    # ✅ Don't evaluate general answers against RAG context — they'll always score 0
    if route == "general" or not context:
        return {
            **state,
            "evaluation": {
                "relevance_score": 1.0,
                "context_usage": None,   # N/A for general
                "hallucination": False,
                "route": "general"
            }
        }

    try:
        raw_response = chain.invoke({
            "query": query,
            "answer": answer,
            "context": context[:600]
        }).strip()

        print(f"EVALUATOR RAW → {raw_response[:300]}")  # ✅ log first 200 chars to debug

        parsed= _extract_json(raw_response)

        evaluation = {
            "relevance_score": round(min(max(float(parsed.get("relevance_score", 0)), 0), 1), 3),
            "context_usage": round(min(max(float(parsed.get("context_usage", 0)), 0), 1), 3),
            "hallucination": bool(parsed.get("hallucination", True)),
            "route": "rag"
        }

        print(f"EVALUATOR SUCCESS → {evaluation}")

        # ✅ return is INSIDE try — only reached if no exception above
        return {**state, "evaluation": evaluation}



    except Exception as e:
        print("EVALUATOR ERROR →", e)
        
        # ✅ return is INSIDE except — evaluation variable always defined
        return {**state, "evaluation": _fallback_evaluation()}


