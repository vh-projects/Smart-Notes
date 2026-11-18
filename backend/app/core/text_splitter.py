# app/core/text_splitter.py

from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=150,
    separators=["\n\n", "\n", ".", " ", ""]
)

def split_text(text):
    
    chunks = splitter.split_text(text)

    # CLEANING STEP (VERY IMPORTANT)
    cleaned_chunks = []
    for chunk in chunks:
        chunk = chunk.strip()
        if len(chunk) > 50:   # ❌ remove tiny garbage chunks
            cleaned_chunks.append(chunk)

    return cleaned_chunks