#  Read Well English Zone

**Read Well English Zone** is a modern, gamified educational reading system designed to help students improve their English comprehension through engaging stories, interactive quizzes, and progressive difficulty levels. 

Built with React, Vite, and Tailwind CSS, the platform offers a beautiful, responsive, and highly interactive user experience.

---

##  Live Demo

[Click here for live demo.](https://educ-reading-system.vercel.app/)

---

##  Screenshots

| Landing Page | Dashboard | Story Reader |
|--------------|-----------|--------------|
| ![Landing Page](README/screenshot/landingpage.jpg) | ![Dashboard](README/screenshot/dashboard.jpg) | ![Story Reader](README/screenshot/storyreader.jpg) |

| Quiz | Results | Admin Dashboard |
|------|---------|-----------------|
| ![Quiz](README/screenshot/quiz.jpg) | ![Results](README/screenshot/results.jpg) | ![Admin](README/screenshot/admindashboard.jpg) |

---

##  Features

###  For Students
- **Gamified Learning**: Earn points and track progress as you read stories and take quizzes.
- **Progressive Difficulty**: Start at the *Easy* level and unlock *Average* and *Difficult* levels as your skills improve.
- **Interactive Quizzes**: Test your comprehension after each story with multiple-choice questions.
- **Visual Progression**: Watch your student avatar evolve (Pre-School ➔ High School ➔ College) as you level up!
- **Personalized Dashboard**: View your total score, average score, perfect scores, and completed levels.
- **Leaderboard**: Compete with fellow learners and climb the ranks.
- **Audio Feedback**: Enjoy satisfying sound effects for correct/wrong answers and passing/failing levels.

###  For Administrators
- **Admin Dashboard**: A dedicated interface for managing the platform.
- **User Management**: View and manage registered students.
- **Statistics & Activity Logs**: Monitor overall platform usage, user progress, and engagement metrics.

---

##  Tech Stack

### Frontend
| Technology | Description |
|------------|-------------|
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | UI Library |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) | Build Tool |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | Styling |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) | Animations |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) | Routing |

### Backend
| Technology | Description |
|------------|-------------|
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) | Database & Authentication |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) | Database |

### Tools & Libraries
| Technology | Description |
|------------|-------------|
| ![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white) | State Management |
| ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white) | Form Handling |
| ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white) | Validation |
| ![React Hot Toast](https://img.shields.io/badge/React_Hot_Toast-FF6B6B?style=for-the-badge&logo=react&logoColor=white) | Notifications |

### Hosting
| Technology | Description |
|------------|-------------|
| ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) | Hosting & Deployment |

---

##  Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)
- A Supabase project with the required database schema (profiles, user_progress, quiz_questions, etc.)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/eljohnluar/readwell-english-zone.git
   cd readwell-english-zone
Install dependencies:

bash
npm install
Set up Environment Variables:
Create a .env file in the root directory based on .env.example and add your Supabase credentials:

env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Start the development server:

bash
npm run dev
Open your browser and visit http://localhost:5173.

### Project Structure

src/

├── assets/         # Images, audio, and static assets

├── components/     # React components

│   ├── admin/      # Admin dashboard and management views

│   ├── auth/       # Login, Register, Password Reset

│   ├── common/     # Reusable UI (Header, Loader, ProtectedRoute)

│   ├── landing/    # Guest landing page

│   └── user/       # Student dashboard, quiz, story reader, results

├── config/         # Configuration files (levels definition)

├── context/        # React Context (AuthContext, ProgressContext)

├── hooks/          # Custom React hooks

├── lib/            # Library instances (Supabase client)

├── services/       # API and external service integrations

├── styles/         # Additional global styles

├── App.jsx         # Main application router

├── index.css       # Global CSS and Tailwind directives

└── main.jsx        # Application entry point

### UI/UX Design Philosophy
The application is designed with Premium Aesthetics in mind to keep students engaged:

Color Palette: A curated mix of Gold (#E9D2A9), Cream (#E5DCCD), Dark Blue (#2C3E50), and status colors (Easy Green, Average Orange, Difficult Purple).

Micro-interactions: Hover effects, smooth page transitions, and confetti celebrations on perfect scores.

Loading Experiences: A custom fullscreen animation showing a student walking and evolving through life stages while content loads.

### License
This project is licensed under the MIT License.
