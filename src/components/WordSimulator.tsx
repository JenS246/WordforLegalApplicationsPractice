import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  BookMarked,
  ListOrdered,
  CheckSquare,
  XSquare,
  FileText,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import type { RibbonTab, Toast } from '../types';

type ChangeType = 'insertion' | 'deletion';

type SentenceTag = 'p' | 'h1' | 'h2' | 'h3';
type IntrinsicTag = keyof React.JSX.IntrinsicElements;

type ContentBlock =
  | {
      kind: 'sentence';
      id: string;
      containerId: string;
      tag: SentenceTag;
      text: string;
      style?: string;
      className?: string;
      changeType?: ChangeType;
      reviewState?: 'pending' | 'accepted' | 'rejected';
      isCitation?: boolean;
    }
  | {
      kind: 'special';
      id: string;
      containerId: string;
      html: string;
      specialType?: 'toa' | 'other';
    };

type SentenceBlock = Extract<ContentBlock, { kind: 'sentence' }>;

interface WordSimulatorProps {
  initialContent: string;
  onContentChange: (html: string) => void;
  levelId: number;
  onToast: (message: string, type: Toast['type']) => void;
}

const createId = () => `blk-${Math.random().toString(36).slice(2, 9)}`;
const FONT_FAMILIES = [
  'Times New Roman',
  'Arial',
  'Calibri',
  'Georgia',
  'Courier New',
  'Comic Sans MS',
];
const FONT_SIZES = ['10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt'];

const LEVEL_CITATION_SPLITS: Record<number, string[]> = {
  4: [
    'Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993)',
    'Kumho Tire Co. v. Carmichael, 526 U.S. 137 (1999)',
    'People v. Sanchez, 63 Cal. 4th 665 (2016)',
  ],
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const splitIntoSentences = (text: string): string[] => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const abbreviations = new Set([
    'v.',
    'vs.',
    'inc.',
    'corp.',
    'co.',
    'ltd.',
    'u.s.',
    'n.y.',
    'cal.',
    'dr.',
    'no.',
    'llc',
    'l.l.c.',
    's.',
    'p.',
    'pp.',
    'sec.',
  ]);

  const sentences: string[] = [];
  let start = 0;

  const pushSlice = (endIdx: number) => {
    const slice = normalized.slice(start, endIdx).trim();
    if (slice) sentences.push(slice);
    start = endIdx;
  };

  const regex = /([.!?])\s+(?=[A-Z])/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalized)) !== null) {
    const endIdx = (match.index ?? 0) + 1; // include the punctuation
    const snippet = normalized.slice(start, endIdx).trim();
    if (/^\d+\.$/.test(snippet)) {
      continue; // keep list numbering (e.g., "1.") attached to the sentence
    }
    const lastWord = snippet.split(' ').pop()?.toLowerCase();
    if (lastWord && abbreviations.has(lastWord)) {
      continue; // skip splitting on abbreviations common in citations
    }
    pushSlice(endIdx);
  }

  const tail = normalized.slice(start).trim();
  if (tail) sentences.push(tail);

  return sentences.length ? sentences : [normalized];
};

const splitByCitations = (text: string, citations: string[]): string[] => {
  if (!citations.length) return [text];
  const pattern = citations.map((citation) => escapeRegExp(citation)).join('|');
  if (!pattern) return [text];
  const regex = new RegExp(`(${pattern})([.,;:]?)`, 'gi');
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();
    if (before) parts.push(before);
    const citationPart = `${match[1] || ''}${match[2] || ''}`.trim();
    if (citationPart) parts.push(citationPart);
    lastIndex = match.index + match[0].length;
  }

  const tail = text.slice(lastIndex).trim();
  if (tail) parts.push(tail);

  return parts.length ? parts : [text];
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const mergeStyles = (style: string | undefined, updates: Record<string, string | null>): string => {
  const styleMap = new Map<string, string>();
  (style || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [key, value] = part.split(':');
      if (key && value) {
        styleMap.set(key.trim().toLowerCase(), value.trim());
      }
    });

  Object.entries(updates).forEach(([key, value]) => {
    const k = key.toLowerCase();
    if (value === null) {
      styleMap.delete(k);
    } else {
      styleMap.set(k, value);
    }
  });

  return Array.from(styleMap.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
};

