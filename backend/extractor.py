import google.generativeai as genai
import json
import re
from sentence_transformers import SentenceTransformer
import numpy as np
from schemas import KnowledgeGraph, Flashcard
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Using your specific working model
MODEL_NAME = "gemini-3.8-flash" 
model = genai.GenerativeModel(MODEL_NAME)

embed_model = SentenceTransformer('all-MiniLM-L6-v2')

class ConceptExtractor:
    @staticmethod
    def extract_graph(text: str) -> KnowledgeGraph:
        print("--- 🛠️ Backend: Starting Manual Extraction ---")
        
        # Create a very strict prompt to force raw JSON output
        prompt = f"""
        You are an expert knowledge engineer. Extract a conceptual graph from the text.
        Identify key concepts as nodes and their logical relationships as edges.
        
        Return the result ONLY as a raw JSON object with this exact structure:
        {{
          "nodes": [
            {{ "id": "unique_id", "label": "Concept Name", "description": "1 sentence explanation", "importance": 0.8 }}
          ],
          "edges": [
            {{ "source": "id1", "target": "id2", "relationship": "relationship type" }}
          ]
        }}
        
        Do not include markdown formatting, do not include ```json, just return the raw JSON object.
        
        Material:
        {text}
        """
        
        try:
            # Call Gemini directly without the instructor wrapper
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up the response in case the AI still includes markdown ```json blocks
            if response_text.startswith("```"):
                response_text = re.sub(r'^```json\s*|```$', '', response_text, flags=re.MULTILINE).strip()
            
            # Convert string to dictionary
            data = json.loads(response_text)
            
            # Validate using the Pydantic schema
            graph = KnowledgeGraph(**data)
            print("--- ✅ Backend: Manual Extraction Successful! ---")
            return graph
            
        except Exception as e:
            print(f"--- ❌ Backend Error during extraction: {str(e)} ---")
            # For debugging: print the raw text the AI returned
            try:
                print(f"Raw AI Response: {response.text}")
            except:
                pass
            raise e

    @staticmethod
    def generate_flashcards(node_label: str, node_desc: str) -> List[Flashcard]:
        print(f"--- 🛠️ Backend: Generating cards for {node_label} ---")
        
        prompt = f"""
        Create 3 challenging active-recall flashcards for the concept: {node_label}.
        Description: {node_desc}
        
        Return ONLY a JSON list of objects:
        [
          {{ "question": "...", "answer": "...", "node_id": "{node_label}" }}
        ]
        Do not include markdown.
        """
        
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = re.sub(r'^```json\s*|```$', '', text, flags=re.MULTILINE).strip()
            
            data = json.loads(text)
            # Convert list of dicts to list of Flashcard models
            return [Flashcard(**item) for item in data]
        except Exception as e:
            print(f"--- ❌ Backend Error during flashcards: {str(e)} ---")
            # Fallback: return one simple card so the UI doesn't crash
            return [Flashcard(question="Recall this concept", answer=node_desc, node_id=node_label)]

    @staticmethod
    def get_embeddings(texts: List[str]):
        return embed_model.encode(texts)

    @staticmethod
    def calculate_similarity(query: str, node_descriptions: List[str], embeddings: np.ndarray):
        query_emb = embed_model.encode([query])
        similarities = np.dot(embeddings, query_emb.T).flatten()
        return similarities