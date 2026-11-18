# app/graph/nodes/router.py

from app.core.rag_service import get_rag_context
from app.core.llm_engine import llm  # Use main llm
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
import ast

# ✅ IMPROVED: Multi-strategy expansion
expansion_prompt = PromptTemplate(
    input_variables=["query"],
    template=(
        "Generate 4 diverse search queries for: '{query}'\n\n"
        "1. Synonym variation (different words, same meaning)\n"
        "2. Acronym/abbreviation expansion (if applicable)\n"
        "3. Broader concept query\n"
        "4. Technical detail query\n\n"
        "Return ONLY a Python list of 4 strings.\n"
        "Example: ['machine learning algorithms', 'ML techniques', 'artificial intelligence methods', 'supervised learning models']\n\n"
        "List:"
    )
)

expansion_chain = expansion_prompt | llm | StrOutputParser()

def expand_query(query: str) -> list:
    """Generate diverse query variations for better retrieval."""
    try:
        raw = expansion_chain.invoke({"query": query}).strip()
        # Handle both list format and line-by-line format
        if raw.startswith('['):
            expansions = ast.literal_eval(raw)
        else:
            expansions = [line.strip().strip('"-') for line in raw.split('\n') if line.strip()]
        
        if isinstance(expansions, list) and expansions:
            # Return original + up to 4 unique expansions
            unique_expansions = [query]
            for exp in expansions:
                if exp and exp != query and exp not in unique_expansions:
                    unique_expansions.append(exp)
                if len(unique_expansions) >= 5:  # Original + 4 expansions
                    break
            return unique_expansions
    except Exception as e:
        print(f"⚠️ QUERY EXPANSION FAILED → {e}")
    
    return [query]


def router_node(state):
    """
    Pure score-based routing with smart threshold zones.
    NO LLM calls during routing — saves quota and latency.
    """
    query = state.get("query")
    doc_id = state.get("doc_id")

    # ✅ Initial retrieval with relaxed threshold
    original_context, original_sources, original_scores = get_rag_context(
        query, doc_id, top_k=5  # ✅ Increased from 3
    )
    original_max_score = max(original_scores) if original_scores else 0.0
    print(f"📊 ORIGINAL QUERY SCORE → {original_max_score:.3f}")

    # ✅ IMPROVED THRESHOLDS
    HIGH_THRESHOLD   = 0.50   # Lowered from 0.55 — strong match → RAG
    HYBRID_THRESHOLD = 0.28   # Lowered from 0.30 — weak match → hybrid
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # ZONE 1: Pure General (< 0.28)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if original_max_score < HYBRID_THRESHOLD:
        print(f"🔀 ROUTER → general | score: {original_max_score:.3f}")
        return {
            **state, 
            "route": "general", 
            "context": "", 
            "sources": [], 
            "score": original_max_score
        }

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # ZONE 2: Hybrid (0.28 - 0.50)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if HYBRID_THRESHOLD <= original_max_score < HIGH_THRESHOLD:
        print(f"🔀 ROUTER → hybrid | score: {original_max_score:.3f}")
        # Pass the best chunks we have, synthesizer will supplement with general knowledge
        return {
            **state,
            "route": "hybrid",
            "context": original_context,
            "sources": original_sources,
            "score": original_max_score
        }

    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # ZONE 3: Full RAG (≥ 0.50) — Query Expansion + Fusion
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print(f"🚀 HIGH SCORE → Expanding query for better coverage...")
    expanded_queries = expand_query(query)
    print(f"📝 EXPANDED QUERIES → {expanded_queries}")
    
    # Collect chunks from all query variations
    all_contexts, all_scores = _collect_chunks_with_rrf(
        expanded_queries, doc_id
    )
    
    if not all_contexts:
        # Fallback to original context if expansion failed
        all_contexts = original_sources
    
    merged = "\n\n---\n\n".join(all_contexts[:10])  # ✅ Cap at 10 chunks
    
    print(f"🎯 ROUTER → rag | score: {original_max_score:.3f} | chunks: {len(all_contexts)}")
    return {
        **state, 
        "route": "rag", 
        "context": merged, 
        "sources": all_contexts[:10], 
        "score": original_max_score
    }


def _collect_chunks_with_rrf(queries: list, doc_id: str, k: int = 60):
    """
    Reciprocal Rank Fusion across multiple queries.
    RRF formula: score = Σ(1 / (k + rank)) for each query
    """
    from collections import defaultdict
    
    chunk_scores = defaultdict(lambda: {'text': '', 'rrf_score': 0.0, 'max_sim': 0.0})
    
    for query in queries:
        context, sources, scores = get_rag_context(query, doc_id, top_k=8)
        
        if not context:
            continue
        
        chunks = context.split("\n\n---\n\n")
        
        for rank, (chunk, score) in enumerate(zip(chunks, scores), start=1):
            chunk = chunk.strip()
            if not chunk:
                continue
            
            # Use chunk text as key for deduplication
            chunk_key = chunk[:100]  # First 100 chars as unique identifier
            
            # RRF score accumulation
            chunk_scores[chunk_key]['text'] = chunk
            chunk_scores[chunk_key]['rrf_score'] += 1.0 / (k + rank)
            chunk_scores[chunk_key]['max_sim'] = max(
                chunk_scores[chunk_key]['max_sim'], 
                score
            )
    
    # Sort by RRF score (primary) and max similarity (tiebreaker)
    sorted_chunks = sorted(
        chunk_scores.values(),
        key=lambda x: (x['rrf_score'], x['max_sim']),
        reverse=True
    )
    
    texts = [item['text'] for item in sorted_chunks]
    scores = [item['max_sim'] for item in sorted_chunks]
    
    print(f"✅ RRF FUSION → {len(texts)} unique chunks from {len(queries)} queries")
    
    return texts, scores