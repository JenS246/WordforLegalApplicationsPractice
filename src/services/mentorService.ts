interface MentorResponse {
  message: string;
  isHint: boolean;
}

const level1Responses: Record<string, MentorResponse> = {
  font: {
    message: "Great question! Legal documents should use professional fonts like Times New Roman. Select the text and use the Font dropdown in the Home tab to change it from Comic Sans.",
    isHint: true,
  },
  heading: {
    message: "Heading styles help organize the document and create a professional hierarchy. Use Heading 1 for the main title and Heading 2 for section headers. You'll find these in the Styles group.",
    isHint: true,
  },
  style: {
    message: "Styles are pre-defined formatting sets. For legal briefs, the title should be Heading 1 and section headers should be Heading 2. This also helps with automatic table of contents generation later!",
    isHint: true,
  },
  size: {
    message: "Standard legal documents use 12pt font for body text. The title can be larger. Select your text and use the Font Size dropdown to adjust.",
    isHint: true,
  },
  comic: {
    message: "Comic Sans is definitely not appropriate for legal documents! 😅 We need to change it to Times New Roman throughout. Select all text (Ctrl+A) or click on individual paragraphs.",
    isHint: true,
  },
  help: {
    message: "I'm here to help! For this level, focus on: 1) Changing all fonts to Times New Roman, 2) Making the title Heading 1, 3) Making section headers Heading 2. What specific part are you stuck on?",
    isHint: false,
  },
  stuck: {
    message: "No worries, formatting can be tricky! Try this: Click on a paragraph to select it, then use the Home tab to change the font and styles. You can Ctrl+Click to select multiple paragraphs at once!",
    isHint: true,
  },
};

const level2Responses: Record<string, MentorResponse> = {
  toa: {
    message: "A Table of Authorities (TOA) is like a bibliography for legal citations. It lists all the cases cited in your document. First, mark each citation using the Mark Citation button, then generate the TOA and place it right at the top of the memo.",
    isHint: true,
  },
  citation: {
    message: "Legal citations follow specific formats. Look for patterns like 'Case Name v. Case Name, Volume Reporter Page (Year)'. For example: 'Anderson v. Liberty Lobby, Inc., 477 U.S. 242 (1986)'.",
    isHint: true,
  },
  mark: {
    message: "To mark a citation: click anywhere on or near the citation text, then click 'Mark Citation' in the References tab. The system will automatically detect and highlight the full citation!",
    isHint: true,
  },
  insert: {
    message: "After marking all citations, click 'Insert TOA' to enter placement mode. Hover to move the placement indicator and click at the very top of the document (right under the title) to drop the TOA. Use Exit Placement in the ribbon if you change your mind.",
    isHint: true,
  },
  case: {
    message: "I see several case citations in this document: Anderson, Celotex, Palsgraf, Rowland, Li, and Knight. Make sure to mark all of them before generating the TOA!",
    isHint: true,
  },
  help: {
    message: "The workflow is: 1) Find each case citation in the document, 2) Click on it and Mark Citation, 3) Repeat for all citations, 4) Click Insert TOA to enter placement mode, 5) Click at the top of the document to place it. Need help finding the citations?",
    isHint: false,
  },
  stuck: {
    message: "Let me help! Look in the Argument section - you'll find most citations there. Click on any citation (the system will expand your selection), then hit Mark Citation. The yellow highlight confirms it's marked.",
    isHint: true,
  },
};

const level3Responses: Record<string, MentorResponse> = {
  track: {
    message: "Track Changes (redlining) shows proposed edits. Green highlighted text with insertion markers are additions. Red strikethrough text are proposed deletions. Review each carefully!",
    isHint: true,
  },
  accept: {
    message: "To accept a change, select the paragraph with the change and click 'Accept' in the Review tab. The change will be incorporated into the final document.",
    isHint: true,
  },
  reject: {
    message: "To reject a change, select the paragraph and click 'Reject'. For deletions, this keeps the original text. For insertions, this removes the proposed addition.",
    isHint: true,
  },
  delete: {
    message: "Be very careful with deletions. In this lease, there's a proposed deletion of the termination clause. Ask yourself whether removing it helps or hurts our tenant client.",
    isHint: true,
  },
  termination: {
    message: "The termination clause lets our tenant client exit the lease early with proper notice. Accepting the deletion would lock them in for 3 years with no exit option - that's a major risk.",
    isHint: true,
  },
  insert: {
    message: "The insertions in this lease are: 1) a lease extension option (good for the tenant), 2) a late fee provision (standard commercial term). Both are generally acceptable.",
    isHint: true,
  },
  help: {
    message: "Review each change: accept insertions that benefit or are neutral to your client. Reject deletions that harm your client's interests. The termination clause deletion is the critical one.",
    isHint: false,
  },
  stuck: {
    message: "Here's the key insight: your client is the tenant. Ask for each change: 'Does this help or hurt the tenant?' The extension option helps. The late fee is neutral. But losing the termination clause? That hurts.",
    isHint: true,
  },
  client: {
    message: "Our client is TechStart Inc., the tenant. As their paralegal, we need to protect their interests. They might need flexibility to exit if the business doesn't work out - that's what the termination clause provides.",
    isHint: true,
  },
};

const genericResponses: MentorResponse[] = [
  { message: "I'm Sarah, your senior paralegal mentor! What can I help you with?", isHint: false },
  { message: "That's a great question! Could you be more specific about what you're trying to do?", isHint: false },
  { message: "I'm not sure I understand. Try asking about fonts, styles, citations, or track changes depending on your current level.", isHint: false },
  { message: "Remember, you can always use Ctrl+Z to undo if you make a mistake!", isHint: true },
];

export function getMentorResponse(query: string, levelId: number): string {
  const lowerQuery = query.toLowerCase();
  
  let responses: Record<string, MentorResponse>;
  
  switch (levelId) {
    case 1:
      responses = level1Responses;
      break;
    case 2:
      responses = level2Responses;
      break;
    case 3:
      responses = level3Responses;
      break;
    default:
      responses = {};
  }

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerQuery.includes(keyword)) {
      return response.message;
    }
  }

  // Return a generic response if no keyword match
  const randomIndex = Math.floor(Math.random() * genericResponses.length);
  return genericResponses[randomIndex].message;
}

export function getWelcomeMessage(levelId: number): string {
  switch (levelId) {
    case 1:
      return "Hi! I'm Sarah, your senior paralegal mentor. I see you're working on the formatting exercise. That Comic Sans has GOT to go! Let me know if you need any tips on fonts or heading styles.";
    case 2:
      return "Welcome back! This one's about building a Table of Authorities. It looks intimidating, but I'll walk you through it. Start by finding the case citations in the Argument section, then drop the TOA at the top of the memo using placement mode. Ask me if you need help!";
    case 3:
      return "This is the advanced level - contract redlining. We represent the tenant, TechStart Inc., so judge every change by whether it helps or hurts the tenant. Some insertions are fine, but one deletion could really hurt our client. What do you think it might be?";
    default:
      return "Hi! I'm Sarah, your senior paralegal mentor. How can I help you today?";
  }
}







