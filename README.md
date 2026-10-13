# 🧠 Synapse AI: Semantic Knowledge Synthesis Engine

**Synapse AI** is a high-performance full-stack application that transforms unstructured educational material into interactive, node-based knowledge graphs and automated spaced-repetition flashcards. It bridges the gap between passive reading and active recall by utilizing a compound AI pipeline.

## 🚀 Core Value Proposition
Most learners suffer from the "Illusion of Competence"—thinking they understand a topic because it feels familiar. Synapse AI solves this through:
1. **Non-Linear Synthesis:** Converting linear text into a semantic graph to visualize architectural dependencies.
2. **Active Recall:** Automatically generating challenging flashcards derived from high-centrality concepts to force cognitive retrieval.

## 🛠️ Technical Architecture

### The AI Pipeline
`Unstructured Text` $\rightarrow$ `Gemini 3.8 Flash` $\rightarrow$ `Pydantic Validation` $\rightarrow$ `NetworkX (Graph Theory)` $\rightarrow$ `React Flow (Visualization)`

- **Structured Extraction:** Uses the `Instructor` library to enforce strict JSON schemas from the LLM, ensuring zero-failure data transformation into a `KnowledgeGraph` model.
- **Semantic Weighting:** Implements **Degree Centrality** algorithms via `NetworkX` to automatically identify "Core Concepts" (nodes with the most connections).
- **Persistence Layer:** Utilizes **MongoDB Atlas** for session management, allowing users to save and reload their knowledge maps.
- **Vectorized Search:** Integrated `Sentence-Transformers` (`all-MiniLM-L6-v2`) to enable local cosine-similarity search across extracted concepts.

### Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, @xyflow/react.
- **Backend:** Python 3.11, FastAPI, Pydantic v2, Motor (Async MongoDB).
- **AI/ML:** Google Gemini API, Instructor, Sentence-Transformers, NetworkX.
- **Database:** MongoDB Atlas (Cloud).

## 🌟 Key Features
- **Dynamic Knowledge Mapping:** Automatic extraction of entities and relationships from raw text.
- **Interactive Graph Canvas:** Pan, zoom, and explore conceptual relationships with animated edges.
- **AI-Powered Flashcards:** One-click generation of active-recall questions based on specific node data.
- **Session History:** Persistent storage of generated graphs for long-term study.
- **Core Concept Highlighting:** Automatic visual weighting of primary concepts based on graph centrality.

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/synapse-ai.git
   cd synapse-ai
2. **Backend Setup:**
    ```bash
    cd backend
    python -m venv venv

    # Activate the environment
    Windows: .\venv\Scripts\activate
    Mac/Linux: source venv/bin/activate
    
    pip install -r requirements.txt

    # Create a .env file and add:
    
    GEMINI_API_KEY=your_key_here
    MONGO_URI=your_mongodb_uri_here
    python main.py
    ```

3. Frontend Setup:

    ```
    cd frontend
    npm install
    npm run dev
    ```

## 📈 Engineering Challenges & Solutions
**LLM Hallucinations in Structuring:** Solved by implementing a strict Pydantic-based validation layer and a manual JSON extraction pipeline for experimental models.

**Graph Layout Optimization:** Overcame "hairball" graph issues by implementing a **`spring_layout`** with adjusted k-constants to ensure readable node distribution.

**Frontend State Collapse:** Resolved React Flow rendering issues by implementing a viewport-relative absolute positioning system to prevent container height collapse. 