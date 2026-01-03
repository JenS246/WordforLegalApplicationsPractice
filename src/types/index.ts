export type ParagraphType = 'p' | 'h1' | 'h2' | 'h3' | 'toa';

export type ChangeType = 'none' | 'insertion' | 'deletion';

// Legacy Paragraph type - kept for reference
export interface Paragraph {
  id: string;
  content: string;
  type: ParagraphType;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right' | 'justify';
  isMarkedCitation?: boolean;
  changeType?: ChangeType;
  originalContent?: string;
}

export type Difficulty = 'junior' | 'associate' | 'senior';

export interface Task {
  id: string;
  description: string;
  hint?: string;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  description: string;
  objective: string;
  skills: string[];
  tasks: Task[];
  initialDocument: string; // Now HTML string instead of Paragraph[]
}

export interface GradingResult {
  passed: boolean;
  score: number;
  maxScore: number;
  errors: string[];
  feedback: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  content: string;
  timestamp: Date;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export type RibbonTab = 'home' | 'insert' | 'references' | 'review' | 'view';
