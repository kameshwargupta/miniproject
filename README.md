# MediCare AI – Intelligent, Multilingual, All-in-One Healthcare Assistance Platform

MediCare AI connects **patients, doctors, hospitals, and pharmacies** into one intelligent, unified healthcare ecosystem equipped with **multilingual voice assistance** across 11 Indian languages.

---

## ?? Key Functional Features

1. **Smart Hospital Queue Management**:
   * Digital token booking with real-time status.
   * Serving token indicator, personal queue position, and estimated waiting time calculations.
   * Spoken audio token announcements in the user's selected regional language.

2. **AI Medical Report Scanner & Explainer**:
   * Document upload (PDF, JPG, PNG) with simulated OCR extraction.
   * Automatic extraction of laboratory test names, values, units, and laboratory reference ranges.
   * Normal, High, and Low status flags with plain-language medical terminology explanations.
   * Suggested questions for doctor consultation and healthy lifestyle recommendations.
   * **Full voice assistance**: Listen to the complete report, summary, doctor questions, or individual parameters.

3. **AI Medicine Scanner & Search**:
   * Blister pack / bottle photograph recognition via OCR.
   * Salt identification, brand names, active strengths, common uses, warnings, precautions, and storage guidelines.
   * Search by brand, generic salt, or therapeutic category.
   * Spoken safety guidelines and audio playback of warnings and uses.

4. **Smart Pharmacy Finder with Live Stock**:
   * GPS location-based pharmacy directory with reported real-time medicine availability.
   * Operating hours (24x7 indicators), contact numbers, and interactive map directions.
   * Audio guidance for directions and pharmacy details.

5. **Telemedicine & Video Consultation**:
   * Browse verified medical specialists with qualifications, ratings, experience, and slots.
   * Virtual consultation room with WebRTC simulated video and audio calling.
   * Microphone, camera toggle, and secure consultation workflow.

6. **Floating AI Health Copilot**:
   * Persistent floating assistant with speech-to-text (voice input) and text-to-speech.
   * Instant answers for medical terms, medicine inquiries, token queries, and navigation.

7. **Multilingual Architecture (11 Indian Languages)**:
   * English, ?????? (Hindi), ????? (Bengali), ????? (Tamil), ?????? (Telugu), ????? (Marathi), ??????? (Gujarati), ????? (Kannada), ?????? (Malayalam), ?????? (Punjabi), and ???? (Urdu).
   * Complete interface translations and native text-to-speech engine matching.

8. **Medicine Reminders & Schedule**:
   * Dosage scheduling (Before/After meal), frequency, and audible reminder alerts.

9. **24x7 Emergency SOS**:
   * One-touch emergency SOS broadcast with GPS coordinates and direct dialing for 112, 108, and Poison Helpline.

10. **Role-Based Access Dashboards**:
    * Unified views tailored for Patients, Clinicians/Doctors, Hospital Queue Admins, and Pharmacy Inventory Managers.

---

## ?? Tech Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Voice & Speech**: Web Speech Synthesis API, Web Speech Recognition API
* **Backend**: Express 5 REST API, Pino Logger
* **Database**: PostgreSQL with Drizzle ORM
* **Workspaces**: pnpm Monorepo

---

## ?? How to Run Locally in VS Code

1. Clone repository:
   ```bash
   git clone https://github.com/kameshwargupta/miniproject.git
   cd miniproject
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the application:
   ```bash
   pnpm --filter @workspace/carewatch dev
   ```
4. Open `http://localhost:3000` in your web browser.
