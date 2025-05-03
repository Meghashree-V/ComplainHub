import pandas as pd
import random

# Existing dataset
df = pd.read_csv('complaints_priority_dataset.csv')

academic_templates = [
    "My {item} marks are not updated.",
    "The {item} was not evaluated properly.",
    "Professor is not available during {time} hours.",
    "Syllabus for {subject} is incomplete.",
    "Unfair grading in the {exam} exam.",
    "Attendance shortage issue in {subject} class.",
    "Assignment deadline for {subject} is not communicated.",
    "Result for {exam} is delayed.",
    "Internal marks for {subject} are too low.",
    "Teacher is absent for two weeks.",
    "Project guide not assigned for {subject}.",
    "Revaluation for {exam} paper not done.",
    "Lab sessions for {subject} are not conducted.",
    "Lecture cancelled without notice.",
    "No professor assigned for {subject}.",
    "Unfair evaluation in {exam}.",
    "Subject change request not processed.",
    "Class timing for {subject} is not followed.",
    "Practical exam for {subject} not held.",
    "Grades not updated for {subject}.",
]

subjects = ["Mathematics", "Physics", "Chemistry", "Computer Science", "Electronics", "English", "Mechanical Engineering", "Civil Engineering", "Biology", "Economics"]
items = ["internal", "external", "practical", "sessional", "midterm", "final"]
times = ["office", "evening", "morning"]
exams = ["midterm", "final", "sessional", "practical"]

new_rows = []
for _ in range(100):
    template = random.choice(academic_templates)
    row = template.format(
        item=random.choice(items),
        subject=random.choice(subjects),
        time=random.choice(times),
        exam=random.choice(exams)
    )
    new_rows.append({"complaint": row, "priority": "High"})

# Add to DataFrame and save
augmented_df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
augmented_df.to_csv('complaints_priority_dataset.csv', index=False)
print("Augmented dataset with academic complaints. New total rows:", len(augmented_df))
