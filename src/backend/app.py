import os

from flask import Flask, jsonify, request
from dotenv import load_dotenv

load_dotenv()

try:
    from .chatboat import get_ai_response
except ImportError:
    from chatboat import get_ai_response

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    allowed_origins = {
        os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5173"),
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    }
    origin = request.headers.get("Origin")
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


@app.route("/", methods=["GET"])
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Siddh's Chatbot backend"})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "A non-empty message is required."}), 400

    try:
        response = get_ai_response(message.strip())
    except Exception as error:
        app.logger.exception("AI response failed")
        if "429" in str(error) or "RESOURCE_EXHAUSTED" in str(error):
            return jsonify({"error": "Gemini API quota exceeded. Please wait and try again, or check your Gemini billing and limits."}), 429
        return jsonify({"error": "The chatbot is temporarily unavailable."}), 502

    return jsonify({"response": response})


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1")