# Papermind – Product Requirements Document

**Version:** 1.0  
**Company:** Bhyte Software  
**Last Updated:** March 2026  
**Goal:** Scale to $20,000 MRR in 2026

---

## 1. Product Overview

Papermind is an AI-powered study platform that lets students and professionals upload documents and automatically generates study materials from them. Users can generate flashcards, quizzes, learning guides, and mock exams from their own content, as well as access curated resources for professional certification exams.

### Target Users

- **Students** — university, college, high school studying any subject
- **Accountants** — CPA, ACCA, CIMA exam prep
- **Lawyers** — Bar exam, continuing legal education
- **Doctors** — USMLE, MCAT, medical board exams
- **Actuaries** — SOA, CAS exam prep
- **Other professionals** — any certification or professional exam

---

## 2. Problem Statement

Students and professionals spend too much time creating study materials and not enough time actually studying. Existing tools either require manual input (Anki, Quizlet) or don't integrate with the user's own content. Papermind eliminates the friction of creating study materials entirely — users upload their source content and Papermind does the rest.

---

## 3. Goals & Success Metrics

| Metric | Target |
|--------|--------|
| MRR | $20,000 by end of 2026 |
| Paying users | 1,000+ |
| Churn rate | < 5% monthly |
| Avg session length | > 15 minutes |
| PDF → study set conversion | > 80% success rate |

---

## 4. Monetization

**Model:** Paid from day one. No free tier.

| Plan | Price | Description |
|------|-------|-------------|
| Starter | $9/month | 10 uploads/month, flashcards & quizzes |
| Pro | $19/month | Unlimited uploads, mock exams, pro exam resources |
| Teams | $49/month | Up to 5 seats, shared study sets, team dashboard |

**Payment processor:** Polar

---

## 5. Features & Specifications

### 5.1 Authentication
- Email/password sign up and login
- Google OAuth
- Password reset via email
- Email verification on signup
- Protected routes — unauthenticated users redirected to login
- Session management

### 5.2 Onboarding
- Welcome screen after first signup
- User selects their goal: Student or Professional
- If professional, selects their exam type (CPA, Bar, USMLE, etc.)
- Prompted to upload their first document or explore demo content
- Onboarding state persisted — not shown again after completion

### 5.3 PDF & Document Upload
- Supported formats: PDF (required), future support for DOCX, PPTX, TXT
- Max file size: 50MB per upload
- Upload via drag and drop or file picker
- Files stored securely in cloud storage
- Text extracted from PDF on upload
- Extraction status shown to user (processing → ready)
- Failed extractions surfaced with clear error message

### 5.4 Flashcard Generation
- Generated automatically from extracted document text
- AI identifies key concepts, terms, and definitions
- Each flashcard has a front (question/term) and back (answer/definition)
- User can edit, delete, or add cards manually
- Study mode: flip cards, mark as known/unknown
- Progress tracked per deck
- Cards can be shuffled or studied in order

### 5.5 Quiz Generation
- Multiple choice questions generated from document content
- Configurable question count (10, 20, 50 questions)
- Timed or untimed mode
- Instant feedback on each answer
- Results screen with score and breakdown
- Wrong answers reviewable after completion
- Quiz history saved per study set

### 5.6 Mock Exams
- Full-length timed exams simulating real exam conditions
- Available for supported professional exams (CPA, Bar, USMLE, actuarial)
- User can also generate mock exams from their own uploaded content
- Strict timer — auto-submits when time runs out
- Detailed results breakdown by topic/section
- Performance compared to previous attempts

### 5.7 Learning Guides
- AI-generated structured summary of uploaded content
- Organised by topic with key points highlighted
- Readable, scannable format (not just raw text)
- Exportable as PDF

### 5.8 Pro Exam Resources
- Curated study material for supported professional exams
- Built-in flashcard decks and quizzes for each exam
- Updated regularly to reflect current exam syllabi
- Accessible on Pro and Teams plans only

### 5.9 Progress Tracking
- Per study set: cards studied, quiz scores, time spent
- Overall dashboard: streak, total study time, weak areas
- Progress resets available per study set

### 5.10 Dashboard (Home)
- Recent study sets
- Quick actions: upload new, continue studying
- Progress summary
- Suggested content based on exam type

### 5.11 Account & Settings
- Update name and email
- Change password
- Manage subscription and billing (via Polar)
- Delete account
- Notification preferences

---

## 6. Out of Scope (v1)

- Mobile app (web only for v1)
- Collaborative study sessions
- AI chat / tutoring interface
- Video content support
- Public study set sharing
- Spaced repetition algorithm (basic progress tracking only in v1)

---

## 7. User Flows

### New User Flow
Sign up → Verify email → Onboarding → Upload first PDF → View generated study set → Start studying

### Returning User Flow
Login → Dashboard → Continue study set or upload new → Study → View progress

### Professional Exam Flow
Sign up → Select exam type → Access curated pro resources → Upload own materials → Generate mock exam → Review results

---

## 8. Non-Functional Requirements

- Page load time < 2 seconds
- PDF processing time < 30 seconds for standard documents
- 99.9% uptime target
- HTTPS enforced across all routes
- User data encrypted at rest and in transit
- GDPR-compliant data handling
- Rate limiting on all API routes
- Input validation on all user-facing forms
- File upload validation (type, size, malware scanning TBD)
