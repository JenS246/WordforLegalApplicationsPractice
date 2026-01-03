# ParaPro Word Challenge

An educational web application designed to train paralegals in document formatting using a simulated Microsoft Word environment.

![ParaPro Word Challenge](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

## 🎯 Overview

ParaPro Word Challenge is a React-based Single Page Application (SPA) that gamifies the learning process of legal document preparation. It replaces the need for actual Microsoft Word licenses by rendering a lightweight, DOM-based word processor in the browser.

## ✨ Features

### 📝 Word Simulator Engine
- **Ribbon UI**: Tabbed interface (Home, Insert, References, Review, View) with context-aware tools
- **Document Rendering**: Structured paragraph-based document model with dynamic styling
- **Multi-Selection**: Ctrl+Click to select and format multiple paragraphs
- **Undo/Redo System**: Full history stack with Ctrl+Z/Ctrl+Y support
- **Toast Notifications**: Real-time feedback for all actions

### 🎮 Training Levels

#### Level 1: The Improper Brief (Junior)
- **Skill**: Basic Formatting & Styles
- **Task**: Fix unprofessional fonts (Comic Sans → Times New Roman) and apply semantic heading styles

#### Level 2: Citation Nightmare (Associate)
- **Skill**: Table of Authorities (TOA) Generation
- **Task**: Identify legal citations, mark them, and generate an automated Table of Authorities

#### Level 3: Redline Review (Senior)
- **Skill**: Track Changes (Redlining)
- **Task**: Review contract changes, accept valid insertions, and reject harmful deletions

### 🤖 AI Mentor ("Sarah")
- Simulated senior paralegal providing context-aware guidance
- Keyword-matching system for relevant hints
- Level-specific responses and tips

### 📊 Automated Grading
- Instant, deterministic feedback
- Specific error messages and improvement suggestions
- Score tracking with pass/fail determination

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter for UI, Merriweather for documents)

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd WordforLegalApplicationsPractice

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Level selection screen
│   ├── Header.tsx         # Level header with objective
│   ├── MentorChat.tsx     # AI mentor sidebar
│   ├── Modal.tsx          # Grading results modal
│   ├── TaskSidebar.tsx    # Task checklist
│   ├── Toast.tsx          # Notification system
│   └── WordSimulator.tsx  # Core document editor
├── constants/
│   └── levels.ts          # Level definitions and initial documents
├── services/
│   ├── citationService.ts # Citation detection and TOA generation
│   ├── gradingService.ts  # Automated grading logic
│   └── mentorService.ts   # AI mentor responses
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main application component
├── index.css              # Global styles and Tailwind
└── main.tsx               # Application entry point
```

## 🎨 Design System

- **Colors**: Slate palette with Indigo accents
- **Paper Simulation**: Drop shadows and specific padding for Letter-sized paper
- **Animations**: Transitions on buttons, modal fade-ins, loading states
- **Typography**: Inter for UI, serif fonts for document simulation

## 📋 User Flow

1. **Dashboard**: Select a difficulty level/scenario
2. **Briefing**: Review the objective in the header
3. **Sidebar Tasks**: Follow the dynamic checklist
4. **Execution**: Use the ribbon toolbar to format the document
5. **Submission**: Click "Submit to Senior Partner"
6. **Grading**: Receive detailed feedback with pass/fail result

## 🔑 Key Interactions

| Action | Keyboard Shortcut |
|--------|------------------|
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Multi-select | Ctrl+Click |
| Submit | Click button |

## 📄 License

This project is for educational purposes.

---

Built with ❤️ for paralegal education
