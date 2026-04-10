from langchain_core.prompts import PromptTemplate

router_prompt= PromptTemplate(
    input_variables=["query"],
    template="""
Classify the query into ONE:

- rag → requires user's uploaded document
- general → general knowledge

Query:
{query}

Return ONLY one word:
rag or general
"""
)