import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib

# Load dataset
DATASET_PATH = 'complaints_priority_dataset.csv'
df = pd.read_csv(DATASET_PATH)

# Domain-specific keyword rules
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

def priority_predictor(text):
    rule_priority = keyword_priority(text)
    if rule_priority:
        return rule_priority
    return model.predict([text])[0]

# ML pipeline
model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB()),
])

model.fit(df['complaint'], df['priority'])

# Save both model and rule function
joblib.dump(model, 'complaint_priority_model.joblib')

print('Model trained and saved as complaint_priority_model.joblib')
