from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load trained model and vectorizer
try:
    model = joblib.load("complaint_priority_model.pkl")
    vectorizer = joblib.load("tfidf_vectorizer.pkl")
    print("✅ Model and vectorizer loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model/vectorizer: {e}")

@app.route('/')
def home():
    return "🔥 Complaint Priority Model is Running! 🔥"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Receive JSON data
        data = request.get_json()
        print(f"📥 Received Request: {data}")

        # Validate request
        if not data or "complaint" not in data:
            return jsonify({"error": "Missing 'complaint' key in request"}), 400

        complaint_text = data["complaint"]

        # Transform complaint
        complaint_vectorized = vectorizer.transform([complaint_text])
        predicted_label = model.predict(complaint_vectorized)[0]  

        # Debugging
        print(f"🔮 Raw Model Prediction: {predicted_label}")

        # Ensure label mapping is correct
        label_mapping = {0: 1, 1: 2, 2: 3}
        predicted_priority = label_mapping.get(predicted_label, "Unknown")

        print(f"✅ Final Predicted Priority: {predicted_priority}")

        return jsonify({"complaint": complaint_text, "predicted_priority": predicted_priority})

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
