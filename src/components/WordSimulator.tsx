import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { CitationMark } from '../extensions/CitationMark';
import { InsertionMark, DeletionMark } from '../extensions/TrackChangesMark';
import type { RibbonTab, Toast } from '../types';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  BookMarked,
  ListOrdered,
  CheckSquare,
  XSquare,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface WordSimulatorProps {
  initialContent: string;
  onContentChange: (html: string) => void;
  levelId: number;
  onToast: (message: string, type: Toast['type']) => void;
}

const FONT_FAMILIES = [
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
];

const FONT_SIZES = ['10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '36pt'];

export const WordSimulator: React.FC<WordSimulatorProps> = ({
  initialContent,
  onContentChange,
  levelId,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [markedCitations, setMarkedCitations] = useState<string[]>([]);
  const [currentFont, setCurrentFont] = useState('Times New Roman');
  const [currentSize, setCurrentSize] = useState('12pt');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize,
      Highlight,
      CitationMark,
      InsertionMark,
      DeletionMark,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const attrs = editor.getAttributes('textStyle');
      if (attrs.fontFamily) {
        setCurrentFont(attrs.fontFamily);
      }
      if (attrs.fontSize) {
        setCurrentSize(attrs.fontSize);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full',
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
      setMarkedCitations([]);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowFontDropdown(false);
        setShowSizeDropdown(false);
        setShowStyleDropdown(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const setFont = useCallback((font: string) => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(font).run();
    setCurrentFont(font);
    onToast('Font changed to ' + font, 'success');
  }, [editor, onToast]);

  const setFontSizeValue = useCallback((size: string) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(size).run();
    setCurrentSize(size);
    onToast('Font size changed to ' + size, 'success');
  }, [editor, onToast]);

  const applyStyle = useCallback((level: 0 | 1 | 2 | 3) => {
    if (!editor) return;
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
      onToast('Applied Normal style', 'success');
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
      onToast('Applied Heading ' + level + ' style', 'success');
    }
  }, [editor, onToast]);

  const markCitation = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    if (from === to) {
      onToast('Please select a citation to mark', 'warning');
      return;
    }
    
    const selectedText = editor.state.doc.textBetween(from, to);
    editor.chain().focus().setCitation().run();
    
    if (!markedCitations.includes(selectedText)) {
      setMarkedCitations(prev => [...prev, selectedText]);
    }
    const displayText = selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText;
    onToast('Citation marked: ' + displayText, 'success');
  }, [editor, markedCitations, onToast]);

  const generateTableOfAuthorities = useCallback(() => {
    if (!editor) return;
    
    const html = editor.getHTML();
    const citationRegex = /<mark[^>]*data-citation[^>]*>([^<]+)<\/mark>/g;
    const citations: string[] = [];
    let match;
    
    while ((match = citationRegex.exec(html)) !== null) {
      citations.push(match[1]);
    }
    
    if (citations.length === 0) {
      onToast('No citations marked. Mark citations first before generating TOA.', 'warning');
      return;
    }
    
    const uniqueCitations = [...new Set(citations)].sort();
    
    const toaEntries = uniqueCitations.map(citation => 
      '<div class="toa-entry"><span class="toa-case">' + citation + '</span><span class="toa-page">passim</span></div>'
    ).join('');
    
    const toaHtml = '<div class="toa-block" data-toa="true"><div class="toa-title">TABLE OF AUTHORITIES</div><div class="toa-subtitle">Cases</div>' + toaEntries + '</div>';
    
    editor.chain().focus().insertContent(toaHtml).run();
    onToast('Table of Authorities generated with ' + uniqueCitations.length + ' citations', 'success');
  }, [editor, onToast]);

  const acceptChange = useCallback(() => {
    if (!editor) return;
    
    const hasInsertion = editor.isActive('insertion');
    const hasDeletion = editor.isActive('deletion');
    
    if (hasInsertion) {
      editor.chain().focus().unsetMark('insertion').run();
      onToast('Change accepted - insertion confirmed', 'success');
    } else if (hasDeletion) {
      editor.chain().focus().deleteSelection().run();
      onToast('Change accepted - text deleted', 'success');
    } else {
      onToast('Select tracked change text to accept', 'warning');
    }
  }, [editor, onToast]);

  const rejectChange = useCallback(() => {
    if (!editor) return;
    
    const hasInsertion = editor.isActive('insertion');
    const hasDeletion = editor.isActive('deletion');
    
    if (hasInsertion) {
      editor.chain().focus().deleteSelection().run();
      onToast('Change rejected - insertion removed', 'success');
    } else if (hasDeletion) {
      editor.chain().focus().unsetMark('deletion').run();
      onToast('Change rejected - text preserved', 'success');
    } else {
      onToast('Select tracked change text to reject', 'warning');
    }
  }, [editor, onToast]);

  const acceptAllChanges = useCallback(() => {
    if (!editor) return;
    
    const html = editor.getHTML();
    const cleanedHtml = html
      .replace(/<del[^>]*>.*?<\/del>/g, '')
      .replace(/<ins[^>]*>(.*?)<\/ins>/g, '$1');
    
    editor.commands.setContent(cleanedHtml);
    onToast('All changes accepted', 'success');
  }, [editor, onToast]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <div className="text-slate-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
      <div className="bg-white border-b border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            className={'ribbon-tab' + (activeTab === 'home' ? ' active' : '')}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={'ribbon-tab' + (activeTab === 'insert' ? ' active' : '')}
            onClick={() => setActiveTab('insert')}
          >
            Insert
          </button>
          <button
            className={'ribbon-tab' + (activeTab === 'references' ? ' active' : '')}
            onClick={() => setActiveTab('references')}
          >
            References
          </button>
          <button
            className={'ribbon-tab' + (activeTab === 'review' ? ' active' : '')}
            onClick={() => setActiveTab('review')}
          >
            Review
          </button>
        </div>

        <div className="p-2 flex items-center gap-4 min-h-[80px]">
          {activeTab === 'home' && (
            <>
              <div className="ribbon-group">
                <div className="flex items-center gap-1 mb-1">
                  <div className="relative dropdown-container">
                    <button
                      className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-sm min-w-[140px] hover:border-slate-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFontDropdown(!showFontDropdown);
                        setShowSizeDropdown(false);
                        setShowStyleDropdown(false);
                      }}
                    >
                      <span className="flex-1 text-left truncate">{currentFont}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showFontDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 min-w-[180px]">
                        {FONT_FAMILIES.map((font) => (
                          <button
                            key={font.value}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                            style={{ fontFamily: font.value }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFont(font.value);
                              setShowFontDropdown(false);
                            }}
                          >
                            {font.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative dropdown-container">
                    <button
                      className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-sm min-w-[60px] hover:border-slate-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSizeDropdown(!showSizeDropdown);
                        setShowFontDropdown(false);
                        setShowStyleDropdown(false);
                      }}
                    >
                      <span className="flex-1 text-left">{currentSize}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showSizeDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size}
                            className="block w-full px-3 py-1 text-left text-sm hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFontSizeValue(size);
                              setShowSizeDropdown(false);
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    className={'ribbon-mini-btn' + (editor.isActive('bold') ? ' active' : '')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    className={'ribbon-mini-btn' + (editor.isActive('italic') ? ' active' : '')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    className={'ribbon-mini-btn' + (editor.isActive('underline') ? ' active' : '')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline (Ctrl+U)"
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="ribbon-group-label">Font</div>
              </div>

              <div className="w-px h-16 bg-slate-200" />

              <div className="ribbon-group">
                <div className="flex items-center gap-0.5">
                  <button
                    className={'ribbon-mini-btn' + (editor.isActive({ textAlign: 'left' }) ? ' active' : '')}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    className={'ribbon-mini-btn' + (editor.isActive({ textAlign: 'center' }) ? ' active' : '')}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    className={'ribbon-mini-btn' + (editor.isActive({ textAlign: 'right' }) ? ' active' : '')}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    className={'ribbon-mini-btn' + (editor.isActive({ textAlign: 'justify' }) ? ' active' : '')}
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    title="Justify"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>
                <div className="ribbon-group-label">Paragraph</div>
              </div>

              <div className="w-px h-16 bg-slate-200" />

              <div className="ribbon-group">
                <div className="relative dropdown-container">
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded text-sm hover:border-slate-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStyleDropdown(!showStyleDropdown);
                      setShowFontDropdown(false);
                      setShowSizeDropdown(false);
                    }}
                  >
                    <Type className="w-4 h-4" />
                    <span>Styles</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showStyleDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 min-w-[160px]">
                      <button
                        className={'block w-full px-3 py-2 text-left text-sm hover:bg-slate-100' + (editor.isActive('paragraph') ? ' bg-indigo-50' : '')}
                        onClick={(e) => {
                          e.stopPropagation();
                          applyStyle(0);
                          setShowStyleDropdown(false);
                        }}
                      >
                        Normal
                      </button>
                      <button
                        className={'block w-full px-3 py-2 text-left font-bold text-lg hover:bg-slate-100' + (editor.isActive('heading', { level: 1 }) ? ' bg-indigo-50' : '')}
                        onClick={(e) => {
                          e.stopPropagation();
                          applyStyle(1);
                          setShowStyleDropdown(false);
                        }}
                      >
                        Heading 1
                      </button>
                      <button
                        className={'block w-full px-3 py-2 text-left font-bold text-base hover:bg-slate-100' + (editor.isActive('heading', { level: 2 }) ? ' bg-indigo-50' : '')}
                        onClick={(e) => {
                          e.stopPropagation();
                          applyStyle(2);
                          setShowStyleDropdown(false);
                        }}
                      >
                        Heading 2
                      </button>
                      <button
                        className={'block w-full px-3 py-2 text-left font-semibold hover:bg-slate-100' + (editor.isActive('heading', { level: 3 }) ? ' bg-indigo-50' : '')}
                        onClick={(e) => {
                          e.stopPropagation();
                          applyStyle(3);
                          setShowStyleDropdown(false);
                        }}
                      >
                        Heading 3
                      </button>
                    </div>
                  )}
                </div>
                <div className="ribbon-group-label">Styles</div>
              </div>
            </>
          )}

          {activeTab === 'references' && (
            <>
              <div className="ribbon-group">
                <div className="flex flex-col items-center gap-1">
                  <button
                    className="ribbon-button"
                    onClick={markCitation}
                    title="Mark selected text as a citation"
                  >
                    <BookMarked className="w-5 h-5" />
                    <span>Mark Citation</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Citations</div>
              </div>

              <div className="w-px h-16 bg-slate-200" />

              <div className="ribbon-group">
                <div className="flex flex-col items-center gap-1">
                  <button
                    className="ribbon-button"
                    onClick={generateTableOfAuthorities}
                    title="Insert Table of Authorities at cursor position"
                  >
                    <ListOrdered className="w-5 h-5" />
                    <span>Insert TOA</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Table of Authorities</div>
              </div>

              {markedCitations.length > 0 && (
                <div className="ml-4 px-3 py-2 bg-indigo-50 rounded-lg">
                  <div className="text-xs text-indigo-600 font-medium">
                    {markedCitations.length} citation(s) marked
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'review' && (
            <>
              <div className="ribbon-group">
                <div className="flex items-center gap-2">
                  <button
                    className="ribbon-button"
                    onClick={acceptChange}
                    title="Accept selected change"
                  >
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <span>Accept</span>
                  </button>
                  <button
                    className="ribbon-button"
                    onClick={rejectChange}
                    title="Reject selected change"
                  >
                    <XSquare className="w-5 h-5 text-red-600" />
                    <span>Reject</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Changes</div>
              </div>

              <div className="w-px h-16 bg-slate-200" />

              <div className="ribbon-group">
                <button
                  className="ribbon-button"
                  onClick={acceptAllChanges}
                  title="Accept all changes in document"
                >
                  <FileText className="w-5 h-5" />
                  <span>Accept All</span>
                </button>
                <div className="ribbon-group-label">All Changes</div>
              </div>

              {levelId === 3 && (
                <div className="ml-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-xs">
                  <div className="text-xs text-amber-800">
                    <strong>Tip:</strong> Click within a tracked change (green for insertions, red strikethrough for deletions), then use Accept or Reject.
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'insert' && (
            <div className="text-slate-500 text-sm px-4">
              Insert features available in References tab (Table of Authorities)
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-slate-200">
        <div className="document-paper" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="bg-slate-700 text-slate-300 text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Page 1 of 1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">Ready</span>
        </div>
      </div>
    </div>
  );
};

