# ⚖️ NyayaDesk (Mercy) — Judicial Case Management & Bench Automation Platform

[![Live App](https://img.shields.io/badge/Live_App-mercy--d9aaa.web.app-blue?style=for-the-badge&logo=google-chrome)](https://mercy-d9aaa.web.app)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting_%26_Auth-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Legal_AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

> **NyayaDesk** is a next-generation judicial case management and bench automation platform engineered for Indian District and Sessions Courts. It streamlines end-to-end court workflows — from 16-digit CNR case intake and statutory 8-pillar audit readiness to real-time eCourts CIS verification and AI-assisted judgment generation under the new criminal laws (**BNS**, **BNSS**, **BSA**).

---

## 🌐 Live Production Deployment

- **Production URL**: [https://mercy-d9aaa.web.app](https://mercy-d9aaa.web.app)
- **GitHub Repository**: [https://github.com/ThilakesB/Mercy](https://github.com/ThilakesB/Mercy)

---

## 🏛️ The Problem & Our Solution

| The Challenge in Indian Courts | How NyayaDesk Solves It |
| :--- | :--- |
| **50M+ Pending Cases**: Backlogs caused by fragmented paper files, missing police exhibits, and delayed trial tracking. | **Unified Digital Bench Pipeline**: 8-stage case workflow from FIR intake to dispositive decree execution. |
| **New Statutory Transition**: Transition from IPC, CrPC, and IEA to **BNS, BNSS, and BSA (2023)**. | **Built-in Statutory Law Reference & AI Assistant**: Real-time legal analysis with landmark Supreme Court precedents. |
| **Fragmented CIS Registry**: Verifying CNR numbers and advocate appearances requires manually checking multiple portals. | **Live eCourts CIS API Integration**: 1-click verification for Case Dockets and Advocate Rolls. |
| **Lengthy Judgment Drafting**: Manually compiling findings, witness depositions, and legal ingredients takes hours. | **Judicial Judgment Studio**: Automated, structured judgment generation with operative sentencing orders. |

---

## 🚀 Key Modules & Capabilities

### 1. 📋 8-Pillar Judicial Case Readiness Audit & Checklist
Judges and bench clerks can audit docket completeness before pronouncement across 8 statutory pillars:
1. **Case Details & FIR Dossier**: CNR sequence, court jurisdiction, police station, and full party descriptions.
2. **All Case Documents**: Complaint/Tehrir, chargesheet (u/s 173 BNSS), summons, and bail orders.
3. **Evidence & Exhibits**: Documentary, forensic ballistic reports (CFSL), and Section 63 BSA electronic certificates.
4. **Witness Records**: PW lists, chief examination, cross-examination records, and vulnerable witness protections.
5. **Legal Review**: Statutory ingredient mapping against BNS, BNSS, POCSO, and Arms Act.
6. **Final Hearing**: Prosecution arguments, defense submissions, and closing notes.
7. **Judgment Document**: Findings on each point for determination and operative sentencing orders.
8. **Pre-Finalisation Checks**: Custody status verification, fine calculation, and appeal timelines.

### 2. ⚡ Judgment Draft Studio
- Instant AI-assisted judgment generation integrating case facts, statutory sections, and evidence records.
- Dispositive operative orders with custody warrant directions (Tihar / Puzhal Central Prisons).
- Statutory compliance under **Section 404 BNSS** (free certified copy to convict) and preservation of material exhibits.
- Formatted output with 1-click **Digital Seal**, PDF export, and direct printing.

### 3. 🌐 Real-World eCourts CIS API Integration
Integrates Indian District Courts eCourts APIs (`apis.akshit.net`):
- **District Court Case API** (`POST /district-court/case`):
  - 16-character CNR lookup (e.g., `DLST020314162024` for Saket District Courts).
  - Auto-populates Court Name, Presiding Judge, FIR No., Complainant, Accused, and Charged Sections.
  - Certified docket view with complete hearing history and interim court orders.
- **Search Advocate by Name API** (`POST /district-court/search/advocate-name`):
  - Filter by counsel name (e.g., `PRATEEK`), stage (`BOTH`, `PENDING`, `DISPOSED`), and court complex (`5f5f010a` Saket, `4a1e9b21` Tis Hazari, `7c8f2201` Patiala House, etc.).
  - 1-click **"Import to Bench Roster"** into local court rolls.

### 4. ⚖️ Advocate & Bar Council Directory (Full CRUD)
- **Add Advocate**: Full form with Bar Enrolment (e.g. `D/1482/2012`), State Chapter, Standing Years, Chamber, and Contact.
- **Edit Advocate**: Update chamber seat allocations and clearance statuses.
- **Delete Advocate**: Safe confirmation dialog to manage active Bench participation.
- **Clearance Status Tracking**: `VERIFIED`, `PROVISIONAL`, or `SUSPENDED` under Section 30 of the Advocates Act, 1961.

### 5. 🤖 Statutory Law Reference & AI Assistant
- Codified directory of Indian statutes:
  - **BNS, 2023** (Bharatiya Nyaya Sanhita — Penal Code)
  - **BNSS, 2023** (Bharatiya Nagarik Suraksha Sanhita — Criminal Procedure)
  - **BSA, 2023** (Bharatiya Sakshya Adhiniyam — Law of Evidence)
  - **POCSO Act, 2012** (Special Child Protection Court)
  - **Arms Act, 1959** (Unlicensed Firearm Possession)
- Powered by **Google Gemini AI** with multi-model cascade (`gemini-flash-latest`, `gemini-3.8-flash`, `gemini-3.5-flash`) and offline statutory fallback.

### 6. 🗄️ Backend Database & Cloud Infrastructure Center
Accessible via **Settings (`/settings`)**:
- **Supabase Cloud PostgreSQL**: Live connectivity at `vodrmtqzqrmrcevmlvyg.supabase.co`.
- **Live Latency & Per-Table Health Check**: Verifies `cases`, `criminals`, `lawyers`, `hearings`, `punishments`, and `documents`.
- **Bidirectional Cloud Sync**: 1-click **"Push All Data to Cloud"** and **"Sync from Cloud"**.
- **PostgreSQL DDL Schema Viewer**: View and copy complete SQL scripts with Row Level Security (RLS) policies.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.7, Vite 8 |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Custom Pastel Warm-Cream Bento Design |
| **Backend Database** | Supabase Cloud PostgreSQL 15+ (with Row Level Security) |
| **Cloud Hosting & Auth**| Firebase Hosting & Firebase Authentication |
| **AI Judicial Engine** | Google Gemini AI (Legal statutory ingredient analysis) |
| **External APIs** | National eCourts CIS API (`district-court/case`, `search/advocate-name`) |

---

## 📦 Project Structure

```text
Build NyayaDesk Dashboard/
├── src/
│   ├── components/
│   │   ├── ComprehensiveCaseIntakeModal.tsx # Full 8-stage case filing modal
│   │   ├── OfficialCaseDocument.tsx         # Certified judicial document preview
│   │   └── Sidebar.tsx                      # Courtroom navigation sidebar
│   ├── lib/
│   │   ├── ecourtsApi.ts                    # eCourts CIS API client & cache mirror
│   │   ├── gemini.ts                        # Gemini AI legal assistant cascade
│   │   ├── judicialStore.ts                 # Central judicial state engine & Supabase sync
│   │   ├── postgresSchemaSql.ts             # Complete PostgreSQL DDL schema export
│   │   ├── seedCases.ts                     # Authoritative Sessions trial seed data
│   │   └── supabase.ts                      # Supabase client initializer
│   ├── pages/
│   │   ├── CaseWorkflow.tsx                 # 8-Pillar Readiness Audit & Judgment Studio
│   │   ├── Dashboard.tsx                    # Bench metrics, cause list, and active trials
│   │   ├── Lawyers.tsx                      # Bar Council directory with full CRUD
│   │   ├── LawReference.tsx                 # BNS/BNSS/BSA law reference & AI assistant
│   │   ├── Criminals.tsx                    # Accused dossiers & recidivism indices
│   │   ├── Schedule.tsx                     # Daily cause lists & hearing alarms
│   │   ├── Decrees.tsx                      # Convictions, acquittals, and sentences
│   │   ├── Settings.tsx                     # Database control center & profile settings
│   │   └── Login.tsx                        # Bench authentication
│   ├── ui.tsx                               # Reusable design system components
│   └── App.tsx                              # Application routes
├── supabase/
│   ├── complete_postgres_db.sql             # Full standalone PostgreSQL DDL schema
│   └── migrations/001_initial_schema.sql    # Supabase cloud migration
├── scripts/
│   └── push_to_supabase.mjs                 # Cloud data sync script
├── firebase.json                            # Firebase Hosting configuration
└── package.json                             # Dependencies & scripts
```

---

## ⚙️ Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18.0 or later)
- **pnpm** or **npm**

### 2. Clone Repository
```bash
git clone https://github.com/ThilakesB/Mercy.git
cd Mercy
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Supabase Cloud Database
VITE_SUPABASE_URL=https://vodrmtqzqrmrcevmlvyg.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=mercy-d9aaa.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mercy-d9aaa
VITE_FIREBASE_STORAGE_BUCKET=mercy-d9aaa.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=154595633017
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Google Gemini AI Legal Engine
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 5. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` (or the port specified in terminal).

### 6. Build for Production
```bash
npm run build
```

---

## 🔒 Security & Judicial Data Integrity

- **Row Level Security (RLS)**: PostgreSQL tables are protected by policies ensuring only authorized bench sessions modify records.
- **Statutory Privacy Masking**: In-camera witness masking protects juvenile and vulnerable victims on courtroom public displays.
- **SHA-256 Chain of Custody**: Forensic exhibits and electronic evidence include cryptographic hash verification adhering to **Section 63 of Bharatiya Sakshya Adhiniyam, 2023**.

---

## 👥 Authors & Team

Developed with ❤️ for the Indian Judiciary modernization initiative.
- **Project Lead**: Thilakeswaran B ([@ThilakesB](https://github.com/ThilakesB))
- **Live Platform**: [https://mercy-d9aaa.web.app](https://mercy-d9aaa.web.app)

---

## 📄 License

This project is licensed under the **MIT License**.
