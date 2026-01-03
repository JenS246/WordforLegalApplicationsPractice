// Known legal citations for smart detection
const knownCitations = [
  'Anderson v. Liberty Lobby, Inc., 477 U.S. 242 (1986)',
  'Celotex Corp. v. Catrett, 477 U.S. 317 (1986)',
  'Palsgraf v. Long Island Railroad Co., 248 N.Y. 339 (1928)',
  'Rowland v. Christian, 69 Cal. 2d 108 (1968)',
  'Li v. Yellow Cab Co., 13 Cal. 3d 804 (1975)',
  'Knight v. Jewett, 3 Cal. 4th 296 (1992)',
];

// Regex pattern for legal citations
// Matches patterns like: "Case v. Case, 123 Reporter 456 (Year)"
const citationPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+v\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,?\s+Inc\.?|,?\s+Corp\.?|,?\s+Co\.?|,?\s+LLC)?),?\s*(\d+)\s+([A-Z][a-z.]+(?:\s+\d*[a-z]*)?)\s+(\d+)\s*\((\d{4})\)/g;

export interface DetectedCitation {
  fullText: string;
  caseName: string;
  volume: string;
  reporter: string;
  page: string;
  year: string;
  startIndex: number;
  endIndex: number;
}

export function detectCitationsInText(text: string): DetectedCitation[] {
  const citations: DetectedCitation[] = [];
  
  // First, check against known citations
  for (const known of knownCitations) {
    const index = text.indexOf(known);
    if (index !== -1) {
      const parts = known.match(/(.+?)\s+v\.\s+(.+?),\s*(\d+)\s+(.+?)\s+(\d+)\s*\((\d{4})\)/);
      if (parts) {
        citations.push({
          fullText: known,
          caseName: `${parts[1]} v. ${parts[2]}`,
          volume: parts[3],
          reporter: parts[4],
          page: parts[5],
          year: parts[6],
          startIndex: index,
          endIndex: index + known.length,
        });
      }
    }
  }

  // Also try regex pattern for any citations we might have missed
  let match;
  const regex = new RegExp(citationPattern.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    const fullText = match[0];
    // Check if we already found this citation
    if (!citations.some(c => c.fullText === fullText)) {
      citations.push({
        fullText,
        caseName: `${match[1]} v. ${match[2]}`,
        volume: match[3],
        reporter: match[4],
        page: match[5],
        year: match[6],
        startIndex: match.index,
        endIndex: match.index + fullText.length,
      });
    }
  }

  return citations;
}

export function expandToCitation(text: string, cursorPosition: number): DetectedCitation | null {
  const citations = detectCitationsInText(text);
  
  // Find a citation that contains the cursor position
  for (const citation of citations) {
    if (cursorPosition >= citation.startIndex && cursorPosition <= citation.endIndex) {
      return citation;
    }
  }

  // If no exact match, check if cursor is near a citation (within 10 characters)
  for (const citation of citations) {
    if (cursorPosition >= citation.startIndex - 10 && cursorPosition <= citation.endIndex + 10) {
      return citation;
    }
  }

  return null;
}

export function findCitationInParagraph(paragraphContent: string): DetectedCitation | null {
  const citations = detectCitationsInText(paragraphContent);
  return citations.length > 0 ? citations[0] : null;
}

export function getAllCitationsFromParagraphs(paragraphs: { content: string; isMarkedCitation?: boolean }[]): string[] {
  const markedCitations: string[] = [];
  
  for (const para of paragraphs) {
    if (para.isMarkedCitation) {
      const citation = findCitationInParagraph(para.content);
      if (citation) {
        markedCitations.push(citation.fullText);
      }
    }
  }

  // Remove duplicates
  return [...new Set(markedCitations)];
}

export function generateTOAContent(citations: string[]): string {
  if (citations.length === 0) {
    return 'TABLE OF AUTHORITIES\n\nNo citations marked.';
  }

  // Sort citations alphabetically by case name
  const sorted = [...citations].sort((a, b) => {
    const nameA = a.split(' v. ')[0];
    const nameB = b.split(' v. ')[0];
    return nameA.localeCompare(nameB);
  });

  let content = 'TABLE OF AUTHORITIES\n\nCases:\n\n';
  sorted.forEach((citation, index) => {
    content += `${citation}`;
    if (index < sorted.length - 1) {
      content += '\n';
    }
  });

  return content;
}

