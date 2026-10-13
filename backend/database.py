from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client.synapse_db

class DBManager:
    @staticmethod
    async def save_graph(user_id: str, graph_data: dict, original_text: str = ""):
        # CHANGE: We use insert_one instead of update_one
        await db.graphs.insert_one({
            "user_id": user_id,
            "text_preview": original_text[:100] + "...", # Save a snippet for the history list
            "data": graph_data,
            "created_at": datetime.utcnow() # This records exactly WHEN it was saved
        })
        print("--- ✅ DB: New graph session inserted successfully ---")

    @staticmethod
    async def get_all_graphs(user_id: str):
        # Fetch all graphs for this user, sorted by newest first
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
        # Simplified SM-2 logic:
        # Easy: Review in 4 days | Medium: 2 days | Hard: 1 day
        intervals = {"Easy": 4, "Medium": 2, "Hard": 1}
        days = intervals.get(rating, 1)
        next_review = datetime.utcnow() + timedelta(days=days)

        await db.progress.update_one(
            {"card_id": card_id},
            {"$set": {"next_review": next_review, "last_rating": rating}},
            upsert=True
        )
        return next_review