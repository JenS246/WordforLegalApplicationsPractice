import type { Level } from '../types/index';

// Level 1: The Improper Brief - Document with Comic Sans that needs formatting fixes
const level1Document = `
<p style="font-family: Comic Sans MS; text-align: center;">CASE BRIEF</p>
<p style="font-family: Comic Sans MS; text-align: center;">Johnson v. Metropolitan Transit Authority</p>
<p style="font-family: Comic Sans MS;">Statement of Facts</p>
<p style="font-family: Comic Sans MS; font-size: 11pt;">On March 15, 2024, the plaintiff, Sarah Johnson, was a passenger on a Metropolitan Transit Authority bus traveling southbound on Main Street. At approximately 3:45 PM, the bus driver, employed by the defendant, failed to observe a red traffic signal at the intersection of Main Street and Oak Avenue.</p>
<p style="font-family: Comic Sans MS; font-size: 11pt;">As a result of the driver's negligence, the bus collided with a passenger vehicle lawfully proceeding through the intersection. The plaintiff sustained significant injuries including a fractured clavicle, multiple contusions, and cervical strain requiring ongoing physical therapy.</p>
<p style="font-family: Comic Sans MS;">Legal Issues</p>
<p style="font-family: Comic Sans MS; font-size: 11pt;">1. Whether the defendant's employee was acting within the scope of employment at the time of the incident.</p>
<p style="font-family: Comic Sans MS; font-size: 11pt;">2. Whether the doctrine of respondeat superior applies to hold the defendant vicariously liable for the employee's negligence.</p>
<p style="font-family: Comic Sans MS;">Applicable Law</p>
<p style="font-family: Comic Sans MS; font-size: 11pt;">Under established principles of agency law, an employer may be held vicariously liable for the tortious acts of an employee committed within the scope of employment. See Restatement (Third) of Agency, Section 2.04.</p>
`;

// Level 2: Citation Nightmare - Document with citations that need to be marked
const level2Document = `
<h1 style="text-align: center;">MEMORANDUM OF LAW IN SUPPORT OF MOTION FOR SUMMARY JUDGMENT</h1>
<h2>I. INTRODUCTION</h2>
<p style="text-align: justify;">Defendant XYZ Corporation respectfully submits this memorandum in support of its motion for summary judgment. As demonstrated below, plaintiff cannot establish the essential elements of her negligence claim.</p>
<h2>II. STATEMENT OF FACTS</h2>
<p style="text-align: justify;">The undisputed facts establish that on June 1, 2024, plaintiff visited defendant's retail location. Plaintiff alleges she slipped on a wet floor, but video evidence shows she was distracted by her mobile phone at the time of the incident.</p>
<h2>III. ARGUMENT</h2>
<p style="text-align: justify;">Summary judgment is appropriate when there is no genuine dispute as to any material fact. Anderson v. Liberty Lobby, Inc., 477 U.S. 242 (1986). The moving party bears the initial burden of demonstrating the absence of a genuine issue of material fact. Celotex Corp. v. Catrett, 477 U.S. 317 (1986).</p>
<p style="text-align: justify;">To establish negligence, plaintiff must prove duty, breach, causation, and damages. Palsgraf v. Long Island Railroad Co., 248 N.Y. 339 (1928). Property owners owe a duty of reasonable care to invitees. Rowland v. Christian, 69 Cal. 2d 108 (1968).</p>
<p style="text-align: justify;">However, a plaintiff's comparative negligence may bar or reduce recovery. Li v. Yellow Cab Co., 13 Cal. 3d 804 (1975). Where a plaintiff fails to exercise ordinary care for her own safety, she cannot recover fully. Knight v. Jewett, 3 Cal. 4th 296 (1992).</p>
<h2>IV. CONCLUSION</h2>
<p style="text-align: justify;">For the foregoing reasons, defendant respectfully requests that this Court grant summary judgment in its favor.</p>
`;

