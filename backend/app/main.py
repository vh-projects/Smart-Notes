# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.routes_stream import router as stream_router


app = FastAPI(title="SmartNotes Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(router, prefix="/api")

app.include_router(router, prefix="/api")
app.include_router(stream_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "SmartNotes API is running 🚀"}
