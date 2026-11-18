# app/core/llm_engine.py

# from app.core.config import NVIDIA_API_KEY
# from langchain_nvidia_ai_endpoints import ChatNVIDIA
import os


# llm = ChatNVIDIA(
#     model="meta/llama-3.1-70b-instruct",
#     api_key=os.getenv("NVIDIA_API_KEY"),
#     temperature=0.7,
#     max_tokens=1024
# )




# from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_groq import ChatGroq

# ============================================================
# Configuration
# ============================================================

# NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
GROQ_API_KEY= os.getenv("GROQ_API_KEY")

# "meta/llama-3.1-70b-instruct"
MAIN_MODEL= "meta/llama-3.3-70b-instruct"
MAIN_MODEL_GROQ= "openai/gpt-oss-120b"

# "meta/llama-3.1-8b-instruct"
EVAL_MODEL= "meta/llama-3.2-3b-instruct"

# "llama-3.1-8b-instant"
EVAL_MODEL_GROQ= "openai/gpt-oss-20b"

# ============================================================
# Main LLM (Non-streaming)
# Used everywhere graph.invoke() is still called.
# ============================================================

# llm = ChatNVIDIA(
#     model=MAIN_MODEL,
#     api_key=NVIDIA_API_KEY,
#     temperature=0.7,
#     max_tokens=1024,
# )


llm = ChatGroq(
            model=MAIN_MODEL_GROQ,
            api_key=GROQ_API_KEY,
            temperature=0.7,
            max_tokens=1024,
            timeout=120,
)

# ============================================================
# Streaming LLM
# Used by /query-stream endpoint.
# Supports .astream()
# ============================================================

# streaming_llm = ChatNVIDIA(
#     model=MAIN_MODEL,
#     api_key=NVIDIA_API_KEY,
#     temperature=0.7,
#     max_tokens=1024,
#     streaming=True,
# )


streaming_llm= ChatGroq(
            model=MAIN_MODEL_GROQ,
            api_key=GROQ_API_KEY,
            temperature=0.7,
            max_tokens=1024,
            # timeout=120,
)

# ============================================================
# Evaluator LLM
# Faster + deterministic
# ============================================================

# eval_llm = ChatNVIDIA(
#     model=EVAL_MODEL,
#     api_key=NVIDIA_API_KEY,
#     temperature=0.0,
#     max_tokens=200,
# )

eval_llm= ChatGroq(
            model=EVAL_MODEL_GROQ,
            api_key=GROQ_API_KEY,
            temperature=0.0,
            max_tokens=200,
)

# ============================================================
# Helper getters
# (optional, but keeps imports clean)
# ============================================================

def get_llm():
    """
    Standard synchronous LLM.
    """
    return llm


def get_streaming_llm():
    """
    Streaming LLM.
    Use with:

        async for chunk in llm.astream(...):
            ...
    """
    return streaming_llm


def get_eval_llm():
    """
    Evaluator model.
    """
    return eval_llm

