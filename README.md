# ComplainHub

**ComplainHub** is a full-stack complaint management system tailored for academic institutions. It enables students to register complaints related to various issues such as WiFi problems, hostel maintenance, food quality, and more. Administrators can efficiently track, categorize, prioritize, and resolve complaints through an interactive dashboard.

## 📁 Project Structure
```
ComplainHub/
    ├── ComplainHubFr/          # Frontend (React + Vite + TypeScript)
    └── ComplainHubBackend/     # Backend (Java Spring Boot + Python ML)
```

## ✨ Features

### 🔹 Frontend (React)
- **Tech Stack:** React, Vite, TypeScript, TailwindCSS, Radix UI
- **Authentication:** Firebase Auth integration
- **Design:** Modern UI with responsive components

### 🔹 Backend (Java)
- **Framework:** Java Spring Boot
- **API:** RESTful API with modular service/controller layers
- **Integration:** Firebase for authentication and storage

### 🔹 ML Microservice (Python)
- **Framework:** FastAPI
- **Purpose:** Predict complaint priority based on a pre-trained ML model
- **Communication:** Microservice integrated into the Java backend

### 🔹 CI/CD & Security
- `.gitignore` and environment configuration for safe secret management
- Firebase credentials must be handled securely (never committed)

## 🛠️ How It Works

ComplainHub provides a seamless workflow for complaint management in academic institutions by integrating a modern frontend, robust backend, and an intelligent ML microservice:

1. **Student Complaint Submission:**
   - Students log in using Firebase Authentication via the React frontend.
   - They submit complaints (e.g., WiFi, hostel, food) through interactive forms.
   - The frontend sends complaint data to the backend REST API (Java Spring Boot).

2. **Backend Processing:**
   - The backend receives and validates complaint data.
   - It stores complaints in the database and manages user/admin roles using Firebase integration.
   - For each new complaint, the backend communicates with the Python ML microservice to predict its priority (e.g., high/medium/low).

3. **ML Microservice (Priority Prediction):**
   - The Java backend sends complaint details to the FastAPI microservice.
   - The microservice uses a trained ML model to analyze and return a priority score or label.
   - The backend stores this priority with the complaint record.

4. **Admin Dashboard & Resolution:**
   - Admins log in via the frontend and access a dashboard showing all complaints, their categories, and predicted priorities.
   - Admins can update statuses, assign tasks, and resolve complaints efficiently.
   - All changes are reflected in real time for both students and admins.

5. **Security & Best Practices:**
   - Sensitive credentials (like Firebase service accounts) are never committed to the repository.
   - All secrets are managed via `.gitignore` and must be provided locally.

This architecture ensures a responsive user experience, accurate complaint prioritization, and secure data handling throughout the platform.

## 🚀 Getting Started

### ✅ Prerequisites
Ensure you have the following installed:
- Node.js (v16+)
- npm
- Java 17+
- Maven
- Python 3.8+
- pip

### 🛠️ Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Meghashree-V/ComplainHub.git
cd ComplainHub-endpoints/ComplainKaroBro
```
Or visit the repository directly on GitHub: 👉 [github.com/Meghashree-V/ComplainHub](https://github.com/Meghashree-V/ComplainHub)

#### 2. Frontend Setup
```bash
cd ComplainHubFr
npm install
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173)

#### 3. Backend Setup (Java Spring Boot)
```bash
cd ComplainHubBackend
mvn spring-boot:run
```
API will be available at [http://localhost:8080](http://localhost:8080)

⚠️ **Important:** You must place your `firebase-service-account.json` inside:
```
ComplainHubBackend/src/main/resources/
```
Never commit this file.

#### 4. ML Microservice Setup (Python FastAPI)
```bash
cd ComplainHubBackend/src/main/resources
pip install -r requirements.txt
python complaint_priority_api.py
```
The ML API will be available at [http://localhost:8000](http://localhost:8000)

## 🌐 Environment Variables
- **Frontend:** Create a `.env` file in `ComplainHubFr/`
  - Prefix all variables with `VITE_`
- **Backend:** Configuration is managed via `application.properties` and the Firebase JSON key

## 🔒 Security
- Do **not** commit sensitive files like `firebase-service-account.json`
- Ensure all secrets are added to `.gitignore`
- Provide these files locally for development only

## 📄 License
This project is developed for educational purposes.

## 🙌 Contributions & Feedback
Feedback, issues, and contributions are welcome! Feel free to fork, modify, and enhance the platform to suit your institution's needs.
