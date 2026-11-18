# app/graph/state.py

from typing import Optional, List, TypedDict


class GraphState(TypedDict):

    query: str
    doc_id: str

    route: Optional[str]

    context: Optional[str]
    sources: Optional[List]
    score: Optional[float]

    history: Optional[str]

    evaluation: Optional[dict]

    general_answer: Optional[str]

    final_answer: Optional[str]