// Level 3: Redline Review - Document with tracked changes using <ins> and <del> tags
const level3Document = `
<h1 style="text-align: center;">COMMERCIAL LEASE AGREEMENT</h1>
<p style="text-align: justify;">This Commercial Lease Agreement ("Agreement") is entered into as of January 1, 2026, by and between ABC Properties LLC ("Landlord") and TechStart Inc. ("Tenant").</p>
<h2>1. PREMISES</h2>
<p style="text-align: justify;">Landlord hereby leases to Tenant, and Tenant hereby leases from Landlord, the commercial space located at 500 Innovation Drive, Suite 200, San Francisco, CA 94107 (the "Premises"), consisting of approximately 5,000 square feet.</p>
<h2>2. TERM</h2>
<p style="text-align: justify;">The initial term of this Lease shall be for a period of three (3) years, commencing on February 1, 2026, and terminating on January 31, 2029, unless sooner terminated in accordance with the provisions hereof.</p>
<p style="text-align: justify;"><ins data-insertion="true" class="track-insertion-inline">Tenant shall have the option to extend this lease for an additional two (2) year term upon written notice to Landlord no less than ninety (90) days prior to expiration.</ins></p>
<h2>3. RENT</h2>
<p style="text-align: justify;">Tenant agrees to pay Landlord a monthly base rent of $15,000, payable in advance on the first day of each calendar month.</p>
<p style="text-align: justify;"><ins data-insertion="true" class="track-insertion-inline">A late fee of 5% shall be assessed on any payment received more than five (5) business days after the due date.</ins></p>
<h2>4. SECURITY DEPOSIT</h2>
<p style="text-align: justify;">Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $30,000 as a security deposit.</p>
<h2>5. TERMINATION</h2>
<p style="text-align: justify;"><del data-deletion="true" class="track-deletion-inline">Either party may terminate this Agreement with ninety (90) days written notice for any reason, subject to payment of an early termination fee equal to two (2) months rent.</del></p>
<h2>6. MAINTENANCE</h2>
<p style="text-align: justify;">Landlord shall be responsible for structural repairs and maintenance of common areas. Tenant shall maintain the interior of the Premises in good condition.</p>
`;

// Level 4: Final Assembly - Motion with formatting, citations, and tracked changes
const level4Document = `
<p style="text-align: center; font-family: Calibri; font-size: 11pt; font-weight: 700;">[A STANDARD CAPTION WOULD BE INSERTED HERE]</p>
<p style="text-align: center; font-family: Calibri; font-size: 16pt; font-weight: 700;">MOTION IN LIMINE TO LIMIT EXPERT TESTIMONY</p>
<p style="font-family: Calibri; font-size: 11pt; font-weight: 700;">Background</p>
<p style="text-align: justify; font-family: Calibri; font-size: 11pt;">Plaintiff designated Dr. Lee to testify about warehouse ergonomics. The expert relies on limited site data and has offered opinions on medical causation without specialized training.</p>
<p style="font-family: Calibri; font-size: 11pt; font-weight: 700;">Issues Presented</p>
<p style="text-align: justify; font-family: Calibri; font-size: 11pt;">Whether Dr. Lee's methodology satisfies Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993), and Kumho Tire Co. v. Carmichael, 526 U.S. 137 (1999).</p>
<p style="font-family: Calibri; font-size: 11pt; font-weight: 700;">Argument</p>
<p style="text-align: justify; font-family: Calibri; font-size: 11pt;"><ins data-insertion="true" class="track-insertion-inline">Defendant will provide all materials relied on by Dr. Lee within five (5) days of the ruling.</ins></p>
<p style="text-align: justify; font-family: Calibri; font-size: 11pt;">Courts exclude expert opinions that rest on speculation. See People v. Sanchez, 63 Cal. 4th 665 (2016).</p>
<p style="text-align: justify; font-family: Calibri; font-size: 11pt;"><del data-deletion="true" class="track-deletion-inline">Dr. Lee may supplement opinions up to the eve of trial without additional disclosure.</del></p>
<p style="font-family: Calibri; font-size: 11pt; font-weight: 700;">Relief Requested</p>
<p style="text-align: justify; font-family: Calibri; font-size: 11pt;">Defendant requests an order limiting Dr. Lee's testimony to ergonomics and requiring timely disclosure of relied-upon materials.</p>
`;

