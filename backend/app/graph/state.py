from typing import TypedDict, Optional

class GraphState(TypedDict):
    query: str
    doc_id:str

    route: Optional[str]

    context: Optional[str]
    sources: Optional[str]

    history: Optional[str]

    evaluation: Optional[dict]

    general_answer: Optional[str]

    final_answer: Optional[str]