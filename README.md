# GYAAN-AI 🎓

> AI-Powered Personalized Learning Platform for Students

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)

## 🌟 Overview

GYAAN-AI is an intelligent learning management system that uses 5 AI agents to evaluate students, identify skill gaps, and create personalized learning paths. Built for teachers to manage classes and for students to receive tailored education.

## ✨ Features

### For Teachers
- 📊 **Dashboard** - Overview of all students, pending approvals, analytics
- 👥 **Student Management** - Add, approve, assign to classes, view reports
- 📚 **Class Management** - Create classes, batch assign tests
- 📈 **Analytics** - Track performance, identify struggling students
- 📝 **Assignments** - Create and manage learning tasks
- 🏆 **Rewards** - Configure achievement badges
- 📖 **Content Upload** - Add curriculum materials

### For Students
- 🗺️ **Learning Journey** - Visual progress tracker
- 📊 **Skill Assessment** - AI-powered evaluation
- 🎯 **Personalized Tasks** - Custom learning activities
- 📈 **Progress Map** - Radar chart skill visualization
- 🎮 **Gamification** - XP, levels, achievements

### AI Agents
1. **Reading Agent** - Analyzes reading fluency
2. **Comprehension Agent** - Evaluates understanding
3. **Vocabulary Agent** - Assesses word knowledge
4. **Math Agent** - Evaluates problem-solving
5. **Progress Agent** - Tracks learning progress

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Framer Motion (animations)
- Zustand (state management)
- Supabase Client

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- LangChain + OpenAI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📁 Project Structure

```
gyaan-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # Login, Signup
│   │   │   ├── student/       # Student pages
│   │   │   ├── teacher/       # Teacher pages
│   │   │   └── ui/            # Shared components
│   │   ├── store/             # Zustand store
│   │   ├── lib/               # Supabase config
│   │   └── styles/            # Global styles
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── agents/            # 5 AI agents
│   │   ├── routes/            # API endpoints
│   │   └── main.py
│   └── requirements.txt
└── README.md
```

## 🔐 Environment Variables

Create `.env` files:

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend (.env)
```
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_url
```

## 📸 Screenshots

### Teacher Dashboard
Professional interface for managing students and classes

### Student Dashboard
Engaging learning journey with gamification

### Evaluation System
AI-powered assessment with skill mapping

## 👥 Team

Built with ❤️ for educational innovation

## 📄 License

MIT License - feel free to use for educational purposes!
