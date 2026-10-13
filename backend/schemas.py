from pydantic import BaseModel, Field
from typing import List, Optional

class Node(BaseModel):
    id: str = Field(..., description="Unique identifier for the concept (e.g., 'quantum_entanglement')")
    label: str = Field(..., description="Short, human-readable title of the concept")
    description: str = Field(..., description="A concise 1-2 sentence explanation of the concept")
    importance: float = Field(default=0.5, description="Importance score from 0 to 1")

class Edge(BaseModel):
    source: str = Field(..., description="The ID of the source node")
    target: str = Field(..., description="The ID of the target node")
    relationship: str = Field(..., description="The nature of the connection (e.g., 'causes', 'is a part of', 'contradicts')")

class KnowledgeGraph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class Flashcard(BaseModel):
    question: str
    answer: str
    node_id: str

class ExtractionRequest(BaseModel):
    text: str

class SearchRequest(BaseModel):
    query: str