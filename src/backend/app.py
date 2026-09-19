from flask import Flask, jsonify, request
from dotenv import load_dotenv

load_dotenv()

from chatboat import get_ai_response

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5173"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
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
    except Exception:
        app.logger.exception("AI response failed")
        return jsonify({"error": "The chatbot is temporarily unavailable."}), 502

    return jsonify({"response": response})


if __name__ == "__main__":
    app.run(debug=True)