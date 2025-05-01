import pandas as pd
import pickle
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# 1. Load dataset
df = pd.read_csv('complaints.csv')

# 2. Train model
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df['complaint'])
y = df['priority']
model = MultinomialNB()
model.fit(X, y)

# 3. Save model and vectorizer
with open("priority_model.pkl", "wb") as f:
    pickle.dump((vectorizer, model), f)

# 4. Flask API
app = Flask(__name__)
with open("priority_model.pkl", "rb") as f:
    vectorizer, model = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    text = data['text'].lower()

    # --- Rule-based override for domain knowledge ---
    high_keywords = ["exam", "teacher", "professor", "grading", "marks", "syllabus", "assignment", "academic", "attendance", "lecture"]
    medium_keywords = ["lab", "lift", "wifi", "water", "parking", "fan", "electric", "infrastructure", "classroom", "hostel", "bathroom", "library", "security", "gate", "noise"]
    low_keywords = ["canteen", "food", "mess", "campus", "parking", "cafeteria", "snack", "juice"]

    # Priority by rules
    if any(word in text for word in high_keywords):
        rule_priority = "High"
    elif any(word in text for word in medium_keywords):
        rule_priority = "Medium"
    elif any(word in text for word in low_keywords):
        rule_priority = "Low"
    else:
        rule_priority = None

    # ML prediction fallback
    if rule_priority:
        priority = rule_priority
    else:
        X = vectorizer.transform([text])
        priority = model.predict(X)[0]

    return jsonify({'priority': priority})

if __name__ == '__main__':
    app.run(port=5001)
