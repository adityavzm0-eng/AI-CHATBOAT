import os
from google import genai
from rag import retrieve_context

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def get_ai_response(message):
    context = retrieve_context(message)
    prompt = f"""You are Siddhu's Chatbot, a helpful AI assistant.
Use the retrieved context below when it is relevant. If the context does not answer the question, say so and answer from your general knowledge.

Retrieved context:
{context or 'No matching documents were found.'}

User message:
{message}"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text