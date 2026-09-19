import re
from pathlib import Path


KNOWLEDGE_DIR = Path(__file__).resolve().parents[2] / "knowledge"


def _words(text):
    return set(re.findall(r"[a-z0-9]{3,}", text.lower()))


def _load_documents():
    documents = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.txt")):
        text = path.read_text(encoding="utf-8").strip()
        if text:
            documents.append((path.name, text))
    return documents


def retrieve_context(query, limit=3):
    query_words = _words(query)
    if not query_words:
        return ""

    ranked = []
    for name, text in _load_documents():
        paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text) if part.strip()]
        for paragraph in paragraphs:
            paragraph_words = _words(paragraph)
            overlap = query_words & paragraph_words
            if overlap:
                score = len(overlap) / max(len(query_words), 1)
                ranked.append((score, name, paragraph))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return "\n\n".join(f"[{name}]\n{text}" for _, name, text in ranked[:limit])
