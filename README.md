# <img width="30" height="30" alt="image" src="https://github.com/user-attachments/assets/99cf7748-6ccf-4356-81ab-6287571ad0cc" /> # SmartNotes

Your intelligent PDF & notes assistant — upload documents, ask questions, and pick up conversations exactly where you left off.

![React](https://img.shields.io/badge/React-18+-61dafb?style=flat-square) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square) ![LangGraph](https://img.shields.io/badge/LangGraph-latest-orange?style=flat-square) ![Qdrant](https://img.shields.io/badge/Qdrant-VectorDB-purple?style=flat-square) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square)

---

## What It Does

SmartNotes turns static PDFs into interactive knowledge bases. Upload a research paper, textbook, or set of notes — SmartNotes extracts, embeds, and indexes the content, then lets you have a full conversation with it. Every chat is saved to MongoDB, so you can return to any document and continue exactly where you left off, like a personal study assistant that never forgets.

Under the hood, it doesn't just retrieve chunks blindly. A **multi-agent LangGraph router** decides — based on how well your query matches the document — whether to do full retrieval, blend document context with general knowledge, or fall back to the LLM entirely. The answer is always calibrated to what the document actually contains.

---

## Architecture

### The Three-Tier Router

Every user query passes through a scoring pipeline before any retrieval happens. The similarity score between the query and indexed document embeddings determines the route:

```
User Query
    │
    ▼
┌─────────┐
│  Router │  (similarity score against Qdrant embeddings)
└────┬────┘
     │
     ├── score ≥ 0.50 ──► RAG Agent       → full retrieval + query expansion → Synthesizer
     │
     ├── score 0.28–0.50 ► Hybrid Agent   → doc snippet + general LLM knowledge → Synthesizer
     │
     └── score < 0.28 ──► General Agent   → pure LLM, no retrieval → Synthesizer
                                                        │
                                                        ▼
                                                   Evaluator
                                                        │
                                                        ▼
                                                    Response
```

### GraphState

The LangGraph state object passed across all nodes:

| Key | Type | Description |
|---|---|---|
| `query` | str | Raw user input |
| `doc_id` | str | Active document reference |
| `route` | str | Resolved route (rag / hybrid / general) |
| `context` | str | Retrieved or synthesized context |
| `sources` | List | Source chunks with metadata |
| `score` | float | Similarity score that determined the route |
| `history` | list | Conversation history for multi-turn context |
| `evaluation` | str | LLM-as-judge relevance verdict |
| `general_answer` | str | General agent fallback response |
| `final_answer` | str | Output delivered to the user |

### RAG Agent (score ≥ 0.50)
Expands the query before retrieval — generating semantically related phrasings to improve chunk recall from Qdrant — then synthesizes across the retrieved context.

### Hybrid Agent (score 0.28–0.50)
Pulls the most relevant document snippet but supplements it with the LLM's broader knowledge, useful when the document partially addresses the query.

### General Agent (score < 0.28)
The query is too far from document content to retrieve meaningfully — the LLM responds directly from its own knowledge without hallucinating a document connection.

---

## Features

**Persistent Conversations** — All chats stored in MongoDB Atlas. Return to any document thread and continue the conversation with full history intact.

**Multi-Document Support** — Each PDF gets its own dedicated embedding collection in Qdrant and its own chat thread. Documents never bleed into each other.

**Real-Time Upload Feedback** — An interactive progress view shows each step as it happens: extracting text → chunking → generating embeddings → indexing.

**Clean Storage Management** — Deleting a chat removes the file, its Qdrant embeddings, and conversation history atomically — no orphaned data.

**Markdown-Styled Responses** — AI responses render with proper formatting, code blocks, and structure, not raw text.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TailwindCSS + Shadcn UI + Framer Motion |
| Backend | FastAPI (Python) |
| Agent Orchestration | LangGraph + LangChain |
| Embeddings | BGE-base-en-v1.5 (SentenceTransformers) |
| Vector Database | Qdrant |
| Conversation Store | MongoDB Atlas |
| LLM | Meta/llama-3.1-70b-instruct | Meta/llama-3.1-8b-instruct
| PDF Parsing | PyPDF |
| Deployment | Frontend → Vercel, Backend → HuggingFace Spaces |

---

## Project Structure

```
smartnotes/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entrypoint
│   │   ├── api/
│   │   │   ├── routes.py              
│   │   ├── graph/
│   │   │   ├── nodes/
│   │   │   │   ├── router.py         # Similarity-based routing logic
│   │   │   │   ├── general_agent.py
│   │   │   │   ├── rag_agent.py
│   │   │   │   ├── rag_answer_node.py
│   │   │   │   ├── hybrid_agent.py        
│   │   │   │   ├── synthesizer.py    # Response synthesis node
│   │   │   │   └── evaluator.py      # LLM-as-judge relevance check
│   │   │   ├── state.py              # GraphState definition
│   │   │   └── graph_builder.py     
│   │   ├── core/
│   │   │   ├── embedding_engine.py    # BGE embedding pipeline
│   │   │   ├── llm_engine.py        
│   │   │   ├── config.py
│   │   │   ├── rag_service.py    
│   │   │   ├── mongo.py         # Conversation persistence
│   │   │   └── pdf_processor.py    # PyPDF extraction + chunking
│   │   └── models/        
│   │   
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   └── public/
└── requirements.txt
```

---

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables

Create a `.env` file in `backend/`:

```env
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/smartnotes
GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Why This Approach

Most RAG systems retrieve blindly regardless of how relevant the document actually is to the query — leading to hallucinated citations or irrelevant context. The three-tier router solves this by making retrieval conditional on similarity score, so the system only pulls from the document when it's genuinely useful. The LLM-as-judge evaluator adds a second relevance check after synthesis, catching cases where retrieved context looked relevant by score but didn't actually answer the question.

---