const styleStringToObject = (style: string | undefined): React.CSSProperties => {
  const result: Record<string, string> = {};
  if (!style) return result;
  style
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [key, value] = part.split(':');
      if (!key || !value) return;
      const camelKey = key.trim().replace(/-([a-z])/g, (_, g1) => g1.toUpperCase());
      result[camelKey] = value.trim();
    });
  return result as React.CSSProperties;
};

const getStyleValue = (style: string | undefined, key: string): string | undefined => {
  if (!style) return undefined;
  const regex = new RegExp(`${key}\\s*:\\s*([^;]+)`, 'i');
  const match = style.match(regex);
  return match ? match[1].trim().replace(/['"]/g, '') : undefined;
};

const isSentenceBlock = (block: ContentBlock): block is SentenceBlock => block.kind === 'sentence';
const isTOABlock = (block: ContentBlock) =>
  block.kind === 'special' &&
  (block.specialType === 'toa' || block.html.toLowerCase().includes('table of authorities'));

const buildTOAHtml = (citations: string[], pageLabel = 'passim') => {
  const uniqueCitations = Array.from(new Set(citations)).sort();
  const toaEntries = uniqueCitations
    .map(
      (citation) =>
        `<div class="toa-entry"><span class="toa-case">${escapeHtml(citation)}</span><span class="toa-page">${escapeHtml(pageLabel)}</span></div>`,
    )
    .join('');
  return {
    html: `<div class="toa-block" data-toa="true"><div class="toa-title">TABLE OF AUTHORITIES</div><div class="toa-subtitle">Cases</div>${toaEntries}</div>`,
    count: uniqueCitations.length,
  };
};

const blocksToHtml = (blocks: ContentBlock[]): string => {
  const htmlParts: string[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.kind === 'special') {
      htmlParts.push(block.html);
      i += 1;
      continue;
    }

    const group: SentenceBlock[] = [block];
    let j = i + 1;
    while (
      j < blocks.length &&
      blocks[j].kind === 'sentence' &&
      (blocks[j] as SentenceBlock).containerId === block.containerId &&
      (blocks[j] as SentenceBlock).tag === block.tag
    ) {
      group.push(blocks[j] as SentenceBlock);
      j += 1;
    }

    const attrs: string[] = [];
    if (block.style && block.style.trim()) attrs.push(`style="${block.style.trim()}"`);
    if (block.className && block.className.trim()) attrs.push(`class="${block.className.trim()}"`);
    const attrString = attrs.length ? ' ' + attrs.join(' ') : '';

    const sentenceHtml = group
      .map((item) => {
        const baseText = escapeHtml(item.text);
        const citationWrapped = item.isCitation
          ? `<mark data-citation="true" class="citation-marked">${baseText}</mark>`
          : baseText;
        const changeWrapped =
          item.changeType === 'insertion'
            ? `<ins data-insertion="true" class="track-insertion-inline">${citationWrapped}</ins>`
            : item.changeType === 'deletion'
              ? `<del data-deletion="true" class="track-deletion-inline">${citationWrapped}</del>`
              : citationWrapped;
        return changeWrapped;
      })
      .join(' ');

    htmlParts.push(`<${block.tag}${attrString}>${sentenceHtml}</${block.tag}>`);
    i = j;
  }

  return htmlParts.join('');
};

const parseHtmlToBlocks = (
  html: string,
  options?: {
    citationSplits?: string[];
  },
): ContentBlock[] => {
  if (typeof DOMParser === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const output: ContentBlock[] = [];
  const citationSplits = options?.citationSplits?.filter(Boolean) ?? [];

  const pushSentences = (
    containerId: string,
    tag: SentenceTag,
    text: string,
    style: string | undefined,
    className: string | undefined,
    changeType?: ChangeType,
    reviewState?: 'pending' | 'accepted' | 'rejected',
    isCitation?: boolean,
  ) => {
    const sentences = tag.startsWith('h') ? [text.trim()] : splitIntoSentences(text);
    const expanded = citationSplits.length && !tag.startsWith('h')
      ? sentences.flatMap((sentence) => splitByCitations(sentence, citationSplits))
      : sentences;
    expanded.forEach((sentence) => {
      if (!sentence) return;
      output.push({
        kind: 'sentence',
        id: createId(),
        containerId,
        tag,
        text: sentence,
        style,
        className,
        changeType,
        reviewState,
        isCitation,
      });
    });
  };

  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const containerId = createId();
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'div' && (el.classList.contains('toa-block') || el.dataset.toa === 'true')) {
      output.push({
        kind: 'special',
        id: createId(),
        containerId,
        html: el.outerHTML,
        specialType: 'toa',
      });
      return;
    }

    if (!['p', 'h1', 'h2', 'h3'].includes(tagName)) return;

    const style = el.getAttribute('style') || undefined;
    const className = el.getAttribute('class') || undefined;
    const tag = tagName as SentenceTag;

    if (!el.children.length) {
      pushSentences(containerId, tag, el.textContent || '', style, className);
      return;
    }

    Array.from(el.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        pushSentences(containerId, tag, child.textContent || '', style, className);
        return;
      }
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as HTMLElement;
        const childTag = childEl.tagName.toLowerCase();
        if (childTag === 'ins' || childTag === 'del') {
          const ct = childTag === 'ins' ? 'insertion' : 'deletion';
          pushSentences(containerId, tag, childEl.textContent || '', style, className, ct, 'pending');
        } else if (childTag === 'mark') {
          pushSentences(containerId, tag, childEl.textContent || '', style, className, undefined, undefined, true);
        } else {
          pushSentences(containerId, tag, childEl.textContent || '', style, className);
        }
      }
    });
  });

  return output;
};

