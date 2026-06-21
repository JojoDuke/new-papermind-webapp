/** Curated NCLEX-RN questions for Papermind's mock exam bank. */
export const NCLEX_RN_BANK_QUESTIONS: {
  question: string;
  correctAnswer: string;
  distractor1: string;
  distractor2: string;
  distractor3?: string;
  topic?: string;
}[] = [
  {
    topic: "Pharmacology",
    question:
      "A nurse is reviewing a newly prescribed medication and notes it should not be crushed. Which instruction is most appropriate for the client?",
    correctAnswer: "Swallow the tablet whole with water",
    distractor1: "Crush the tablet and mix it with applesauce",
    distractor2: "Chew the tablet before swallowing",
    distractor3: "Open the capsule and sprinkle contents on food",
  },
  {
    topic: "Safety",
    question:
      "Which action should the nurse take first after discovering a client has fallen in the bathroom?",
    correctAnswer: "Assess the client for injury and vital signs",
    distractor1: "Help the client stand and return to bed",
    distractor2: "Notify the provider before assessing the client",
    distractor3: "Complete an incident report before leaving the room",
  },
  {
    topic: "Infection control",
    question:
      "A nurse enters the room of a client on contact precautions. Which personal protective equipment is required?",
    correctAnswer: "Gown and gloves",
    distractor1: "N95 respirator only",
    distractor2: "Gloves only",
    distractor3: "Surgical mask and eye protection only",
  },
  {
    topic: "Fundamentals",
    question:
      "Which finding best indicates a client with heart failure is responding to diuretic therapy?",
    correctAnswer: "Decreased lung crackles and lower daily weight",
    distractor1: "Increased blood pressure and heart rate",
    distractor2: "Dry mucous membranes with stable weight",
    distractor3: "Report of increased thirst and concentrated urine",
  },
  {
    topic: "Pediatrics",
    question:
      "A toddler is admitted with suspected dehydration. Which assessment finding is the priority concern?",
    correctAnswer: "Delayed capillary refill and lethargy",
    distractor1: "Report of decreased appetite",
    distractor2: "One episode of loose stool today",
    distractor3: "Mildly elevated temperature",
  },
  {
    topic: "Mental health",
    question:
      "A client with major depression says, \"Nothing will ever get better.\" Which response demonstrates therapeutic communication?",
    correctAnswer: "Tell me more about what feels hopeless right now",
    distractor1: "You have a lot to be grateful for",
    distractor2: "Things always work out in the end",
    distractor3: "You should try to stay positive",
  },
  {
    topic: "Obstetrics",
    question:
      "Which assessment finding in a postpartum client requires immediate notification of the provider?",
    correctAnswer: "Saturated perineal pad in 15 minutes",
    distractor1: "Mild afterpains during breastfeeding",
    distractor2: "Temperature of 37.8°C (100°F) on postpartum day 1",
    distractor3: "Scant lochia rubra on postpartum day 2",
  },
  {
    topic: "Endocrine",
    question:
      "A client with type 1 diabetes reports shakiness, sweating, and confusion. What is the nurse's first action?",
    correctAnswer: "Check the blood glucose level",
    distractor1: "Administer regular insulin as ordered",
    distractor2: "Encourage the client to drink water",
    distractor3: "Place the client in high Fowler's position",
  },
  {
    topic: "Respiratory",
    question:
      "Which instruction is most important for a client newly prescribed an inhaled corticosteroid?",
    correctAnswer: "Rinse the mouth after each use",
    distractor1: "Use the inhaler only when wheezing occurs",
    distractor2: "Shake the inhaler only on the first puff of the day",
    distractor3: "Hold breath for 2 seconds after inhalation",
  },
  {
    topic: "Ethics",
    question:
      "A competent adult client refuses a blood transfusion for religious reasons. What is the nurse's best action?",
    correctAnswer: "Document the refusal and notify the provider",
    distractor1: "Administer the transfusion because it is life-saving",
    distractor2: "Ask a family member to consent instead",
    distractor3: "Withhold all medications until the client agrees",
  },
  {
    topic: "Cardiovascular",
    question:
      "Which symptom in a client with acute coronary syndrome should the nurse report immediately?",
    correctAnswer: "Crushing chest pain unrelieved by rest",
    distractor1: "Mild anxiety before a scheduled test",
    distractor2: "History of hypertension for 10 years",
    distractor3: "Occasional palpitations after caffeine",
  },
  {
    topic: "Nutrition",
    question:
      "A client on a clear liquid diet asks what is allowed. Which item can the nurse approve?",
    correctAnswer: "Broth and gelatin",
    distractor1: "Milk and yogurt",
    distractor2: "Orange juice with pulp",
    distractor3: "Cream of wheat",
  },
  {
    topic: "Renal",
    question:
      "Which laboratory value is most important to monitor for a client receiving nephrotoxic medication?",
    correctAnswer: "Serum creatinine",
    distractor1: "Hemoglobin",
    distractor2: "Platelet count",
    distractor3: "Serum sodium",
  },
  {
    topic: "Prioritization",
    question:
      "The nurse is caring for four clients. Who should be assessed first?",
    correctAnswer: "A client with sudden shortness of breath and oxygen saturation 86%",
    distractor1: "A client requesting pain medication for a headache",
    distractor2: "A client scheduled for discharge teaching in one hour",
    distractor3: "A client who needs assistance to the bathroom",
  },
  {
    topic: "Neurology",
    question:
      "Which finding is most concerning in a client one hour after a lumbar puncture?",
    correctAnswer: "New onset severe headache when upright",
    distractor1: "Mild soreness at the puncture site",
    distractor2: "Need to lie flat as instructed",
    distractor3: "Small amount of dried blood on the dressing",
  },
  {
    topic: "Immunization",
    question:
      "Which statement by a new parent about infant immunizations indicates understanding?",
    correctAnswer: "Mild fussiness after vaccines can be normal",
    distractor1: "Vaccines should be delayed if the infant has a mild cold",
    distractor2: "Fever after vaccines always means a serious reaction",
    distractor3: "Only one vaccine should be given per year",
  },
  {
    topic: "Wound care",
    question:
      "A nurse is changing a dressing on a surgical wound with moderate serous drainage. Which action is appropriate?",
    correctAnswer: "Clean from least to most contaminated area",
    distractor1: "Reuse the same gauze if it appears clean",
    distractor2: "Remove the old dressing toward the incision line",
    distractor3: "Apply a warm moist compress before removing staples",
  },
  {
    topic: "Geriatrics",
    question:
      "Which intervention best reduces fall risk for an older adult in the hospital?",
    correctAnswer: "Keep the call light and personal items within reach",
    distractor1: "Use bed rails on both sides at all times",
    distractor2: "Limit fluids in the evening to reduce toileting",
    distractor3: "Keep the room dim to promote sleep",
  },
  {
    topic: "Fluids",
    question:
      "A client has a serum sodium of 118 mEq/L. Which assessment should the nurse prioritize?",
    correctAnswer: "Level of consciousness and seizure precautions",
    distractor1: "Daily weight only",
    distractor2: "Bowel sounds in all quadrants",
    distractor3: "Range of motion in extremities",
  },
  {
    topic: "Communication",
    question:
      "When obtaining informed consent for a procedure, the nurse recognizes that informed consent requires the client to understand which of the following?",
    correctAnswer: "Risks, benefits, and alternatives to the procedure",
    distractor1: "The exact cost of hospitalization",
    distractor2: "The nurse's personal opinion of the surgeon",
    distractor3: "The names of all staff in the operating room",
  },
  {
    topic: "Pain management",
    question:
      "A client recovering from surgery reports pain rated 8/10. Which action should the nurse take first?",
    correctAnswer: "Administer the prescribed analgesic and reassess",
    distractor1: "Tell the client pain is expected after surgery",
    distractor2: "Wait 30 minutes to see if pain decreases",
    distractor3: "Offer a back rub instead of medication",
  },
  {
    topic: "Lab interpretation",
    question:
      "Which client is at highest risk for bleeding based on a platelet count of 18,000/mm³?",
    correctAnswer: "A client who needs oral care with a soft toothbrush",
    distractor1: "A client with a hemoglobin of 10 g/dL",
    distractor2: "A client with an elevated white blood cell count",
    distractor3: "A client with a potassium of 3.4 mEq/L",
  },
  {
    topic: "Delegation",
    question:
      "Which task is appropriate to delegate to an unlicensed assistive personnel (UAP)?",
    correctAnswer: "Ambulating a stable postoperative client",
    distractor1: "Teaching a client how to use an incentive spirometer",
    distractor2: "Assessing a new onset rash on a client",
    distractor3: "Evaluating response to a new antihypertensive",
  },
  {
    topic: "Oncology",
    question:
      "Which symptom in a client receiving chemotherapy requires immediate intervention?",
    correctAnswer: "Temperature of 38.5°C (101.3°F) with chills",
    distractor1: "Expected hair loss",
    distractor2: "Mild nausea controlled with antiemetics",
    distractor3: "Fatigue after treatment",
  },
  {
    topic: "Orthopedics",
    question:
      "Which instruction is essential for a client with a new cast on the lower leg?",
    correctAnswer: "Report numbness, tingling, or increased pain in the toes",
    distractor1: "Apply heat to the cast to dry it faster",
    distractor2: "Insert a coat hanger inside the cast to scratch itching",
    distractor3: "Bear full weight on the cast immediately",
  },
];

export const MOCK_EXAM_QUESTIONS_PER_SESSION = 20;
