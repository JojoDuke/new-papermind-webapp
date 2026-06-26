export type MockExamCategoryId =
  | 'nursing'
  | 'finance'
  | 'accounting'
  | 'actuarial'
  | 'medicine'
  | 'cybersecurity'
  | 'law'
  | 'engineering';

export type MockExamCatalogItem = {
  id: string;
  title: string;
  categoryId: MockExamCategoryId;
  questionCount: number;
  timeLimitMinutes: number;
  description: string;
  /** When set, clicking start creates a real session via Convex. */
  examType?: 'nclex-rn';
};

export type MockExamCategory = {
  id: MockExamCategoryId;
  label: string;
  accent: string;
  accentBg: string;
  iconPath: string;
};

export const MOCK_EXAM_CATEGORIES: MockExamCategory[] = [
  {
    id: 'nursing',
    label: 'Nursing',
    accent: 'text-purple-600 dark:text-purple-400',
    accentBg: 'bg-purple-100 dark:bg-purple-950/40',
    iconPath:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    id: 'finance',
    label: 'Finance',
    accent: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconPath:
      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'accounting',
    label: 'Accounting',
    accent: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-100 dark:bg-blue-950/40',
    iconPath:
      'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
  {
    id: 'actuarial',
    label: 'Actuarial',
    accent: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    id: 'medicine',
    label: 'Medicine',
    accent: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-100 dark:bg-rose-950/40',
    iconPath:
      'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    accent: 'text-cyan-600 dark:text-cyan-400',
    accentBg: 'bg-cyan-100 dark:bg-cyan-950/40',
    iconPath:
      'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    id: 'law',
    label: 'Law',
    accent: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-100 dark:bg-indigo-950/40',
    iconPath:
      'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    accent: 'text-orange-600 dark:text-orange-400',
    accentBg: 'bg-orange-100 dark:bg-orange-950/40',
    iconPath:
      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
];

export const MOCK_EXAM_CATALOG: MockExamCatalogItem[] = [
  // Nursing
  {
    id: 'nclex-rn-a',
    title: 'NCLEX-RN Practice Exam A',
    categoryId: 'nursing',
    questionCount: 75,
    timeLimitMinutes: 90,
    description: 'Full-length NCLEX-RN simulation from Papermind\'s curated nursing bank.',
    examType: 'nclex-rn',
  },
  {
    id: 'nclex-rn-b',
    title: 'NCLEX-RN Practice Exam B',
    categoryId: 'nursing',
    questionCount: 75,
    timeLimitMinutes: 90,
    description: 'Alternate NCLEX-RN set covering pharmacology, med-surg, and patient safety.',
    examType: 'nclex-rn',
  },
  {
    id: 'pediatric-nursing',
    title: 'Pediatric Nursing',
    categoryId: 'nursing',
    questionCount: 60,
    timeLimitMinutes: 75,
    description: 'Growth & development, pediatric meds, and family-centered care scenarios.',
  },
  {
    id: 'pharmacology-review',
    title: 'Pharmacology Review',
    categoryId: 'nursing',
    questionCount: 50,
    timeLimitMinutes: 60,
    description: 'Drug classes, interactions, and safe medication administration.',
  },
  {
    id: 'med-surg-fundamentals',
    title: 'Med-Surg Fundamentals',
    categoryId: 'nursing',
    questionCount: 65,
    timeLimitMinutes: 80,
    description: 'Post-op care, fluid balance, and acute illness management.',
  },
  {
    id: 'mental-health-nursing',
    title: 'Mental Health Nursing',
    categoryId: 'nursing',
    questionCount: 45,
    timeLimitMinutes: 55,
    description: 'Therapeutic communication, crisis intervention, and psychotropic meds.',
  },
  {
    id: 'maternal-newborn',
    title: 'Maternal & Newborn',
    categoryId: 'nursing',
    questionCount: 55,
    timeLimitMinutes: 70,
    description: 'Prenatal care, labor & delivery, and newborn assessment.',
  },
  {
    id: 'community-health',
    title: 'Community Health',
    categoryId: 'nursing',
    questionCount: 40,
    timeLimitMinutes: 50,
    description: 'Public health, epidemiology, and population-based nursing.',
  },

  // Finance
  {
    id: 'cfa-level-1',
    title: 'CFA Level I Mock',
    categoryId: 'finance',
    questionCount: 90,
    timeLimitMinutes: 120,
    description: 'Ethics, quant methods, economics, and financial reporting.',
  },
  {
    id: 'cfa-level-2',
    title: 'CFA Level II Mock',
    categoryId: 'finance',
    questionCount: 88,
    timeLimitMinutes: 120,
    description: 'Asset valuation, portfolio management, and item-set format.',
  },
  {
    id: 'series-7',
    title: 'Series 7 Practice',
    categoryId: 'finance',
    questionCount: 75,
    timeLimitMinutes: 90,
    description: 'Securities regulations, equity products, and client suitability.',
  },
  {
    id: 'financial-modeling',
    title: 'Financial Modeling Exam',
    categoryId: 'finance',
    questionCount: 50,
    timeLimitMinutes: 75,
    description: 'DCF, LBO models, and three-statement forecasting.',
  },
  {
    id: 'corporate-finance',
    title: 'Corporate Finance',
    categoryId: 'finance',
    questionCount: 60,
    timeLimitMinutes: 80,
    description: 'Capital structure, WACC, and M&A fundamentals.',
  },
  {
    id: 'portfolio-theory',
    title: 'Portfolio Theory',
    categoryId: 'finance',
    questionCount: 45,
    timeLimitMinutes: 60,
    description: 'Modern portfolio theory, CAPM, and risk-adjusted returns.',
  },
  {
    id: 'fixed-income',
    title: 'Fixed Income Analysis',
    categoryId: 'finance',
    questionCount: 55,
    timeLimitMinutes: 70,
    description: 'Bond pricing, duration, convexity, and yield curves.',
  },
  {
    id: 'derivatives',
    title: 'Derivatives & Options',
    categoryId: 'finance',
    questionCount: 48,
    timeLimitMinutes: 65,
    description: 'Options strategies, futures, and hedging with derivatives.',
  },

  // Accounting
  {
    id: 'cpa-far',
    title: 'CPA FAR Practice',
    categoryId: 'accounting',
    questionCount: 66,
    timeLimitMinutes: 240,
    description: 'Financial accounting & reporting — GAAP, revenue, and leases.',
  },
  {
    id: 'cpa-aud',
    title: 'CPA AUD Practice',
    categoryId: 'accounting',
    questionCount: 78,
    timeLimitMinutes: 240,
    description: 'Auditing procedures, internal controls, and audit reports.',
  },
  {
    id: 'cpa-reg',
    title: 'CPA REG Practice',
    categoryId: 'accounting',
    questionCount: 72,
    timeLimitMinutes: 240,
    description: 'Federal taxation, business law, and professional ethics.',
  },
  {
    id: 'managerial-accounting',
    title: 'Managerial Accounting',
    categoryId: 'accounting',
    questionCount: 50,
    timeLimitMinutes: 90,
    description: 'Cost behavior, budgeting, variance analysis, and decision making.',
  },
  {
    id: 'financial-statements',
    title: 'Financial Statements',
    categoryId: 'accounting',
    questionCount: 55,
    timeLimitMinutes: 75,
    description: 'Balance sheet, income statement, and cash flow analysis.',
  },
  {
    id: 'tax-accounting',
    title: 'Tax Accounting',
    categoryId: 'accounting',
    questionCount: 60,
    timeLimitMinutes: 90,
    description: 'Individual and corporate tax, deductions, and credits.',
  },
  {
    id: 'cost-accounting',
    title: 'Cost Accounting',
    categoryId: 'accounting',
    questionCount: 45,
    timeLimitMinutes: 70,
    description: 'Job order, process costing, and activity-based costing.',
  },
  {
    id: 'accounting-ethics',
    title: 'Accounting Ethics',
    categoryId: 'accounting',
    questionCount: 40,
    timeLimitMinutes: 55,
    description: 'Professional standards, independence, and ethical dilemmas.',
  },

  // Actuarial
  {
    id: 'exam-p',
    title: 'Exam P — Probability',
    categoryId: 'actuarial',
    questionCount: 30,
    timeLimitMinutes: 180,
    description: 'General probability, univariate & multivariate distributions.',
  },
  {
    id: 'exam-fm',
    title: 'Exam FM — Financial Math',
    categoryId: 'actuarial',
    questionCount: 35,
    timeLimitMinutes: 180,
    description: 'Interest theory, annuities, and loan amortization.',
  },
  {
    id: 'exam-ifm',
    title: 'Exam IFM — Investments',
    categoryId: 'actuarial',
    questionCount: 30,
    timeLimitMinutes: 180,
    description: 'Derivatives, fixed income, and portfolio management.',
  },
  {
    id: 'exam-srm',
    title: 'Exam SRM — Statistics',
    categoryId: 'actuarial',
    questionCount: 35,
    timeLimitMinutes: 180,
    description: 'Regression, time series, and predictive modeling.',
  },
  {
    id: 'exam-stam',
    title: 'Exam STAM — Short-Term Actuarial',
    categoryId: 'actuarial',
    questionCount: 35,
    timeLimitMinutes: 180,
    description: 'Severity models, aggregate models, and credibility.',
  },
  {
    id: 'exam-ltam',
    title: 'Exam LTAM — Long-Term Actuarial',
    categoryId: 'actuarial',
    questionCount: 30,
    timeLimitMinutes: 180,
    description: 'Life contingencies, survival models, and premiums.',
  },
  {
    id: 'exam-pa',
    title: 'Exam PA — Predictive Analytics',
    categoryId: 'actuarial',
    questionCount: 5,
    timeLimitMinutes: 300,
    description: 'Project-based predictive analytics assessment.',
  },
  {
    id: 'veea',
    title: 'VEE Accounting & Finance',
    categoryId: 'actuarial',
    questionCount: 40,
    timeLimitMinutes: 90,
    description: 'Validation by Educational Experience — accounting & finance topics.',
  },

  // Medicine
  {
    id: 'usmle-step-1',
    title: 'USMLE Step 1 Practice',
    categoryId: 'medicine',
    questionCount: 40,
    timeLimitMinutes: 60,
    description: 'Biochemistry, pathology, pharmacology, and organ systems.',
  },
  {
    id: 'usmle-step-2',
    title: 'USMLE Step 2 CK',
    categoryId: 'medicine',
    questionCount: 40,
    timeLimitMinutes: 60,
    description: 'Clinical knowledge — diagnosis, management, and prevention.',
  },
  {
    id: 'anatomy-physiology',
    title: 'Anatomy & Physiology',
    categoryId: 'medicine',
    questionCount: 50,
    timeLimitMinutes: 75,
    description: 'Body systems, organ function, and clinical correlations.',
  },
  {
    id: 'clinical-medicine',
    title: 'Clinical Medicine',
    categoryId: 'medicine',
    questionCount: 55,
    timeLimitMinutes: 80,
    description: 'Patient presentation, differential diagnosis, and treatment plans.',
  },
  {
    id: 'pharmacology-med',
    title: 'Medical Pharmacology',
    categoryId: 'medicine',
    questionCount: 45,
    timeLimitMinutes: 65,
    description: 'Mechanism of action, side effects, and drug interactions.',
  },
  {
    id: 'pathology',
    title: 'Pathology Review',
    categoryId: 'medicine',
    questionCount: 50,
    timeLimitMinutes: 70,
    description: 'Disease processes, histology, and lab interpretation.',
  },
  {
    id: 'microbiology',
    title: 'Microbiology & Immunology',
    categoryId: 'medicine',
    questionCount: 40,
    timeLimitMinutes: 55,
    description: 'Bacteria, viruses, fungi, and immune response.',
  },
  {
    id: 'surgery-basics',
    title: 'Surgery Basics',
    categoryId: 'medicine',
    questionCount: 35,
    timeLimitMinutes: 50,
    description: 'Pre-op assessment, common procedures, and post-op care.',
  },

  // Cybersecurity
  {
    id: 'security-plus',
    title: 'Security+ Practice',
    categoryId: 'cybersecurity',
    questionCount: 90,
    timeLimitMinutes: 90,
    description: 'Threats, architecture, operations, and governance.',
  },
  {
    id: 'cissp',
    title: 'CISSP Mock Exam',
    categoryId: 'cybersecurity',
    questionCount: 150,
    timeLimitMinutes: 180,
    description: 'Eight CISSP domains — security & risk management through software dev.',
  },
  {
    id: 'ceh',
    title: 'CEH Ethical Hacking',
    categoryId: 'cybersecurity',
    questionCount: 125,
    timeLimitMinutes: 240,
    description: 'Reconnaissance, scanning, exploitation, and post-exploitation.',
  },
  {
    id: 'network-security',
    title: 'Network Security Fundamentals',
    categoryId: 'cybersecurity',
    questionCount: 60,
    timeLimitMinutes: 75,
    description: 'Firewalls, IDS/IPS, VPNs, and network segmentation.',
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security',
    categoryId: 'cybersecurity',
    questionCount: 55,
    timeLimitMinutes: 70,
    description: 'AWS/Azure security, IAM, and shared responsibility model.',
  },
  {
    id: 'incident-response',
    title: 'Incident Response',
    categoryId: 'cybersecurity',
    questionCount: 45,
    timeLimitMinutes: 60,
    description: 'Detection, containment, eradication, and recovery workflows.',
  },
  {
    id: 'cryptography',
    title: 'Cryptography Essentials',
    categoryId: 'cybersecurity',
    questionCount: 50,
    timeLimitMinutes: 65,
    description: 'Symmetric/asymmetric encryption, hashing, and PKI.',
  },
  {
    id: 'soc-analyst',
    title: 'SOC Analyst',
    categoryId: 'cybersecurity',
    questionCount: 40,
    timeLimitMinutes: 55,
    description: 'SIEM alerts, log analysis, and threat hunting basics.',
  },

  // Law
  {
    id: 'bar-multistate',
    title: 'Bar Exam — MBE',
    categoryId: 'law',
    questionCount: 200,
    timeLimitMinutes: 360,
    description: 'Multistate Bar Examination — constitutional, criminal, and tort law.',
  },
  {
    id: 'contracts-law',
    title: 'Contracts Law',
    categoryId: 'law',
    questionCount: 50,
    timeLimitMinutes: 75,
    description: 'Formation, performance, breach, and remedies.',
  },
  {
    id: 'criminal-law',
    title: 'Criminal Law',
    categoryId: 'law',
    questionCount: 45,
    timeLimitMinutes: 70,
    description: 'Elements of crimes, defenses, and constitutional protections.',
  },
  {
    id: 'constitutional-law',
    title: 'Constitutional Law',
    categoryId: 'law',
    questionCount: 55,
    timeLimitMinutes: 80,
    description: 'Separation of powers, federalism, and individual rights.',
  },

  // Engineering
  {
    id: 'fe-civil',
    title: 'FE Civil Practice',
    categoryId: 'engineering',
    questionCount: 110,
    timeLimitMinutes: 330,
    description: 'Fundamentals of Engineering — civil discipline.',
  },
  {
    id: 'fe-mechanical',
    title: 'FE Mechanical Practice',
    categoryId: 'engineering',
    questionCount: 110,
    timeLimitMinutes: 330,
    description: 'Thermodynamics, mechanics, and machine design.',
  },
  {
    id: 'fe-electrical',
    title: 'FE Electrical Practice',
    categoryId: 'engineering',
    questionCount: 110,
    timeLimitMinutes: 330,
    description: 'Circuits, electronics, and power systems.',
  },
  {
    id: 'pe-structural',
    title: 'PE Structural',
    categoryId: 'engineering',
    questionCount: 80,
    timeLimitMinutes: 480,
    description: 'Structural analysis, steel & concrete design.',
  },
];

export function getCategoryById(id: MockExamCategoryId): MockExamCategory {
  const category = MOCK_EXAM_CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}

export function getExamsByCategory(categoryId: MockExamCategoryId): MockExamCatalogItem[] {
  return MOCK_EXAM_CATALOG.filter((exam) => exam.categoryId === categoryId);
}
