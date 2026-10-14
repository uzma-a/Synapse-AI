import instructor
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
import numpy as np
from schemas import KnowledgeGraph, Flashcard
from typing import List

# Global variable to hold the model once it's loaded
_embed_model = None

genai.configure(api_key="GEMINI_API_KEY")
model = genai.GenerativeModel("gemini-3.8-flash") # Use your working model name

client = instructor.from_gemini(
    client=model,
    mode=instructor.Mode.GEMINI_TOOLS,
)

class ConceptExtractor:
    # HELPER METHOD to load model only when needed
    @staticmethod
    def get_embed_model():
        global _embed_model
        if _embed_model is None:
            print("--- ⏳ Loading SentenceTransformer model (this may take a minute)... ---")
            _embed_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("--- ✅ Model loaded successfully ---")
        return _embed_model

    @staticmethod
    def extract_graph(text: str) -> KnowledgeGraph:
        print("--- 🛠️ Backend: Starting Extraction ---")
        # ... (rest of your extract_graph code)
        return client.chat.completions.create(...)

    @staticmethod
    def get_embeddings(texts: List[str]):
        # USE THE HELPER instead of the global variable
        model = ConceptExtractor.get_embed_model()
        return model.encode(texts)

    @staticmethod
    def calculate_similarity(query: str, node_descriptions: List[str], embeddings: np.ndarray):
        # USE THE HELPER instead of the global variable
        model = ConceptExtractor.get_embed_model()
        query_emb = model.encode([query])
        similarities = np.dot(embeddings, query_emb.T).flatten()
        return similarities