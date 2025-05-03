import joblib
from fastapi import FastAPI, Request
from pydantic import BaseModel
import uvicorn
import re

app = FastAPI()

# Load model
model = joblib.load('complaint_priority_model.joblib')

# Domain-specific keyword rules (must match training script)
KEYWORD_PRIORITY = {
    'academic': 'High',
    'exam': 'High',
    'professor': 'High',
    'teacher': 'High',
    'certificate': 'Low',
    'library': 'Low',
    'infrastructure': 'Medium',
    'lab': 'Medium',
    'plug': 'Low',
    'water': 'Medium',
    'emergency': 'High',
    'security': 'High',
    'guard': 'High',
    'food': 'Low',
    'canteen': 'Low',
    'mess': 'Low',
    'clean': 'High',
    'insect': 'High',
    'mosquito': 'Medium',
    'wifi': 'Medium',
    'ac': 'High',
    'fan': 'Low',
    'noise': 'Medium',
    'parking': 'Low',
    'bathroom': 'High',
    'leak': 'High',
    'lift': 'High',
    'hostel': 'High',
}

def keyword_priority(text):
    text = text.lower()
    for keyword, priority in KEYWORD_PRIORITY.items():
        if re.search(r'\\b' + re.escape(keyword) + r'\\b', text):
            return priority
    return None

class ComplaintRequest(BaseModel):
    complaint: str

@app.post("/predict_priority")
def predict_priority(req: ComplaintRequest):
    text = req.complaint
    rule_priority = keyword_priority(text)
    if rule_priority:
        return {"priority": rule_priority, "source": "rule"}
    pred = model.predict([text])[0]
    return {"priority": pred, "source": "ml"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
