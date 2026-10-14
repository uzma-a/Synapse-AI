import os
import instructor
import google.generativeai as genai
import numpy as np
from schemas import KnowledgeGraph, Flashcard
from typing import List

_embed_model = None

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3.8-flash")

client = instructor.from_gemini(
    client=model,
    mode=instructor.Mode.GEMINI_TOOLS,
)

class ConceptExtractor:
    @staticmethod
    def get_embed_model():
        global _embed_model
        if _embed_model is None:
            from sentence_transformers import SentenceTransformer  # lazy import
            _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
        return _embed_model

    @staticmethod
    def get_embeddings(texts: List[str]):
        return ConceptExtractor.get_embed_model().encode(
            texts, normalize_embeddings=True
        )

    @staticmethod
    def calculate_similarity(query, node_descriptions, embeddings):
        q = ConceptExtractor.get_embed_model().encode(
            [query], normalize_embeddings=True
        )
        return np.dot(embeddings, q.T).flatten()