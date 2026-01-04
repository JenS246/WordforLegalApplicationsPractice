import { useState, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { WordSimulator } from './components/WordSimulator';
import { TaskSidebar } from './components/TaskSidebar';
import { MentorChat } from './components/MentorChat';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { GradingModal } from './components/Modal';
import { levels } from './constants/levels';
import { gradeDocument } from './services/gradingService';
import type { Toast, GradingResult } from './types';

type View = 'dashboard' | 'editor';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [documentHtml, setDocumentHtml] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);

  const currentLevel = currentLevelId !== null 
    ? levels.find(l => l.id === currentLevelId) 
    : null;

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSelectLevel = useCallback((levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      setCurrentLevelId(levelId);
      setDocumentHtml(level.initialDocument);
      setCompletedTasks(new Set());
      setGradingResult(null);
      setShowGradingModal(false);
      setView('editor');
    }
  }, []);

  const handleBack = useCallback(() => {
    setView('dashboard');
    setCurrentLevelId(null);
    setDocumentHtml('');
    setCompletedTasks(new Set());
    setGradingResult(null);
    setShowGradingModal(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (currentLevelId === null) return;
    
    const result = gradeDocument(currentLevelId, documentHtml);
    setGradingResult(result);
    setShowGradingModal(true);
  }, [currentLevelId, documentHtml]);

  const handleShowHint = useCallback((hint: string) => {
    addToast(hint, 'info');
  }, [addToast]);

  const handleContentChange = useCallback((newHtml: string) => {
    setDocumentHtml(newHtml);
    
    // Auto-check task completion based on document state
    if (currentLevel && currentLevelId) {
      const newCompleted = new Set<string>();
      const htmlLower = newHtml.toLowerCase();
      let parsedDoc: Document | null = null;

      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        parsedDoc = parser.parseFromString(newHtml, 'text/html');
      }
      
      // Level 1 task checking
      if (currentLevelId === 1) {
        // Check font - no Comic Sans and has Times New Roman
        const noComicSans = !htmlLower.includes('comic sans');
        const hasTimesNewRoman = htmlLower.includes('times new roman');
        if (noComicSans && hasTimesNewRoman) newCompleted.add('t1-1');
        
        // Check if CASE BRIEF is in h1
        const caseBriefH1 = /<h1[^>]*>.*?case brief.*?<\/h1>/i.test(newHtml);
        if (caseBriefH1) newCompleted.add('t1-2');
        
        // Check section headers are h2
        const statementH2 = /<h2[^>]*>.*?statement of facts.*?<\/h2>/i.test(newHtml);
        const legalH2 = /<h2[^>]*>.*?legal issues.*?<\/h2>/i.test(newHtml);
        const applicableH2 = /<h2[^>]*>.*?applicable law.*?<\/h2>/i.test(newHtml);
        if (statementH2 && legalH2 && applicableH2) newCompleted.add('t1-3');
        
        // Check body paragraphs (p tags) are explicitly 12pt
        const paragraphs = parsedDoc
          ? Array.from(parsedDoc.querySelectorAll('p'))
          : [];
        const paragraphsAre12pt =
          paragraphs.length > 0 &&
          paragraphs.every((p) => {
            const style = p.getAttribute('style') || '';
            const match = style.match(/font-size\s*:\s*([0-9.]+)\s*pt/i);
            if (!match) return false;
            const size = parseFloat(match[1]);
            return Math.abs(size - 12) < 0.01;
          });
        if (paragraphsAre12pt && noComicSans) newCompleted.add('t1-4');
      }
      
      // Level 2 task checking
      if (currentLevelId === 2) {
        let citationTexts: string[] = [];

        if (parsedDoc) {
          const citationElements = Array.from(
            parsedDoc.querySelectorAll('mark[data-citation], .citation-marked'),
          );
          citationTexts = citationElements
            .map((node) => node.textContent?.toLowerCase().trim() || '')
            .filter(Boolean);
        }

        const hasCitation = (needle: string) =>
          citationTexts.some((text) => text.includes(needle.toLowerCase()));

        if (hasCitation('anderson v. liberty lobby')) newCompleted.add('t2-1');
        if (hasCitation('celotex corp. v. catrett')) newCompleted.add('t2-2');
        if (hasCitation('palsgraf v. long island railroad')) newCompleted.add('t2-3');

        const requiredCases = [
          'anderson v. liberty lobby',
          'celotex corp. v. catrett',
          'palsgraf v. long island railroad',
          'rowland v. christian',
          'li v. yellow cab',
          'knight v. jewett',
        ];
        if (requiredCases.every((citation) => hasCitation(citation))) {
          newCompleted.add('t2-4');
        }

        // Check for TOA
        let toaAtTop = false;
        if (parsedDoc) {
          const toaNode = parsedDoc.querySelector('.toa-block, [data-toa="true"]');
          const bodyElements = Array.from(parsedDoc.body.children).filter(
            (el) => el.textContent && el.textContent.trim().length > 0,
          );
          const toaIndex = bodyElements.findIndex((el) => {
            if (toaNode) return el === toaNode || el.contains(toaNode);
            return (el.textContent || '').toLowerCase().includes('table of authorities');
          });
          toaAtTop = toaIndex !== -1 && toaIndex <= 1;
        }
        if (toaAtTop) newCompleted.add('t2-5');
      }
      
      // Level 3 task checking
      if (currentLevelId === 3) {
        // Check insertions status
        const extensionInDoc = htmlLower.includes('option to extend');
        const extensionNotMarked = !/<ins[^>]*>.*?option to extend/i.test(newHtml);
        if (extensionInDoc && extensionNotMarked) {
          newCompleted.add('t3-1');
          newCompleted.add('t3-4');
        }
        
        const lateFeeInDoc = htmlLower.includes('late fee');
        const lateFeeNotMarked = !/<ins[^>]*>.*?late fee/i.test(newHtml);
        if (lateFeeInDoc && lateFeeNotMarked) newCompleted.add('t3-2');
        
        // Check termination clause - should still be in doc but not marked as deletion
        const terminationInDoc = htmlLower.includes('terminate this agreement');
        const terminationNotMarked = !/<del[^>]*>.*?terminate this agreement/i.test(newHtml);
        if (terminationInDoc && terminationNotMarked) {
          newCompleted.add('t3-3');
          newCompleted.add('t3-5');
        }
      }

      // Level 4 task checking
      if (currentLevelId === 4) {
        const elements = parsedDoc
          ? Array.from(parsedDoc.querySelectorAll('p, h1, h2, h3'))
          : [];
        const allTimesNewRoman =
          elements.length > 0 &&
          elements.every((el) => {
            const style = el.getAttribute('style') || '';
            if (/comic sans/i.test(style)) return false;
            if (/calibri/i.test(style)) return false;
            const fontMatch = style.match(/font-family\s*:\s*([^;]+)/i);
            return !fontMatch || /times new roman/i.test(fontMatch[1]);
          });

        const paragraphs = parsedDoc ? Array.from(parsedDoc.querySelectorAll('p')) : [];
        const bodySizeOk =
          paragraphs.length > 0 &&
          paragraphs.every((p) => {
            const sizeMatch = (p.getAttribute('style') || '').match(/font-size\s*:\s*([0-9.]+)pt/i);
            if (!sizeMatch) return true;
            const size = parseFloat(sizeMatch[1]);
            return Math.abs(size - 12) < 0.01;
          });

        const titleOk = /<h1[^>]*>.*?motion in limine.*?<\/h1>/i.test(newHtml);
        const sectionLabels = ['Background', 'Issues Presented', 'Argument', 'Relief Requested'];
        const sectionsOk = sectionLabels.every((label) =>
          new RegExp(`<h2[^>]*>.*?${label}.*?<\\/h2>`, 'i').test(newHtml),
        );
        if (allTimesNewRoman && bodySizeOk && titleOk && sectionsOk) {
          newCompleted.add('t4-1');
        }

        // Citations and TOA placement
        let toaAtTop = false;
        if (parsedDoc) {
          const toaNode = parsedDoc.querySelector('.toa-block, [data-toa="true"]');
          const bodyEls = Array.from(parsedDoc.body.children).filter(
            (el) => el.textContent && el.textContent.trim().length > 0,
          );
          const toaIndex = bodyEls.findIndex((el) => {
            if (toaNode) return el === toaNode || el.contains(toaNode);
            return (el.textContent || '').toLowerCase().includes('table of authorities');
          });
          toaAtTop = toaIndex !== -1 && toaIndex <= 1;
        }

        const markedCitations = parsedDoc
          ? Array.from(parsedDoc.querySelectorAll('mark[data-citation], .citation-marked')).map(
              (el) => (el.textContent || '').toLowerCase(),
            )
          : [];
        const hasCitation = (needle: string) => markedCitations.some((text) => text.includes(needle));
        if (
          toaAtTop &&
          hasCitation('daubert v. merrell dow') &&
          hasCitation('kumho tire co. v. carmichael') &&
          hasCitation('people v. sanchez')
        ) {
          newCompleted.add('t4-2');
        }

        // Insertion accepted
        const insertionText = 'provide all materials relied on by dr. lee';
        const insertionPresent = htmlLower.includes(insertionText);
        const insertionMarked = /<ins[^>]*>.*?provide all materials relied on by dr\. lee/i.test(newHtml);
        if (insertionPresent && !insertionMarked) {
          newCompleted.add('t4-3');
        }

        // Deletion rejected
        const deletionText = 'may supplement opinions up to the eve of trial';
        const deletionPresent = htmlLower.includes(deletionText);
        const deletionMarked = /<del[^>]*>.*?may supplement opinions up to the eve of trial/i.test(newHtml);
        if (deletionPresent && !deletionMarked) {
          newCompleted.add('t4-4');
        }
      }
      
      setCompletedTasks(newCompleted);
    }
  }, [currentLevel, currentLevelId]);

  if (view === 'dashboard') {
    return <Dashboard onSelectLevel={handleSelectLevel} />;
  }

  if (!currentLevel) {
    return <Dashboard onSelectLevel={handleSelectLevel} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Header */}
      <Header 
        level={currentLevel} 
        onBack={handleBack} 
        onSubmit={handleSubmit}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task Sidebar */}
        <TaskSidebar
          objective={currentLevel.objective}
          tasks={currentLevel.tasks}
          completedTasks={completedTasks}
          onShowHint={handleShowHint}
        />

        {/* Word Simulator */}
        <WordSimulator
          initialContent={currentLevel.initialDocument}
          onContentChange={handleContentChange}
          levelId={currentLevelId!}
          onToast={addToast}
        />

        {/* Mentor Chat */}
        <MentorChat levelId={currentLevelId!} />
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Grading Modal */}
      <GradingModal
        isOpen={showGradingModal}
        onClose={() => setShowGradingModal(false)}
        result={gradingResult}
        onReturnToDashboard={handleBack}
      />
    </div>
  );
}

export default App;
