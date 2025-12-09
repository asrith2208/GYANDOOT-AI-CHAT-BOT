# ज्ञानदूत (Gyandoot) - AI Chatbot for Uttaranchal University


Welcome to Gyandoot, an AI-powered admissions assistant personalized for Uttaranchal University. This project is more than just a chatbot; it's a smart, persuasive, and accessible point of contact designed to guide and motivate prospective students.

**Developed by Asrith Behala**




### Key Features

*   **🧠 Motivational AI Core:** Gyandoot doesn't just answer questions—it inspires. Programmed with a positive and encouraging personality, it frames information to highlight the university's strengths and get students excited about their future.
*   **🇮🇳 Multilingual & Regional Acumen:** Engages users fluently in multiple Indian languages, including English, Hindi, Telugu, and more. It even understands regional slang and dialects for natural-feeling conversations.
*   **🗣️ Full Voice Interaction:** Features integrated speech-to-text and text-to-speech capabilities, offering a completely hands-free and accessible communication experience.
*   **📚 Centralized & Trusted Knowledge Base:** The AI sources all its information directly from a curated list of over 100 official Uttaranchal University website links. This ensures every answer is accurate, up-to-date, and trustworthy, using a Retrieval-Augmented Generation (RAG) approach.
*   **✨ Modern & Branded UI:** Built with a clean and responsive interface that incorporates the university's branding for a professional and seamless user experience.

---

### How the AI Works: Instruction-Based Learning

Instead of traditional, dataset-based training, Gyandoot's intelligence comes from **Prompt Engineering**. We give a powerful foundation model (Google's Gemini) a highly detailed set of instructions:

1.  **Persona:** We tell it *who to be*: "an enthusiastic and inspiring chatbot."
2.  **Objective:** We give it a *goal*: "motivate prospective students to join."
3.  **Knowledge Source (RAG):** We give it a *brain*: a list of official university URLs that it must use as its single source of truth for answers.

This modern approach means the AI's knowledge is always as current as the university's own website, and it can't provide "hallucinated" or off-topic answers.

---

### Technology Stack

*   **Frontend:** Next.js, React, Tailwind CSS
*   **UI Components:** ShadCN
*   **AI Backend:** Google's Genkit framework with Gemini models
*   **Language:** TypeScript

---

### Getting Started: Running the Project Locally

Follow these steps to run Gyandoot on your local machine.

#### **Prerequisites**

*   **Node.js:** Make sure you have a recent LTS version installed ([nodejs.org](https://nodejs.org/)).
*   **Git:** Required for cloning the repository.

#### **1. Clone the Repository**

First, clone your repository to your local machine:
```bash
git clone https://github.com/asrith2208/GYANDOOT-AI-CHAT-BOT.git
cd GYANDOOT-AI-CHAT-BOT
```

#### **2. Install Dependencies**

Open the project folder in your code editor and run the following command in your terminal to install all the necessary packages:
```bash
npm install
```

#### **3. Set Up Environment Variables**

The AI features require a Google Gemini API key.

*   Create a new file in the root of your project named `.env.local`.
*   Copy the contents of `.env.example` into it and add your key:

```
# Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

#### **4. Run the Development Server**

Now you're ready to start the app!
```bash
npm run dev
```

The application will be running at **`http://localhost:9002`**. Open this URL in your browser to interact with Gyandoot!
# GYANDOOT-AI-CHAT-BOT
