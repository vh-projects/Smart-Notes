# app/graph/nodes/evaluator.py
from app.core.llm_engine import llm
from app.core.prompts.evaluator_prompt import evaluator_prompt
from langchain_core.output_parsers import StrOutputParser
import json

chain = evaluator_prompt | llm | StrOutputParser()


def evaluator_node(state):
    query = state.get("query")
    answer = state.get("final_answer")
    context = state.get("context", "")

    try:
        response = chain.invoke({
                "query": query,
                "answer": answer,
                "context": context
            })

        # 🔥 clean response (important)
        response = response.strip()

        # sometimes model adds ```json
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()

        evaluation = json.loads(response)

    except Exception as e:
        print("EVALUATOR ERROR →", e)

        evaluation = {
            "relevance_score": 0.5,
            "context_usage": 0.5,
            "hallucination": True
        }

    return {
        **state,
        "evaluation": evaluation
    }