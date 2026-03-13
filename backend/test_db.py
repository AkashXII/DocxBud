from database import db

result = db.command("ping")
print("MongoDB connected! Response:", result)