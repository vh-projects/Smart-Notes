# app/core/llm_engine.py

import os

from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_groq import ChatGroq

# ============================================================
# Configuration
# ============================================================

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
GROQ_API_KEY= os.getenv("GROQ_API_KEY")

# "meta/llama-3.1-70b-instruct"
MAIN_MODEL= "openai/gpt-oss-120b"
MAIN_MODEL_GROQ= "openai/gpt-oss-120b"

# "meta/llama-3.1-8b-instruct"
EVAL_MODEL= "openai/gpt-oss-20b" 

# "llama-3.1-8b-instant"
EVAL_MODEL_GROQ= "openai/gpt-oss-20b"

# ============================================================
# Main LLM (Non-streaming)
# Used everywhere graph.invoke() is still called.
# ============================================================


llm = ChatGroq(
            model=MAIN_MODEL_GROQ,
            api_key=GROQ_API_KEY,
            temperature=0.7,
            max_tokens=1024,
            # timeout=120,
)


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

