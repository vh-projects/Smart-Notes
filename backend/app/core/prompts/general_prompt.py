from langchain_core.prompts import PromptTemplate


general_prompt= PromptTemplate(
    input_variables= ["query"],
    template= (
        "Answer clearly and concisely.\n"
        "Do NOT rely on any external document.\n"
        "Avoid long explanations.\n"
        "Use bullet points if helpful.\n"
        "Max 150 words.\n\n"
        "Question:\n{query}\n\n"
        "Answer:"        
    )
)