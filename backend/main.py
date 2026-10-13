from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import ExtractionRequest, SearchRequest
from extractor import ConceptExtractor
from graph_engine import GraphEngine
import numpy as np
from database import DBManager

app = FastAPI(title="Edge-Optimized Study Graph API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for embeddings of the current session
session_store = {"embeddings": None, "descriptions": []}

@app.post("/api/extract-graph")
async def extract_graph(request: ExtractionRequest):
    try:
        kg = ConceptExtractor.extract_graph(request.text)
        rf_data = GraphEngine.generate_react_flow_data(kg)
        
        # Save as a new session with the text preview
        try:
            await DBManager.save_graph("default_user", rf_data, request.text)
        except Exception as db_e:
            print(f"DB Error: {db_e}")
            
        return rf_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to fetch history
@app.get("/api/history")
async def get_history():
    try:
        history = await DBManager.get_all_graphs("default_user")
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/rate-card")
async def rate_card(payload: dict):
    # payload: { "card_id": "...", "rating": "Easy/Medium/Hard" }
    next_date = await DBManager.update_card_progress(payload['card_id'], payload['rating'])
    return {"status": "success", "next_review": next_date}

@app.post("/api/generate-flashcards")
async def generate_cards(payload: dict):
    # payload: { "label": "...", "description": "..." }
    cards = ConceptExtractor.generate_flashcards(payload['label'], payload['description'])
    return cards

@app.post("/api/search-concepts")
async def search_concepts(request: SearchRequest):
    if session_store["embeddings"] is None:
        raise HTTPException(status_code=400, detail="No graph extracted yet")
    
    sims = ConceptExtractor.calculate_similarity(
        request.query, 
        session_store["descriptions"], 
        session_store["embeddings"]
    )
    
    results = []
    for idx, score in enumerate(sims):
        if score > 0.4: # Similarity threshold
            results.append({"description": session_store["descriptions"][idx], "score": float(score)})
            
    return sorted(results, key=lambda x: x['score'], reverse=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)