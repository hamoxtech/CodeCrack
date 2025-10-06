# Code Explainer AI

**Stop being confused. Start understanding code through memes, movies, and more.**

Code Explainer AI is a web application that makes learning programming concepts fun and memorable. Instead of dry, technical definitions, it provides explanations in five different formats, generated in real-time by AI.

![Code Explainer AI Screenshot](https://storage.googleapis.com/aistudio-programmable-ui-project-assets/assets/screenshot.png)

## ✨ Features

*   **Multi-Format Explanations:** Get five distinct explanations for any coding topic.
    *   🤣 **Meme:** A relevant, dynamically generated meme.
    *   🎬 **Hollywood Analogy:** An analogy explained using a popular movie, complete with a poster.
    *   🎌 **Anime/Cartoon Analogy:** A simple, creative comparison to a well-known cartoon or anime.
    *   ⚽ **Sports Analogy:** An explanation using a familiar sports concept.
    *    seriousness and provides a definition, code example, common pitfalls, and best practices.
*   **AI-Powered:** Utilizes Google's Gemini API to generate all text content in a single, structured call.
*   **Dynamic Images:** Integrates with the Imgflip API for meme generation and the TMDB API for movie posters.
*   **Syntax Highlighting:** Code examples in the "Serious" tab are properly highlighted for readability.
*   **Content Guardrails:** The AI is instructed to only respond to programming-related topics.
*   **Responsive Design:** Clean, modern, and usable on both desktop and mobile devices.

## 🚀 Tech Stack

*   **Frontend:** React, Tailwind CSS
*   **AI Generation:** Google Gemini API (`@google/genai`)
*   **Image Services:** Imgflip API (memes), TMDB API (movie posters)
*   **Syntax Highlighting:** `react-syntax-highlighter`

## ⚙️ Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

*   Node.js and npm (or a compatible package manager) installed.
*   API keys from the following services.

### 2. Obtain API Keys

You will need to get credentials from three services:

*   **Google Gemini:** Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
*   **The Movie Database (TMDB):** Create a free account and get an API key from your [TMDB settings page](https://www.themoviedb.org/settings/api).
*   **Imgflip:** Register a free account on [Imgflip](https://imgflip.com/signup) to get a username and password.

### 3. Configure Your API Keys

For local development, the simplest way to get started is to add your keys directly to the `services/geminiService.ts` file. 

1. Open `services/geminiService.ts`.
2. Find the placeholder constants at the top of the file.
3. Replace the placeholder values with your actual keys.

```typescript
// services/geminiService.ts

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE';
const IMGFLIP_USER = 'YOUR_IMGFLIP_USERNAME_HERE';
const IMGFLIP_PASS = 'YOUR_IMGFLIP_PASSWORD_HERE';
```

### 4. Install Dependencies & Run

```bash
# Install all required packages
npm install

# This project uses react-syntax-highlighter, which requires its own types for TypeScript
# Install them with the following command:
npm install @types/react-syntax-highlighter --save-dev

# Run the development server
npm run dev
```

The application should now be running on your local server (usually `http://localhost:5173`).

## 🛠️ How It Works

1.  **User Input:** The user enters a programming topic (e.g., "Recursion") into the input field.
2.  **API Call:** The frontend calls the `generateExplanations` function in `services/geminiService.ts`.
3.  **AI Generation:** This service sends a single request to the Google Gemini API. The prompt includes a strict JSON schema, instructing the AI to return all five explanation types in a structured format.
4.  **Data Augmentation:** Once the JSON is received from Gemini, the application makes two additional, concurrent API calls:
    *   It uses the `title_hint` from the AI's response to fetch a movie poster from TMDB.
    *   It uses the `template_hint` and `caption` to find a matching meme template and generate a captioned image from Imgflip.
5.  **Display Results:** The fully augmented data object is returned to the frontend and displayed in the tabbed interface.

## ⚠️ Security Warning

The current version of this application includes API keys in the `services/geminiService.ts` file for demonstration purposes in a controlled environment.

**DO NOT DEPLOY THIS TO PRODUCTION WITH API KEYS IN THE FRONTEND CODE.**

Exposing API keys on the client-side is a major security risk. In a real-world application, all API calls (to Gemini, TMDB, and Imgflip) should be handled by a secure backend server that proxies the requests, keeping your keys safe.
