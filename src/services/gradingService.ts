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

const isTwelvePoint = (size: string | null): boolean => {
  if (!size) return true; // treat unspecified as acceptable/default
  const cleaned = size.toLowerCase().replace(/\s+/g, '');
  return /^12(\.0+)?(pt|px)?$/.test(cleaned);
};

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
    if (!isTwelvePoint(size) && !content.includes('Johnson v.')) {
      wrongSizeCount++;
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

export function gradeLevel4(html: string): GradingResult {
  const errors: string[] = [];
  let score = 0;
  const maxScore = 4;

  const doc = parseHTML(html);
  const fullText = doc.body.textContent?.toLowerCase() || '';

  // Check 1: Formatting (Times New Roman, Heading 1 title, Heading 2 sections, 12pt body)
  const elements = Array.from(doc.querySelectorAll('p, h1, h2, h3'));
  const allTimesNewRoman =
    elements.length > 0 &&
    elements.every((el) => {
      const style = el.getAttribute('style') || '';
      if (/comic sans/i.test(style)) return false;
      if (/calibri/i.test(style)) return false;
      const fontMatch = style.match(/font-family\s*:\s*([^;]+)/i);
      return !fontMatch || /times new roman/i.test(fontMatch[1]);
    });

  const bodyParagraphs = Array.from(doc.querySelectorAll('p'));
  const captionPlaceholderMatch = (text: string) => {
    const lower = text.toLowerCase();
    return (
      lower.includes('CAPTION WOULD BE INSERTED HERE') ||
      lower.includes('CAPTION WOULD BE HERE') ||
      lower.includes('[A')
    );
  };
  const paragraphsToCheck = bodyParagraphs.filter(
    (p) => !captionPlaceholderMatch(p.textContent || ''),
  );
  const bodySizeOk =
    paragraphsToCheck.length === 0 ||
    paragraphsToCheck.every((p) => {
      const sizeMatch = (p.getAttribute('style') || '').match(/font-size\s*:\s*([0-9.]+)pt/i);
      if (!sizeMatch) return true;
      const size = parseFloat(sizeMatch[1]);
      return Math.abs(size - 12) < 0.01;
    });

  const titleOk = /<h1[^>]*>.*?motion in limine.*?<\/h1>/i.test(html);
  const h2Labels = ['Background', 'Issues Presented', 'Argument', 'Relief Requested'];
  const h2Ok = h2Labels.every((label) => new RegExp(`<h2[^>]*>.*?${label}.*?<\\/h2>`, 'i').test(html));

  if (allTimesNewRoman && bodySizeOk && titleOk && h2Ok) {
    score++;
  } else {
    errors.push('Formatting is off: ensure Times New Roman throughout, 12pt body text, a Heading 1 title, and Heading 2 section headers.');
  }

  // Check 2: Citations marked and TOA at top
  const requiredCitations = ['daubert v. merrell dow', 'kumho tire co. v. carmichael', 'people v. sanchez'];
  const toaElement = doc.querySelector('.toa-block, [data-toa="true"]');
  const bodyEls = Array.from(doc.body.children).filter((el) => el.textContent && el.textContent.trim().length > 0);
  const toaIndex = bodyEls.findIndex((el) => {
    if (toaElement) return el === toaElement || el.contains(toaElement);
    return (el.textContent || '').toLowerCase().includes('table of authorities');
  });
  const titleIndex = bodyEls.findIndex(
    (el) =>
      el.tagName.toLowerCase() === 'h1' &&
      (el.textContent || '').toLowerCase().includes('motion in limine'),
  );
  const toaAtTop =
    toaIndex !== -1 && (titleIndex === -1 ? toaIndex <= 1 : toaIndex <= titleIndex + 1);

  const markedCitations = Array.from(doc.querySelectorAll('mark[data-citation], .citation-marked')).map(
    (el) => (el.textContent || '').toLowerCase(),
  );
  const toaText = (toaElement?.textContent || '').toLowerCase();
  const missingCitations = requiredCitations.filter((c) => {
    const caseName = c.split(' v. ')[0];
    return !markedCitations.some((text) => text.includes(caseName)) && !toaText.includes(caseName);
  });

  if (toaElement && toaAtTop && missingCitations.length === 0) {
    score++;
  } else {
    if (!toaElement) errors.push('Insert a Table of Authorities.');
    else if (!toaAtTop) errors.push('Place the Table of Authorities at the very top under the title.');
    if (missingCitations.length) errors.push(`Mark these citations and rebuild the TOA: ${missingCitations.join(', ')}`);
  }

  // Check 3: Helpful insertion accepted
  const insertionText = 'provide all materials relied on by dr. lee';
  const insertionPresent = fullText.includes(insertionText);
  const insertionStillMarked = /<ins[^>]*>.*?provide all materials relied on by dr\. lee/i.test(html);
  if (insertionPresent && !insertionStillMarked) {
    score++;
  } else {
    errors.push('Accept the insertion committing to provide Dr. Lee materials (remove the insertion mark, keep the text).');
  }

  // Check 4: Harmful deletion rejected
  const deletionText = 'may supplement opinions up to the eve of trial';
  const deletionPresent = fullText.includes(deletionText);
  const deletionStillMarked = /<del[^>]*>.*?may supplement opinions up to the eve of trial/i.test(html);
  if (deletionPresent && !deletionStillMarked) {
    score++;
  } else {
    errors.push('Reject the deletion that would allow unlimited expert supplements (keep the sentence and remove the deletion mark).');
  }

  const passed = score >= maxScore;

  return {
    passed,
    score,
    maxScore,
    errors,
    feedback: passed
      ? 'Great work. The motion reads filing-ready: formatting is clean, citations are marked with a TOA on top, and your change decisions protect the client.'
      : 'Close the gaps above to reach filing-ready quality: check formatting, TOA placement, and your accept or reject decisions.',
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
    case 4:
      return gradeLevel4(html);
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
