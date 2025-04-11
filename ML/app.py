from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load model (pipeline includes vectorizer)
model = joblib.load("complaint_priority_model.pkl")

@app.route('/predict', methods=['POST'])
def predict_priority():
    data = request.get_json()

    if 'complaint' not in data:
        return jsonify({'error': 'Missing "complaint" in request'}), 400

    complaint = data['complaint']
    prediction = model.predict([complaint])[0]

    return jsonify({
        'complaint': complaint,
        'predicted_priority': prediction
    })

if __name__ == '__main__':
    app.run(debug=True, port=5050)
