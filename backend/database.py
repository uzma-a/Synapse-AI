from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

class DBManager:
    # This is the key: we create the client ONLY when called
    @staticmethod
    def get_db():
        if not MONGO_URI:
            raise ValueError("MONGO_URI environment variable is not set!")
        client = AsyncIOMotorClient(MONGO_URI)
        return client.synapse_db

    @staticmethod
    async def save_graph(user_id: str, graph_data: dict, original_text: str = ""):
        db = DBManager.get_db() # Dynamic connection
        await db.graphs.insert_one({
            "user_id": user_id,
            "text_preview": original_text[:100] + "...",
            "data": graph_data,
            "created_at": datetime.utcnow()
        })

    @staticmethod
    async def get_all_graphs(user_id: str):
        db = DBManager.get_db() # Dynamic connection
        cursor = db.graphs.find({"user_id": user_id}).sort("created_at", -1)
        graphs = []
        async for doc in cursor:
            graphs.append({
                "id": str(doc["_id"]),
                "text_preview": doc["text_preview"],
                "created_at": doc["created_at"],
                "data": doc["data"]
            })
        return graphs

    @staticmethod
    async def update_card_progress(card_id: str, rating: str):
        db = DBManager.get_db() # Dynamic connection
        intervals = {"Easy": 4, "Medium": 2, "Hard": 1}
        days = intervals.get(rating, 1)
        next_review = datetime.utcnow() + timedelta(days=days)

        await db.progress.update_one(
            {"card_id": card_id},
            {"$set": {"next_review": next_review, "last_rating": rating}},
            upsert=True
        )
        return next_review