interface RenderGroup {
  kind: 'special' | 'sentence';
  containerId: string;
  startIndex: number;
  tag?: SentenceTag;
  style?: string;
  className?: string;
  items?: SentenceBlock[];
  html?: string;
  specialType?: 'toa' | 'other';
}

export const WordSimulator: React.FC<WordSimulatorProps> = ({
  initialContent,
  onContentChange,
  levelId,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlacingTOA, setIsPlacingTOA] = useState(false);
  const [placementPreviewIndex, setPlacementPreviewIndex] = useState<number | null>(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const closeDropdowns = useCallback(() => {
    setShowFontDropdown(false);
    setShowSizeDropdown(false);
  }, []);

  useEffect(() => {
    const citationSplits = LEVEL_CITATION_SPLITS[levelId] || [];
    setBlocks(parseHtmlToBlocks(initialContent, { citationSplits }));
    setSelectedIds(new Set());
    setIsInitialized(true);
    setIsPlacingTOA(false);
    setPlacementPreviewIndex(null);
  }, [initialContent, levelId]);

  useEffect(() => {
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, [closeDropdowns]);

  useEffect(() => {
    if (!isInitialized) return;
    onContentChange(blocksToHtml(blocks));
  }, [blocks, onContentChange, isInitialized]);

  const selectedCount = selectedIds.size;
  const citationCount = useMemo(
    () => blocks.filter((b): b is SentenceBlock => isSentenceBlock(b) && Boolean(b.isCitation)).length,
    [blocks],
  );
  const hasReviewableSelection = useMemo(
    () =>
      blocks.some(
        (b): b is SentenceBlock =>
          isSentenceBlock(b) && selectedIds.has(b.id) && Boolean(b.changeType || b.reviewState),
      ),
    [blocks, selectedIds],
  );
  const firstRelevantBlock = useMemo(
    () =>
      blocks.find((b): b is SentenceBlock => isSentenceBlock(b) && selectedIds.has(b.id)) ||
      blocks.find(isSentenceBlock),
    [blocks, selectedIds],
  );
  const currentFont = useMemo(
    () => getStyleValue(firstRelevantBlock?.kind === 'sentence' ? firstRelevantBlock.style : undefined, 'font-family') || 'Times New Roman',
    [firstRelevantBlock],
  );
  const currentSize = useMemo(
    () => getStyleValue(firstRelevantBlock?.kind === 'sentence' ? firstRelevantBlock.style : undefined, 'font-size') || '12pt',
    [firstRelevantBlock],
  );

  const placementIndexFromGroupStart = useCallback(
    (startIndex: number) => {
      const boundedIndex = Math.max(0, Math.min(startIndex, blocks.length));
      return blocks.slice(0, boundedIndex).filter((block) => !isTOABlock(block)).length;
    },
    [blocks],
  );

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleCanvasClick = useCallback(() => {
    clearSelection();
    closeDropdowns();
  }, [clearSelection, closeDropdowns]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const updateBlocks = useCallback(
    (updater: (prev: ContentBlock[]) => ContentBlock[]) => {
      setBlocks((prev) => updater(prev));
    },
    [],
  );

  const applyHeading = useCallback(
    (level: 0 | 1 | 2 | 3) => {
      if (!selectedIds.size) {
        onToast('Select at least one sentence to apply a heading', 'warning');
        return;
      }
      const targetTag: SentenceTag = level === 0 ? 'p' : (`h${level}` as SentenceTag);
      const sizeMap: Record<number, string> = { 0: '12pt', 1: '18pt', 2: '14pt', 3: '12pt' };
      updateBlocks((prev) =>
        prev.map((block) => {
          if (block.kind !== 'sentence') return block;
          if (selectedIds.size && !selectedIds.has(block.id)) return block;
          return {
            ...block,
            tag: targetTag,
            style: mergeStyles(block.style, { 'font-size': sizeMap[level] }),
          };
        }),
      );
      onToast(
        level === 0 ? 'Applied Normal paragraph style' : `Applied Heading ${level} style`,
        'success',
      );
      clearSelection();
    },
    [selectedIds, updateBlocks, onToast, clearSelection],
  );

  const setFontFamily = useCallback(
    (font: string) => {
      updateBlocks((prev) =>
        prev.map((block) => {
          if (block.kind !== 'sentence') return block;
          if (selectedIds.size && !selectedIds.has(block.id)) return block;
          return { ...block, style: mergeStyles(block.style, { 'font-family': font }) };
        }),
      );
      onToast(`Font changed to ${font}`, 'success');
      clearSelection();
    },
    [selectedIds, updateBlocks, onToast, clearSelection],
  );

  const setFontSize = useCallback(
    (size: string) => {
      updateBlocks((prev) =>
        prev.map((block) => {
          if (block.kind !== 'sentence') return block;
          if (selectedIds.size > 0 && !selectedIds.has(block.id)) return block;
          if (selectedIds.size === 0 && block.tag !== 'p') return block;
          return { ...block, style: mergeStyles(block.style, { 'font-size': size }) };
        }),
      );
      onToast(`Font size set to ${size}`, 'success');
      clearSelection();
    },
    [selectedIds, updateBlocks, onToast, clearSelection],
  );

  const markCitation = useCallback(() => {
    if (!selectedIds.size) {
      onToast('Select a sentence to mark as a citation', 'warning');
      return;
    }
    updateBlocks((prev) =>
      prev.map((block) => {
        if (block.kind !== 'sentence') return block;
        if (!selectedIds.has(block.id)) return block;
        return { ...block, isCitation: true };
      }),
    );
    clearSelection();
    onToast('Citation marked', 'success');
  }, [selectedIds, updateBlocks, onToast, clearSelection]);

  const removeTOA = useCallback(() => {
    updateBlocks((prev) => prev.filter((block) => !isTOABlock(block)));
    setIsPlacingTOA(false);
    setPlacementPreviewIndex(null);
    onToast('Table of Authorities removed. Re-run Insert TOA to place it again.', 'info');
  }, [updateBlocks, onToast]);

  const updateTOAFromCitations = useCallback(() => {
    const citations = blocks
      .filter((b): b is SentenceBlock => isSentenceBlock(b) && Boolean(b.isCitation))
      .map((b) => b.text.trim())
      .filter(Boolean);

    if (!citations.length) {
      onToast('No citations marked. Mark citations before updating the TOA.', 'warning');
      return;
    }

    const pageLabel = levelId === 2 || levelId === 4 ? '1' : 'passim';
    const { html: toaHtml, count } = buildTOAHtml(citations, pageLabel);
    let updated = false;
    updateBlocks((prev) =>
      prev.map((block) => {
        if (!updated && isTOABlock(block)) {
          updated = true;
          return { ...block, html: toaHtml, specialType: 'toa' };
        }
        return block;
      }),
    );

    onToast(
      `Table of Authorities updated with ${count} citation${count === 1 ? '' : 's'}`,
      'success',
    );
  }, [blocks, updateBlocks, onToast, levelId]);

  const placeTOAAtIndex = useCallback(
    (targetIndex: number) => {
      const citations = blocks
        .filter((b): b is SentenceBlock => isSentenceBlock(b) && Boolean(b.isCitation))
        .map((b) => b.text.trim())
        .filter(Boolean);

      if (!citations.length) {
        onToast('No citations marked. Mark citations before inserting TOA.', 'warning');
        setIsPlacingTOA(false);
        setPlacementPreviewIndex(null);
        return;
      }

      const pageLabel = levelId === 2 || levelId === 4 ? '1' : 'passim';
      const { html: toaHtml, count } = buildTOAHtml(citations, pageLabel);
      const filteredBlocks = blocks.filter((b) => !isTOABlock(b));
      const clampedIndex = Math.max(0, Math.min(targetIndex, filteredBlocks.length));

      updateBlocks((prev) => {
        const withoutExisting = prev.filter((b) => !isTOABlock(b));
        const safeIndex = Math.max(0, Math.min(targetIndex, withoutExisting.length));
        const newBlock: ContentBlock = {
          kind: 'special',
          id: createId(),
          containerId: createId(),
          html: toaHtml,
          specialType: 'toa',
        };
        return [
          ...withoutExisting.slice(0, safeIndex),
          newBlock,
          ...withoutExisting.slice(safeIndex),
        ];
      });

      setIsPlacingTOA(false);
      setPlacementPreviewIndex(null);
      onToast(
        clampedIndex === 0
          ? `Table of Authorities placed at the top with ${count} citation${count === 1 ? '' : 's'}`
          : `Table of Authorities placed with ${count} citation${count === 1 ? '' : 's'}`,
        'success',
      );
    },
    [blocks, updateBlocks, onToast, levelId],
  );

  const startTOAPlacement = useCallback(() => {
    const citations = blocks
      .filter((b): b is SentenceBlock => isSentenceBlock(b) && Boolean(b.isCitation))
      .map((b) => b.text.trim())
      .filter(Boolean);
    if (!citations.length) {
      onToast('No citations marked. Mark citations before inserting TOA.', 'warning');
      return;
    }
    setIsPlacingTOA(true);
    setPlacementPreviewIndex((prev) => (prev === null ? 0 : prev));
    onToast(
      'Placement mode: hover between paragraphs to preview and click to place the TOA. Use "Exit placement" to cancel.',
      'info',
    );
  }, [blocks, onToast]);

  const cancelTOAPlacement = useCallback(() => {
    setIsPlacingTOA(false);
    setPlacementPreviewIndex(null);
    onToast('TOA placement cancelled', 'info');
  }, [onToast]);

  const acceptSelectedChanges = useCallback(() => {
    if (!selectedIds.size || !hasReviewableSelection) {
      onToast('Select a tracked change to accept', 'warning');
      return;
    }
    updateBlocks((prev) => {
      const next: ContentBlock[] = [];
      prev.forEach((block) => {
        if (block.kind !== 'sentence' || !selectedIds.has(block.id)) {
          next.push(block);
          return;
        }
        if (block.changeType === 'deletion') {
          // Accept deletion: keep it visible but mark as accepted for easy reversal
          next.push({ ...block, reviewState: 'accepted' });
          return;
        }
        if (block.changeType === 'insertion') {
          next.push({ ...block, changeType: undefined, reviewState: 'accepted' });
          return;
        }
        if (block.reviewState) {
          next.push({ ...block, reviewState: 'accepted', changeType: undefined });
          return;
        }
        next.push(block);
      });
      return next;
    });
    onToast('Selected changes accepted', 'success');
    clearSelection();
  }, [selectedIds, updateBlocks, onToast, clearSelection, hasReviewableSelection]);

  const rejectSelectedChanges = useCallback(() => {
    if (!selectedIds.size || !hasReviewableSelection) {
      onToast('Select a tracked change to reject', 'warning');
      return;
    }
    updateBlocks((prev) => {
      const next: ContentBlock[] = [];
      prev.forEach((block) => {
        if (block.kind !== 'sentence' || !selectedIds.has(block.id)) {
          next.push(block);
          return;
        }
        if (block.changeType === 'insertion') {
          // Reject insertion: keep marked so it remains visible (and still fails grading) but mark state
          next.push({ ...block, reviewState: 'rejected' });
          return;
        }
        if (block.changeType === 'deletion') {
          // Reject deletion: keep text, clear change mark, mark as rejected decision
          next.push({ ...block, changeType: undefined, reviewState: 'rejected' });
          return;
        }
        if (block.reviewState) {
          next.push({ ...block, reviewState: 'rejected' });
          return;
        }
        next.push(block);
      });
      return next;
    });
    onToast('Selected changes rejected', 'success');
    clearSelection();
  }, [selectedIds, updateBlocks, onToast, clearSelection, hasReviewableSelection]);

  const acceptAllChanges = useCallback(() => {
    updateBlocks((prev) => {
      const next: ContentBlock[] = [];
      prev.forEach((block) => {
        if (block.kind !== 'sentence') {
          next.push(block);
          return;
        }
        if (block.changeType === 'deletion') {
          next.push({ ...block, reviewState: 'accepted' });
          return;
        }
        if (block.changeType === 'insertion') {
          next.push({ ...block, changeType: undefined, reviewState: 'accepted' });
          return;
        }
        next.push(block);
      });
      return next;
    });
    onToast('All changes accepted', 'success');
    clearSelection();
  }, [updateBlocks, onToast, clearSelection]);

  const TagFor = (tag: SentenceTag) => tag as IntrinsicTag;

  const renderGroups: RenderGroup[] = useMemo(() => {
    const groups: RenderGroup[] = [];
    let idx = 0;
    while (idx < blocks.length) {
      const block = blocks[idx];
      if (block.kind === 'special') {
        groups.push({
          kind: 'special',
          containerId: block.containerId,
          startIndex: idx,
          html: block.html,
          specialType: block.specialType,
        });
        idx += 1;
        continue;
      }
      const sentenceBlock: SentenceBlock = block;
      const items: SentenceBlock[] = [sentenceBlock];
      let j = idx + 1;
      while (j < blocks.length) {
        const nextBlock = blocks[j];
        if (!isSentenceBlock(nextBlock)) break;
        if (
          nextBlock.containerId === sentenceBlock.containerId &&
          nextBlock.tag === sentenceBlock.tag
        ) {
          items.push(nextBlock);
          j += 1;
          continue;
        }
        break;
      }
      groups.push({
        kind: 'sentence',
        containerId: sentenceBlock.containerId,
        startIndex: idx,
        tag: sentenceBlock.tag,
        style: sentenceBlock.style,
        className: sentenceBlock.className,
        items,
      });
      idx = j;
    }
    return groups;
  }, [blocks]);

  const renderPlacementIndicator = useCallback(
    (targetIndex: number, key: string, label?: string) => {
      if (!isPlacingTOA) return null;
      const isActive = placementPreviewIndex === targetIndex;
      return (
        <div
          key={`placement-${key}`}
          className={`placement-indicator${isActive ? ' active' : ''}`}
          onMouseEnter={(e) => {
            e.stopPropagation();
            setPlacementPreviewIndex(targetIndex);
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            setPlacementPreviewIndex(targetIndex);
          }}
          onClick={(e) => {
            e.stopPropagation();
            placeTOAAtIndex(targetIndex);
          }}
        >
          <div className="placement-line" />
          <div className="placement-label">{label || 'Insert TOA here'}</div>
        </div>
      );
    },
    [isPlacingTOA, placementPreviewIndex, placeTOAAtIndex],
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
      <div className="bg-white border-b border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            className={`ribbon-tab${activeTab === 'home' ? ' active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`ribbon-tab${activeTab === 'insert' ? ' active' : ''}`}
            onClick={() => setActiveTab('insert')}
          >
            Insert
          </button>
          <button
            className={`ribbon-tab${activeTab === 'references' ? ' active' : ''}`}
            onClick={() => setActiveTab('references')}
          >
            References
          </button>
          <button
            className={`ribbon-tab${activeTab === 'review' ? ' active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            Review
          </button>
        </div>

        <div className="p-2 flex items-center gap-4 min-h-[80px]">
          {activeTab === 'home' && (
            <>
              <div className="ribbon-group">
                <div className="flex items-center gap-1">
                  <button className="ribbon-button" onClick={() => applyHeading(1)}>
                    <Heading1 className="w-5 h-5" />
                    <span>Heading 1</span>
                  </button>
                  <button className="ribbon-button" onClick={() => applyHeading(2)}>
                    <Heading2 className="w-5 h-5" />
                    <span>Heading 2</span>
                  </button>
                  <button className="ribbon-button" onClick={() => applyHeading(3)}>
                    <Heading3 className="w-5 h-5" />
                    <span>Heading 3</span>
                  </button>
                  <button className="ribbon-button" onClick={() => applyHeading(0)}>
                    <Type className="w-5 h-5" />
                    <span>Normal</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Styles</div>
              </div>

              <div className="w-px h-16 bg-slate-200" />

              <div className="ribbon-group">
                <div className="flex items-center gap-2 ribbon-dropdown-row">
                  <div className="relative ribbon-dropdown">
                    <button
                      className="ribbon-combo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFontDropdown((prev) => !prev);
                        setShowSizeDropdown(false);
                      }}
                    >
                      <Type className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 text-left truncate">{currentFont}</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>
                    {showFontDropdown && (
                      <div className="ribbon-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        {FONT_FAMILIES.map((font) => (
                          <button
                            key={font}
                            className={`ribbon-dropdown-option${currentFont === font ? ' active' : ''}`}
                            style={{ fontFamily: font }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFontFamily(font);
                              setShowFontDropdown(false);
                            }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative ribbon-dropdown">
                    <button
                      className="ribbon-combo narrow"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSizeDropdown((prev) => !prev);
                        setShowFontDropdown(false);
                      }}
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 text-left">{currentSize}</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>
                    {showSizeDropdown && (
                      <div className="ribbon-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size}
                            className={`ribbon-dropdown-option${currentSize === size ? ' active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFontSize(size);
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
                <div className="ribbon-group-label">Font</div>
              </div>

              <div className="w-px h-16 bg-slate-200" />

              <div className="ribbon-group">
                <div className="flex items-center gap-2">
                  <button className="ribbon-button" onClick={() => setSelectedIds(new Set(blocks.filter(isSentenceBlock).map((b) => b.id)))}>
                    <CheckSquare className="w-5 h-5" />
                    <span>Select All</span>
                  </button>
                  <button className="ribbon-button" onClick={clearSelection}>
                    <XSquare className="w-5 h-5" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Selection</div>
              </div>
            </>
          )}

          {activeTab === 'references' && (
            <>
              <div className="ribbon-group">
                <div className="flex items-center gap-2">
                  <button className="ribbon-button" onClick={markCitation}>
                    <BookMarked className="w-5 h-5" />
                    <span>Mark Citation</span>
                  </button>
                  <button
                    className={`ribbon-button${isPlacingTOA ? ' active' : ''}`}
                    onClick={startTOAPlacement}
                  >
                    <ListOrdered className="w-5 h-5" />
                    <span>{isPlacingTOA ? 'Pick Location' : 'Insert TOA'}</span>
                  </button>
                  {isPlacingTOA && (
                    <button className="ribbon-button" onClick={cancelTOAPlacement}>
                      <XSquare className="w-5 h-5 text-red-500" />
                      <span>Exit Placement</span>
                    </button>
                  )}
                </div>
                <div className="ribbon-group-label">Authorities</div>
              </div>
              {citationCount > 0 && (
                <div className="px-3 py-2 bg-indigo-50 rounded-lg text-xs text-indigo-600 font-medium">
                  {citationCount} citation{citationCount === 1 ? '' : 's'} marked
                </div>
              )}
              {isPlacingTOA && (
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                  Placement mode: hover between paragraphs to preview, then click to insert the TOA at the very top of the document for full credit.
                </div>
              )}
            </>
          )}

          {activeTab === 'review' && (
            <>
              <div className="ribbon-group">
                <div className="flex items-center gap-2">
                  <button className="ribbon-button" onClick={acceptSelectedChanges} disabled={!hasReviewableSelection}>
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <span>Accept</span>
                  </button>
                  <button className="ribbon-button" onClick={rejectSelectedChanges} disabled={!hasReviewableSelection}>
                    <XSquare className="w-5 h-5 text-red-600" />
                    <span>Reject</span>
                  </button>
                </div>
                <div className="ribbon-group-label">Changes</div>
              </div>

              <div className="w-px h-16 bg-slate-200" />

              <div className="ribbon-group">
                <button className="ribbon-button" onClick={acceptAllChanges}>
                  <FileText className="w-5 h-5" />
                  <span>Accept All</span>
                </button>
                <div className="ribbon-group-label">All Changes</div>
              </div>

              {levelId === 3 && (
                <div className="ml-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-xs">
                  <div className="text-xs text-amber-800">
                    <strong>Client: TechStart Inc. (Tenant).</strong> Review each change from the tenant's perspective - accept helpful additions, and reject deletions that strip tenant protections (especially the termination clause).
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'insert' && (
            <div className="text-slate-500 text-sm px-4">
              Insert tools live in References (Table of Authorities)
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-slate-200" onClick={handleCanvasClick}>
        <div
          className={`document-paper${isPlacingTOA ? ' placing-toa' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            clearSelection();
          }}
        >
          {renderGroups.map((group) => {
            const insertionIndex = placementIndexFromGroupStart(group.startIndex);

            if (group.kind === 'special') {
              return (
                <React.Fragment key={group.containerId}>
                  {renderPlacementIndicator(
                    insertionIndex,
                    `before-${group.containerId}`,
                    insertionIndex === 0 ? 'Top of document (for full credit)' : undefined,
                  )}
                  {group.specialType === 'toa' ? (
                    <div
                      className="special-block toa-wrapper"
                      onMouseEnter={() => {
                        if (isPlacingTOA) setPlacementPreviewIndex(insertionIndex);
                      }}
                      onClick={(e) => {
                        if (!isPlacingTOA) return;
                        e.stopPropagation();
                        placeTOAAtIndex(insertionIndex);
                      }}
                    >
                      <div
                        className="toa-contents"
                        dangerouslySetInnerHTML={{ __html: group.html || '' }}
                      />
                      <div className="toa-actions">
                        <span className="toa-hint">Table of Authorities</span>
                        <div className="toa-action-buttons">
                          <button
                            className="toa-update-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTOAFromCitations();
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Update</span>
                          </button>
                          <button
                            className="toa-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTOA();
                            }}
                          >
                            <XSquare className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="special-block"
                      onMouseEnter={() => {
                        if (isPlacingTOA) setPlacementPreviewIndex(insertionIndex);
                      }}
                      dangerouslySetInnerHTML={{ __html: group.html || '' }}
                    />
                  )}
                </React.Fragment>
              );
            }

            const Tag = TagFor(group.tag || 'p');
            return (
              <React.Fragment key={group.containerId}>
                {renderPlacementIndicator(
                  insertionIndex,
                  `before-${group.containerId}`,
                  insertionIndex === 0 ? 'Top of document (for full credit)' : undefined,
                )}
                <Tag
                  className={group.className}
                  style={styleStringToObject(group.style)}
                  onMouseEnter={() => {
                    if (isPlacingTOA) setPlacementPreviewIndex(insertionIndex);
                  }}
                >
                  {group.items?.map((item, idxItem) => {
                    const isSelected = selectedIds.has(item.id);
                    const statusClass =
                      item.reviewState === 'accepted'
                        ? 'change-accepted'
                        : item.reviewState === 'rejected'
                          ? 'change-rejected'
                          : item.changeType
                            ? 'change-pending'
                            : '';
                    const classes = ['sentence-block', isSelected ? 'selected' : '', item.isCitation ? 'citation-block' : '', statusClass]
                      .filter(Boolean)
                      .join(' ');

                    const inlineStatus =
                      item.reviewState || (item.changeType ? 'pending' : undefined);

                    const content = (
                      <>
                        {item.changeType === 'insertion' && (
                          <span className={`track-change-inline insertion ${inlineStatus ? `change-${inlineStatus}` : ''}`}>
                            {item.isCitation ? (
                              <mark data-citation="true" className="citation-marked">
                                {item.text}
                              </mark>
                            ) : (
                              item.text
                            )}
                          </span>
                        )}
                        {item.changeType === 'deletion' && (
                          <span className={`track-change-inline deletion ${inlineStatus ? `change-${inlineStatus}` : ''}`}>
                            {item.isCitation ? (
                              <mark data-citation="true" className="citation-marked">
                                {item.text}
                              </mark>
                            ) : (
                              item.text
                            )}
                          </span>
                        )}
                        {!item.changeType &&
                          (item.isCitation ? (
                            <mark data-citation="true" className="citation-marked">
                              {item.text}
                            </mark>
                          ) : (
                            <span className={inlineStatus ? `track-change-inline change-${inlineStatus}` : ''}>
                              {item.text}
                            </span>
                          ))}
                      </>
                    );

                    return (
                      <span
                        key={item.id}
                        className={classes}
                        onMouseEnter={() => {
                          if (isPlacingTOA) setPlacementPreviewIndex(insertionIndex);
                        }}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          closeDropdowns();
                          if (isPlacingTOA) {
                            placeTOAAtIndex(insertionIndex);
                            return;
                          }
                          toggleSelection(item.id);
                        }}
                      >
                        {content}
                        {idxItem < (group.items?.length || 0) - 1 ? ' ' : null}
                      </span>
                    );
                  })}
                </Tag>
              </React.Fragment>
            );
          })}
          {renderPlacementIndicator(
            placementIndexFromGroupStart(blocks.length),
            'after-all',
            'Insert TOA here',
          )}
        </div>
      </div>

      <div className="bg-slate-700 text-slate-300 text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Page 1 of 1</span>
          {isPlacingTOA && <span className="text-amber-300 font-semibold">TOA placement mode</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>{blocks.length} blocks</span>
          <span className="text-emerald-400">{selectedCount} selected</span>
        </div>
      </div>
    </div>
  );
};
