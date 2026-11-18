# app/api/routes.py

from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import uuid, os, json, asyncio, time
from collections import defaultdict
from bson import ObjectId

from app.core.pdf_processor import extract_text_from_pdf
from app.core.embedding_engine import embed_and_store, embedder, qdrant, COLLECTION_NAME
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from app.core.mongo import conversations
from qdrant_client import QdrantClient
from app.core.config import QDRANT_URL, QDRANT_API_KEY

from app.graph.graph_builder import build_graph

from app.core.text_splitter import split_text

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Qdrant Client
qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    check_compatibility=False)

# In-memory (for fallback)
chat_histories = defaultdict(list)


# ---------------------------------------------------
# ✅ Upload endpoint
# ---------------------------------------------------
@router.post("/upload")
async def upload_pdf(file: UploadFile):
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(file_path)

    # chunks = [text[i:i + 1000] for i in range(0, len(text), 1000)]
    chunks= split_text(text)

    # ✅ STEP 4: Limit chunks
    MAX_CHUNKS = 300
    if len(chunks) > MAX_CHUNKS:
        print(f"⚠️ Too many chunks ({len(chunks)}), trimming to {MAX_CHUNKS}")
        chunks = chunks[:MAX_CHUNKS]



    try:
        await asyncio.to_thread(embed_and_store, chunks, doc_id)
    except RuntimeError as e:
        # ✅ surface embedding failures instead of silently succeeding
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")


    # ✅ Create MongoDB record
    conversations.insert_one({
        "doc_id": doc_id,
        "name": file.filename,
        "file_path": file_path,
        "qdrant_collection": COLLECTION_NAME,
        "history": [],
        "created_at": time.time(),
    })

    return {"doc_id": doc_id, "message": "PDF uploaded and processed successfully."}


# ---------------------------------------------------
# ✅ Streaming Upload endpoint (with Mongo insert)
# ---------------------------------------------------
@router.post("/upload-stream")
async def upload_stream(file: UploadFile):

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    async def generate_upload_events():
        try:
            yield f"data: {json.dumps({'status': '✅ File uploaded successfully. Starting processing...'})}\n\n"
            await asyncio.sleep(0.3)

            yield f"data: {json.dumps({'status': '📄 Extracting text from PDF...'})}\n\n"
            text = extract_text_from_pdf(file_path)

            yield f"data: {json.dumps({'status': '📊 Chunking document...'})}\n\n"
            chunks = split_text(text)
            
            MAX_CHUNKS = 300
            if len(chunks) > MAX_CHUNKS:
                print(f"⚠️ Too many chunks ({len(chunks)}), trimming to {MAX_CHUNKS}")
                chunks = chunks[:MAX_CHUNKS]

            # await asyncio.sleep(0.3)

            yield f"data: {json.dumps({'status': f'🧠 Embedding {len(chunks)} chunks...'})}\n\n"

            try:
                await asyncio.to_thread(embed_and_store, chunks, doc_id)

            except RuntimeError as e:
                # ✅ stream the error back to frontend instead of silent failure
                yield f"data: {json.dumps({'status': f'❌ Embedding error: {str(e)}'})}\n\n"
                yield "event: end\ndata: {}\n\n"
                return                



            # await asyncio.sleep(0.3)

            # ✅ Save chat info to MongoDB
            conversations.insert_one({
                "doc_id": doc_id,
                "name": file.filename,
                "file_path": file_path,
                "qdrant_collection": COLLECTION_NAME,
                "history": [],
                "created_at": time.time(),
            })

            yield f"data: {json.dumps({'status': '🎉 Done! You’re good to go.', 'doc_id': doc_id})}\n\n"
            yield "event: end\ndata: {}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'status': f'⚠️ Error: {str(e)}'})}\n\n"
            yield "event: end\ndata: {}\n\n"

    return StreamingResponse(generate_upload_events(), media_type="text/event-stream")


# ---------------------------------------------------
# ✅ Fetch All Chats (for Sidebar)
# ---------------------------------------------------
@router.get("/chats")
async def get_all_chats():
    try:
        chats = list(conversations.find({}, {"_id": 1, "name": 1, "doc_id": 1}))
        for c in chats:
            c["_id"] = str(c["_id"])
        return {"chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# ✅ Delete Chat (Qdrant + Mongo + File)
# ---------------------------------------------------
@router.delete("/chat/{chat_id}")
async def delete_chat(chat_id: str):
    try:
        chat = conversations.find_one({"_id": ObjectId(chat_id)})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        doc_id = chat.get("doc_id")

        # ✅ Delete embeddings from Qdrant
        try:
            qdrant.delete(
                collection_name=COLLECTION_NAME,
                points_selector=Filter(
                    must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
                ),
            )
        except Exception as e:
            print(f"⚠️ Qdrant delete failed: {e}")

        # ✅ Delete uploaded PDF file
        file_path = chat.get("file_path") or os.path.join("uploads", f"{doc_id}.pdf")
        if os.path.exists(file_path):
            os.remove(file_path)

        # ✅ Delete from MongoDB
        conversations.delete_one({"_id": ObjectId(chat_id)})

        return {"status": "success", "message": "Chat and embeddings deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ---------------------------------------------------
# ✅ Chat Query Endpoint (Persistent Memory)
# ---------------------------------------------------
@router.post("/query")
async def query_pdf(doc_id: str = Form(...), question: str = Form(...)):

    print(f"API DEBUG → doc_id: {doc_id} | question: {question} ")
    


    # ✅ Save user message
    conversations.update_one(
        {"doc_id": doc_id},
        {"$push": {"history": {"role": "user", "content": question}}},
        upsert=True
    )

    # ✅ Retrieve history
    doc = conversations.find_one({"doc_id": doc_id})
    history_list = doc["history"][-10:] if doc and "history" in doc else []

    structured_history = "\n".join(
        [f"{h['role'].title()}: {h['content']}" for h in history_list]
    )

    # ✅ Vector Search
    graph= build_graph()
    

    # remove later
    print("FINAL → sending to graph:", {
    "query": question,
    "doc_id": doc_id
    })


    initial_state = {
        "query": str(question),
        "doc_id": str(doc_id),
        "history": structured_history,
        "route": None,
        "context": None,
        "final_answer": None
    }

    # remove later
    print("FINAL STATE →", initial_state)

    result = graph.invoke(initial_state)

    answer = result["final_answer"]
    # context = result.get("context", "")

# ------------

    # Save assistant response
    conversations.update_one(
        {"doc_id": doc_id},
        {"$push": {"history": {"role": "assistant", "content": answer}}},
        upsert=True
    )
    print("EVALUATION →", result.get("evaluation"))
    return {
        "answer": answer,
        # "context_used": context,
        "sources": result.get("sources", []),
        "evaluation": result.get("evaluation", []),
        "history_count": len(history_list)
    }



@router.get("/conversations/{doc_id}")
async def get_conversation(doc_id: str):
    doc = conversations.find_one({"doc_id": doc_id})
    if not doc:
        return {"history": []}
    return {"history": doc.get("history", [])}

