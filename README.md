# SWAYAM Quizlet 📚

A fast, fully responsive, and elegant vanilla JavaScript web application designed for students taking courses on the SWAYAM portal. It provides week-wise practice quizzes with interactive grading, responsive design for all devices, and an easy-to-update JSON architecture.

![SWAYAM Quizlet](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla%20JS-F7DF1E)

## ✨ Features

- **Blazing Fast & Lightweight**: Built with 100% Vanilla HTML, CSS, and JS. Zero dependencies, no heavy frameworks to load.
- **App-Like Mobile Experience**: Fully responsive with a slide-out hamburger navigation drawer, touch-friendly scaled animations, and smart safe-area padding for mobile devices.
- **Dynamic Routing**: Instant page navigation using hash routing (`#`) without triggering full page reloads.
- **Instant Grading**: Immediate visual feedback, displaying correct and incorrect answers with clear tags.
- **Scalable JSON Architecture**: Extremely easy to add new subjects or weeks simply by dropping a new `.json` file into the `quizzes` folder and updating `index.json`.

## 🚀 Live Demo

You can view the live application here: **[Link to GitHub Pages URL]** *(Update this link once GitHub Pages is enabled)*

## 📂 Project Structure

```text
swayam-quiz-app/
│
├── index.html            # Main HTML layout, header, drawer, and view containers
├── styles.css            # Fully responsive styling with custom CSS variables and breakpoints
├── app.js                # Core application logic, routing, and quiz grading engine
│
└── quizzes/              # All quiz data lives here
    ├── index.json        # The master manifest defining all available subjects and linking to their weeks
    ├── soft-skills/      # Directory for "Soft Skill Development" quizzes
    │   ├── week0.json    
    │   ├── week1.json  
    │   └── week8.json    # Up to Week 8 currently included
    │
    └── iot/              # Directory for "Introduction to Internet of Things"
        └── week1.json    
```

## 🛠️ How to Add a New Quiz

Adding new content requires zero coding. Just two simple steps:

1. **Create the JSON file**: Create a new file (e.g., `week2.json`) in the appropriate subject folder (`quizzes/iot/`) matching this exact structure:
    ```json
    {
      "title": "Introduction to IoT - Week 2",
      "week": 2,
      "subject": "Introduction to Internet of Things",
      "questions": [
        {
          "id": 1,
          "question": "Sample Question?",
          "options": [ "Option A", "Option B", "Option C", "Option D" ],
          "answer": 1 
        }
      ]
    }
    ```
    *(Note: `answer` is the integer index of the correct option starting at `0`)*

2. **Link it in `index.json`**: Open `quizzes/index.json` and append your new week to the relevant subject array:
    ```json
    "weeks": [
      { "week": 1, "title": "Introduction to IoT", "file": "iot/week1.json" },
      { "week": 2, "title": "Introduction to IoT - Week 2", "file": "iot/week2.json" }
    ]
    ```

## 🌐 How to Host on GitHub Pages (Free)

This project is perfectly suited for free hosting on GitHub Pages since it requires no backend server. Follow these steps:

1. Go to your repository on GitHub.
2. Click the **Settings** tab (the gear icon near the top right).
3. On the left sidebar menu, click on **Pages**.
4. Under the **"Build and deployment"** section, ensure the Source is set to **"Deploy from a branch"**.
5. Under the **"Branch"** section, click the dropdown that says *None* and select **`main`**.
6. Leave the folder dropdown as `/ (root)`.
7. Click the **Save** button.

That's it! Wait about 1-2 minutes, refresh the page, and GitHub will provide you with a live URL at the top (usually looking like `https://[your-username].github.io/swayam-quiz-app/`).

---
Built for SWAYAM learners. Data is for practice purposes only.
