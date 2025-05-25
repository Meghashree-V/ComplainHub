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
    # Academic/Teacher/Exam/Result/Attendance/College Life (all High)
    'academic': 'High',
    'exam': 'High',
    'examination': 'High',
    'test': 'High',
    'marks': 'High',
    'result': 'High',
    'professor': 'High',
    'teacher': 'High',
    'faculty': 'High',
    'attendance': 'High',
    'syllabus': 'High',
    'assignment': 'High',
    'internal': 'High',
    'external': 'High',
    'subject': 'High',
    'lecture': 'High',
    'class': 'High',
    'backlog': 'High',
    're-evaluation': 'High',
    'revaluation': 'High',
    'rechecking': 'High',
    'paper': 'High',
    'copy checking': 'High',
    'lab': 'High',
    'practical': 'High',
    'project': 'High',
    'semester': 'High',
    'sessional': 'High',
    'grades': 'High',
    'cgpa': 'High',
    'gpa': 'High',
    'credit': 'High',
    'unfair grading': 'High',
    'continuous absence': 'High',
    'class cancellation': 'High',
    'academic calendar': 'High',
    'university': 'High',
    'college': 'High',
    # Existing and other keywords
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
    # Check for academic/teacher/college life phrases
    academic_phrases = [
        'assignment deadline', 'marks not updated', 'marks not uploaded', 'marks not given',
        'result not declared', 'result not published', 'result delayed',
        'professor not available', 'teacher not available', 'class cancelled',
        'lecture cancelled', 'syllabus not covered', 'syllabus incomplete',
        'attendance shortage', 'attendance issue', 'attendance not marked',
        'unfair grading', 'unfair marks', 'unfair evaluation',
        'revaluation not done', 'rechecking not done',
        'project guide not assigned', 'lab not conducted',
        'internal marks low', 'external marks low',
        'subject change', 'backlog not cleared', 'paper leak', 'paper out of syllabus',
        'copy checking issue', 'copy not checked', 'practical not held',
        'semester fee issue', 'academic calendar not followed',
        'university rules not followed', 'class test not held',
        'sessional not conducted', 'grades not updated', 'cgpa issue', 'gpa issue',
        'credit not given', 'continuous absence of teacher', 'faculty absent',
        'no teacher assigned', 'no professor assigned', 'class timing issue',
        'academic misconduct', 'cheating in exam', 'plagiarism',
    ]
    for phrase in academic_phrases:
        if phrase in text:
            return 'High'
    # Keyword-based matching
    for keyword, priority in KEYWORD_PRIORITY.items():
        if keyword in text:
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