export const levels: Level[] = [
  {
    id: 1,
    title: 'The Improper Brief',
    subtitle: 'Basic Formatting & Styles',
    difficulty: 'junior',
    description: 'A new associate has submitted a case brief using Comic Sans and inconsistent formatting. Your task is to fix the document before it reaches the senior partner.',
    objective: 'Standardize the document with proper legal formatting: Times New Roman font and heading styles.',
    skills: ['Font Formatting', 'Heading Styles', 'Document Standards'],
    tasks: [
      { id: 't1-1', description: 'Change all text to Times New Roman font', hint: 'Select all text (Ctrl+A) and use the Font dropdown in the Home tab' },
      { id: 't1-2', description: 'Apply Heading 1 style to "CASE BRIEF"', hint: 'Select the title and click Heading 1 in the Styles dropdown' },
      { id: 't1-3', description: 'Apply Heading 2 style to section headers', hint: 'Statement of Facts, Legal Issues, and Applicable Law should be Heading 2' },
      { id: 't1-4', description: 'Ensure body text uses 12pt font size', hint: 'Select body paragraphs and set size to 12pt' },
    ],
    initialDocument: level1Document,
  },
  {
    id: 2,
    title: 'Citation Nightmare',
    subtitle: 'Table of Authorities Generation',
    difficulty: 'associate',
    description: 'A legal memorandum contains multiple case citations that need to be properly marked and compiled into a Table of Authorities.',
    objective: 'Identify and mark all legal citations, then generate a proper Table of Authorities at the top of the document.',
    skills: ['Citation Recognition', 'TOA Generation', 'Legal Research'],
    tasks: [
      { id: 't2-1', description: 'Mark citation: Anderson v. Liberty Lobby, Inc.', hint: 'Select the citation text and use Mark Citation in References tab' },
      { id: 't2-2', description: 'Mark citation: Celotex Corp. v. Catrett', hint: 'Highlight the full case name with citation' },
      { id: 't2-3', description: 'Mark citation: Palsgraf v. Long Island Railroad Co.', hint: 'Classic torts case on proximate cause' },
      { id: 't2-4', description: 'Mark all remaining citations', hint: "Don't forget Rowland, Li, and Knight cases" },
      { id: 't2-5', description: 'Insert the Table of Authorities at the very top of the document', hint: 'Click Insert TOA to enter placement mode, hover to pick the top slot (just under the title), and click to place it. Use Exit Placement if you need to cancel.' },
    ],
    initialDocument: level2Document,
  },
  {
    id: 3,
    title: 'Redline Review',
    subtitle: 'Track Changes Review (Tenant perspective)',
    difficulty: 'senior',
    description: 'You are reviewing redlines on behalf of the tenant. Opposing counsel has proposed several edits; some are routine, but one deletion could seriously harm your tenant client. In practice you would review your accept or reject decisions with your supervising attorney before finalizing.',
    objective: "Protect TechStart Inc. (Tenant): accept helpful or neutral edits, and reject anything that harms the tenant's rights.",
    skills: ['Track Changes', 'Contract Review', 'Risk Analysis'],
    tasks: [
      { id: 't3-1', description: 'Review the lease extension option insertion', hint: 'This addition benefits your client (tenant)' },
      { id: 't3-2', description: 'Review the late fee insertion', hint: 'Standard commercial term, reasonable to accept' },
      { id: 't3-3', description: 'Review the termination clause deletion', hint: "CRITICAL: Removing this clause eliminates your client's exit option!" },
      { id: 't3-4', description: 'Accept all legitimate changes', hint: 'Insertions that benefit or are neutral to tenant' },
      { id: 't3-5', description: 'Reject harmful deletions', hint: 'The termination clause must be preserved' },
    ],
    initialDocument: level3Document,
  },
  {
    id: 4,
    title: 'The Filing Desk Check',
    subtitle: 'Formatting, citations, and redlines',
    difficulty: 'senior',
    description: 'Assemble a motion for filing. Fix the formatting, mark every case, place a TOA at the top, and make careful accept or reject decisions. Confirm the work you would send to a supervising attorney for sign-off.',
    objective: 'Deliver a filing-ready motion that matches firm standards for formatting, citations, and redline decisions.',
    skills: ['Legal Formatting', 'Citation Management', 'Track Changes', 'Quality Control'],
    tasks: [
      { id: 't4-1', description: 'Normalize formatting: Times New Roman, title as Heading 1, section headers as Heading 2, body at 12pt', hint: 'Clean up Calibri, promote the title to Heading 1, and reset body text to 12pt Times New Roman' },
      { id: 't4-2', description: 'Mark all case citations and insert the Table of Authorities at the very top', hint: 'Mark Daubert, Kumho Tire, and Sanchez, then place the TOA directly under the title (beneath the caption block)' },
      { id: 't4-3', description: 'Accept helpful insertions (production deadline)', hint: 'Keep the commitment to produce Dr. Lee materials; it benefits your client' },
      { id: 't4-4', description: 'Reject harmful deletions (protect disclosure limits)', hint: 'Do not allow unlimited expert supplements; keep the disclosure restriction in place' },
    ],
    initialDocument: level4Document,
  },
];
