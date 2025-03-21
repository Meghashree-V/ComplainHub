from flask import Flask, request, jsonify
import re

app = Flask(__name__)

# Define keyword lists
high_priority_keywords = [
    "urgent", "teacher change", "faculty", "violence", "emergency", "harassment",
    "security issue", "safety", "theft", "medical", "mental health", "assault",
    "fire", "accident", "fight", "panic", "bullying", "academic help"
]

medium_priority_keywords = [
    "wifi", "network", "internet", "hostel", "library", "food", "mess", 
    "water", "electricity", "curfew", "washroom", "bathroom", "attendance",
    "noise", "mosquito", "lights", "slow connection", "video call", "broken fan",
    "room is hot", "dustbin", "maintenance", "air conditioning", "ac", "broken door"
]

low_priority_keywords = [
    "canteen", "menu", "spicy food", "insects", "chairs", "clean", "dirty",
    "trash", "not cleaned", "repetitive food", "boring", "common area", "messy", 
    "fan", "paint", "decor", "broken furniture", "too noisy", "bugs", "overflowing"
]

# Helper function: match keywords with variations
def match_keywords(complaint, keywords):
    tokens = re.findall(r'\b\w+\b', complaint.lower())
    for keyword in keywords:
        keyword_tokens = re.findall(r'\b\w+\b', keyword.lower())
        for token in keyword_tokens:
            for word in tokens:
                if token in word:
                    return True
    return False

# Priority prediction logic
def predict_priority(complaint):
    if match_keywords(complaint, high_priority_keywords):
        return "High"
    elif match_keywords(complaint, medium_priority_keywords):
        return "Medium"
    elif match_keywords(complaint, low_priority_keywords):
        return "Low"
    else:
        return "Low"  # default if nothing matches

# Flask route
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    complaint = data.get('complaint', '')
    priority = predict_priority(complaint)
    return jsonify({"priority": priority})

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
