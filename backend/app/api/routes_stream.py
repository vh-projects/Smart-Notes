# app/api/routes_stream.py


import json

from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse

from app.core.mongo import conversations
from app.graph.stream_runner import stream_graph

router = APIRouter()


@router.post("/query-stream")
async def query_stream(
    doc_id: str = Form(...),
    question: str = Form(...)
):

    conversations.update_one(
        {"doc_id": doc_id},
        {
            "$push": {
                "history": {
                    "role": "user",
                    "content": question
                }
            }
        },
        upsert=True,
    )

    document = conversations.find_one(
        {"doc_id": doc_id}
    )

    history = []

    if document:

        history = document.get("history", [])[-10:]

    history_text = "\n".join(
        [
            f"{msg['role'].title()}: {msg['content']}"
            for msg in history
        ]
    )

    state = {
        "query": question,
        "doc_id": doc_id,
        "history": history_text,
        "route": None,
        "context": None,
        "sources": [],
        "score": 0,
        "evaluation": None,
        "final_answer": None,
    }

    async def event_generator():

        answer = ""

        try:

            async for event in stream_graph(state):

                event_name = event["event"]

                # ---------------- Token ----------------

                if event_name == "token":

                    answer += event["data"]

                # ---------------- Done ----------------

                elif event_name == "done":

                    conversations.update_one(
                        {"doc_id": doc_id},
                        {
                            "$push": {
                                "history": {
                                    "role": "assistant",
                                    "content": answer
                                }
                            }
                        },
                    )

                yield (
                    f"event: {event_name}\n"
                    f"data: {json.dumps(event['data'])}\n\n"
                )

        except Exception as e:

            yield (
                "event: error\n"
                f"data: {json.dumps({'message': str(e)})}\n\n"
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )