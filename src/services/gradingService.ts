import type { GradingResult } from '../types';

// Helper to parse HTML and extract elements
function parseHTML(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}


// Extract font from style attribute or computed style
function getFontFamily(element: Element): string | null {
  const style = element.getAttribute('style') || '';
  const fontMatch = style.match(/font-family:\s*([^;]+)/i);
  return fontMatch ? fontMatch[1].trim().replace(/['"]/g, '') : null;
}

// Extract font size from style attribute
function getFontSize(element: Element): string | null {
  const style = element.getAttribute('style') || '';
  const sizeMatch = style.match(/font-size:\s*([^;]+)/i);
  return sizeMatch ? sizeMatch[1].trim() : null;
}

export function gradeLevel1(html: string): GradingResult {
  const errors: string[] = [];
  let score = 0;
  const maxScore = 4;
  
  const doc = parseHTML(html);
  
  // Check 1: All text should be Times New Roman
  let hasWrongFonts = false;
  const elementsToCheck = doc.querySelectorAll('p, h1, h2, h3');
  
  elementsToCheck.forEach(el => {
    const font = getFontFamily(el);
    // Check if font is set and is not Times New Roman
    // Also check child spans for font settings
    if (font && !font.includes('Times New Roman')) {
      hasWrongFonts = true;
    }
    
    // Check spans within for font family too
    el.querySelectorAll('span[style*="font-family"]').forEach(span => {
      const spanFont = getFontFamily(span);
      if (spanFont && !spanFont.includes('Times New Roman')) {
        hasWrongFonts = true;
      }
    });
  });
  
  // Also check if Comic Sans is still present anywhere
  if (html.includes('Comic Sans')) {
    hasWrongFonts = true;
  }
  
  // If no font specified and no Comic Sans, assume it's been reset to default (Times New Roman)
  if (!hasWrongFonts || !html.includes('Comic Sans')) {
    const hasAnyTimesNewRoman = html.includes('Times New Roman');
    const noComicSans = !html.includes('Comic Sans');
    
    if (hasAnyTimesNewRoman && noComicSans) {
      score++;
    } else if (noComicSans && !html.includes('font-family')) {
      // Font removed entirely (default) is also acceptable
      score++;
    } else {
      errors.push('Some text is still using incorrect font (expected: Times New Roman)');
    }
  } else {
    errors.push('Some text is still using incorrect font (expected: Times New Roman)');
  }
  
  // Check 2: "CASE BRIEF" should be Heading 1
  const h1Elements = doc.querySelectorAll('h1');
  const caseBriefIsH1 = Array.from(h1Elements).some(h1 => 
    h1.textContent?.toUpperCase().includes('CASE BRIEF')
  );
  
  if (caseBriefIsH1) {
    score++;
  } else {
    errors.push('The title "CASE BRIEF" should be formatted as Heading 1');
  }
  
  // Check 3: Section headers should be Heading 2
  const sectionHeaders = ['Statement of Facts', 'Legal Issues', 'Applicable Law'];
  const h2Elements = doc.querySelectorAll('h2');
  const h2Texts = Array.from(h2Elements).map(h2 => h2.textContent?.trim().toLowerCase() || '');
  
  const headersCorrect = sectionHeaders.every(header => 
    h2Texts.some(h2Text => h2Text.includes(header.toLowerCase()))
  );
  
  if (headersCorrect) {
    score++;
  } else {
    errors.push('Section headers (Statement of Facts, Legal Issues, Applicable Law) should be Heading 2');
  }
  
  // Check 4: Body text should be 12pt
  const bodyParagraphs = doc.querySelectorAll('p');
  let wrongSizeCount = 0;
  
  bodyParagraphs.forEach(p => {
    const content = p.textContent?.trim() || '';
    // Skip section headers that might still be paragraphs
    if (sectionHeaders.some(h => content.toLowerCase().includes(h.toLowerCase()))) {
      return;
    }
    if (content.toUpperCase().includes('CASE BRIEF')) {
      return;
    }
    
    // Check font size
    const size = getFontSize(p);
    if (size && size !== '12pt' && size !== '12px') {
      // 14pt for headers is expected, only body should be 12pt
      if (!content.includes('Johnson v.')) { // Skip subtitle
        wrongSizeCount++;
      }
    }
  });
  
  // Be lenient - if most body text is 12pt or unspecified (default), that's OK
  if (wrongSizeCount <= 2) {
    score++;
  } else {
    errors.push('Some body paragraphs are not using 12pt font size');
  }
  
  const passed = score >= maxScore;
  
  return {
    passed,
    score,
    maxScore,
    errors,
    feedback: passed
      ? 'Excellent work! The document now meets professional legal formatting standards.'
      : 'The document still needs formatting corrections. Review the feedback and try again.',
  };
}

export function gradeLevel2(html: string): GradingResult {
  const errors: string[] = [];
  let score = 0;
  const maxScore = 3;
  
  const doc = parseHTML(html);
  
  // Required citations
  const requiredCitations = [
    'Anderson v. Liberty Lobby',
    'Celotex Corp. v. Catrett',
    'Palsgraf v. Long Island Railroad',
    'Rowland v. Christian',
    'Li v. Yellow Cab',
    'Knight v. Jewett',
  ];
  
  // Check 1: TOA exists
  const toaElement = doc.querySelector('.toa-block, [data-toa="true"]');
  const toaInHtml = html.includes('TABLE OF AUTHORITIES') && html.includes('toa-');
  
  if (toaElement || toaInHtml) {
    score++;
  } else {
    errors.push('Table of Authorities has not been generated. Use the References tab to insert a TOA.');
    return { passed: false, score, maxScore, errors, feedback: 'You need to generate a Table of Authorities.' };
  }
  
  // Check 2: TOA is at the top of the document (right at the start)
  const bodyElements = Array.from(doc.body.children).filter(
    (el) => el.textContent && el.textContent.trim().length > 0,
  );
  const normalizedToaIndex = bodyElements.findIndex((el) => {
    if (toaElement) return el === toaElement || el.contains(toaElement);
    return (el.textContent || '').toLowerCase().includes('table of authorities');
  });

  if (normalizedToaIndex !== -1 && normalizedToaIndex <= 1) {
    score++;
  } else {
    errors.push('The Table of Authorities must be placed at the very top of the document (directly under the title).');
  }
  
  // Check 3: All citations are marked (check for citation marks)
  const markedCitations = doc.querySelectorAll('mark[data-citation], .citation-marked');
  const markedTexts = Array.from(markedCitations).map(el => el.textContent?.toLowerCase() || '');
  
  // Also check TOA content for citations
  const toaContent = toaElement?.textContent?.toLowerCase() || '';
  const toaHtmlSection = html.substring(
    html.indexOf('TABLE OF AUTHORITIES'),
    html.indexOf('</div>', html.indexOf('TABLE OF AUTHORITIES')) + 6
  ).toLowerCase();
  
  const missingCitations = requiredCitations.filter(citation => {
    const citationLower = citation.toLowerCase();
    const caseName = citationLower.split(' v. ')[0];
    
    // Check if citation is marked in document OR appears in TOA
    const isMarked = markedTexts.some(marked => marked.includes(caseName));
    const inTOA = toaContent.includes(caseName) || toaHtmlSection.includes(caseName);
    
    return !isMarked && !inTOA;
  });
  
  if (missingCitations.length === 0) {
    score++;
  } else {
    errors.push(`Missing citations in TOA: ${missingCitations.join(', ')}`);
  }
  
  const passed = score >= maxScore;
  
  return {
    passed,
    score,
    maxScore,
    errors,
    feedback: passed
      ? 'Excellent! All citations have been properly marked and the Table of Authorities is complete.'
      : 'The Table of Authorities is incomplete. Make sure all citations are marked before generating.',
  };
}

export function gradeLevel3(html: string): GradingResult {
  const errors: string[] = [];
  let score = 0;
  const maxScore = 3;
  
  const doc = parseHTML(html);
  
  // Check for remaining insertions (should be accepted = marks removed)
  const insertions = doc.querySelectorAll('ins, [data-insertion="true"]');
  const deletions = doc.querySelectorAll('del, [data-deletion="true"]');
  
  // Get text content to check what's still there
  const fullText = doc.body.textContent?.toLowerCase() || '';
  
  // Check 1: Extension option should be ACCEPTED (insertion mark removed, text kept)
  const extensionTextExists = fullText.includes('option to extend');
  const extensionStillMarked = Array.from(insertions).some(el => 
    el.textContent?.toLowerCase().includes('option to extend')
  );
  
  // Check 2: Late fee should be ACCEPTED (insertion mark removed, text kept)
  const lateFeeTextExists = fullText.includes('late fee');
  const lateFeeStillMarked = Array.from(insertions).some(el => 
    el.textContent?.toLowerCase().includes('late fee')
  );
  
  // Both insertions should be accepted (text present, not marked)
  if (extensionTextExists && !extensionStillMarked && lateFeeTextExists && !lateFeeStillMarked) {
    score++;
  } else {
    if (!extensionTextExists) {
      errors.push('The lease extension option was rejected but should have been accepted (it benefits your client).');
    } else if (extensionStillMarked) {
      errors.push('The lease extension option insertion has not been reviewed yet.');
    }
    if (!lateFeeTextExists) {
      errors.push('The late fee insertion was rejected but is a standard commercial term.');
    } else if (lateFeeStillMarked) {
      errors.push('The late fee insertion has not been reviewed yet.');
    }
  }
  
  // Check 3: CRITICAL - Termination clause should be REJECTED (deletion mark removed, text KEPT)
  const terminationTextExists = fullText.includes('terminate this agreement');
  const terminationStillMarked = Array.from(deletions).some(el => 
    el.textContent?.toLowerCase().includes('terminate this agreement')
  );
  
  if (terminationTextExists && !terminationStillMarked) {
    // Perfect - deletion was rejected, text is preserved without deletion mark
    score += 2; // Worth 2 points because it's critical
  } else if (terminationStillMarked) {
    // Deletion mark still there - hasn't been reviewed
    errors.push('CRITICAL: The termination clause deletion has not been reviewed yet. You must reject this deletion!');
  } else if (!terminationTextExists) {
    // Text is gone - user accepted the deletion (wrong!)
    errors.push("CRITICAL ERROR: You accepted the deletion of the termination clause! This removes your client's ability to exit the lease early. The deletion should have been REJECTED to preserve your client's rights.");
  }
  
  const passed = score >= maxScore;
  
  return {
    passed,
    score,
    maxScore,
    errors,
    feedback: passed
      ? "Outstanding! You correctly identified and protected your client's interests by rejecting the harmful deletion while accepting beneficial insertions."
      : "Review your changes carefully. Remember: accept changes that benefit or are neutral to your client, reject changes that harm their interests.",
  };
}

export function gradeDocument(levelId: number, html: string): GradingResult {
  switch (levelId) {
    case 1:
      return gradeLevel1(html);
    case 2:
      return gradeLevel2(html);
    case 3:
      return gradeLevel3(html);
    default:
      return {
        passed: false,
        score: 0,
        maxScore: 0,
        errors: ['Unknown level'],
        feedback: 'Error: Unknown level',
      };
  }
}
