# 🚀 TaskZen

**TaskZen** is a modern, AI-powered task management platform designed for individuals and teams who want to streamline their workflow and boost productivity. Built with a cutting-edge tech stack, it combines a sleek user interface with intelligent features to make task management intuitive and efficient.

---

## ✨ Key Features

-   **Real-time Task Board:** A beautiful, responsive drag-and-drop interface to manage tasks across `To Do`, `In Progress`, and `Done` statuses.
-   **AI-Powered Assistance:** Leverage the power of generative AI to work smarter:
    -   **Smart Assignee Suggestions:** Get intelligent recommendations for the best person to handle a task based on its description.
    -   **Automatic Prioritization:** Let AI analyze task details and suggest a priority level (`low`, `medium`, `high`).
    -   **Task Breakdown:** Automatically break down large tasks into smaller, actionable subtasks.
    -   **Category Suggestions:** Keep your board organized with AI-driven category recommendations.
-   **Voice Commands:** Create tasks hands-free using your voice. Just describe the task, and AI will handle the rest.
-   **Task Dependencies:** Establish parent-child relationships between tasks to manage complex workflows and block dependent tasks until prerequisites are met.
-   **Gamification & Achievements:** Stay motivated by unlocking badges for completing tasks and reaching milestones.
-   **Full-fledged UI:** Includes a comprehensive dashboard, calendar view, analytics page, team directory, and user settings.
-   **Light & Dark Mode:** A sleek and comfortable viewing experience, day or night.
-   **Authentication:** Secure user authentication with Email/Password and Google Sign-In.

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI:** [Google Gemini](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **State Management:** React Context API
-   **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 🏁 Getting Started

To run this project locally, follow these steps:

### 1. Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or later)
-   `npm` or `yarn`

### 2. Set Up Firebase

1.  Create a new project on the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Firestore** and **Authentication** (with Email/Password and Google providers).
3.  Go to Project Settings > General, find your web app, and copy the `firebaseConfig` object.
4.  Paste this configuration into `src/firebase/config.ts`.

### 3. Set Up Gemini API Key

1.  Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).
2.  Create a `.env` file in the root of the project.
3.  Add your API key to the `.env` file:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

### 4. Installation & Running Locally

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/taskzen.git
    cd taskzen
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:9002](http://localhost:9002).

---

## 🧪 Running Tests

This project uses Jest and React Testing Library for automated testing. To run the test suite:

```bash
npm test
```

This will start Jest in "watch mode," which automatically re-runs tests when you save changes to a file.

## 🚀 Deployment

This application is ready to be deployed on platforms that support Next.js.

### Deploying to Vercel

1.  Push your code to a GitHub repository.
2.  Create a new project on [Vercel](https://vercel.com/) and import your GitHub repository.
3.  Vercel will automatically detect that it is a Next.js project.
4.  **Important:** Add your `GEMINI_API_KEY` as an environment variable in the Vercel project settings.
5.  Click **Deploy**.

---

This project was bootstrapped and developed with the assistance of **Firebase Studio**.
