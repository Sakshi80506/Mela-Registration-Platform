# Kaarigar Expo – Mela Registration Platform

**Kaarigar Expo** is a complete, professional, responsive web application designed for managing traditional Indian handicraft melas, exhibitions, and cultural bazaars. Built with **React.js + Vite** on the frontend, **FastAPI (Python)** on the backend, and powered dynamically by **Firebase Authentication, Firestore, and Storage**.

---

## 🌟 Key Features & Role-Based Workflows

### 1. Public Visitor Portal
- **Hero & Cultural Highlights**: Indian handicraft theme showcasing heritage weavers, terracotta sculptors, and folk artists.
- **Dynamic Upcoming Melas**: Real-time event cards with location, schedules, approved artisan counts, and instant RSVP reservation.
- **Master Kaarigars Directory**: Explore registered and verified artisans by craft specialization.
- **Verified Exhibitors Only**: Public event pages exclusively showcase artisans whose stall applications have been **APPROVED** by the administration.
- **Anti-Duplicate RSVP**: Prevents visitors from submitting redundant passes for the same exhibition.

### 2. Kaarigar (Artisan) Portal
- **Dedicated Artisan Dashboard**: Live application counters (Total, Pending, Approved, Rejected) and a profile completion tracker.
- **Artisan Profile Studio**: Manage craft lineage, bio, contact, and upload portrait and craft sample photos to Firebase Storage.
- **Mela Application System**: Apply for open stalls across upcoming melas with customized requirements and sample images (defaults to `pending` status).
- **Application Tracking**: Real-time status badges with review feedback from event organizers.

### 3. Admin & Organizer Control Center
- **Executive Dashboard**: Dynamic aggregate statistics (Total Melas, Upcoming Melas, Total Kaarigars, Pending Applications, Approved Artisans, Registered Visitors, Total RSVPs).
- **Mela Management**: Create, edit, schedule, set capacity limits, and cancel/delete events with confirmation safeguards.
- **Artisan Application Moderation**: Comprehensive review drawer with artisan profile inspection, craft specimen review, and one-click Approve / Reject status updating.
- **Attendee & Visitor Rosters**: Filterable RSVP attendance lists grouped by exhibition.

---

## 🎨 Design System & Indian Handicraft Palette

| Color Variable | Hex Code | Purpose |
|---|---|---|
| **Primary** | `#233A66` | Heritage Navy / Royal Indigo |
| **Secondary** | `#D7A859` | Warm Brass / Gold Accent |
| **Background** | `#F8F3E8` | Raw Linen / Silk Canvas |
| **Surface** | `#FFFFFF` | Crisp Card Surface |
| **Dark Text** | `#222222` | Primary Readable Typography |
| **Success** | `#2E7D32` | Approved / Confirmed Badges |
| **Warning** | `#ED9B2F` | Pending Review Badges |
| **Danger** | `#C62828` | Rejected / Cancelled Badges |

**Responsive Breakpoints Tested**: `320px`, `375px`, `425px`, `768px`, `1024px`, `1440px`.

---

## 🏗️ Project Architecture

```
Mela-registration/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/            # EventCard, KaarigarCard, DashboardCard
│   │   │   ├── common/           # Navbar, Footer, Sidebar, Modal, StatusBadge, etc.
│   │   │   └── layout/           # PublicLayout, DashboardLayout
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── public/           # Home, Melas, EventDetails, Kaarigars, About, Contact, Login, Register
│   │   │   ├── kaarigar/         # KaarigarDashboard, Profile, ApplyMela, MyApplications
│   │   │   ├── visitor/          # VisitorDashboard, MyRegistrations
│   │   │   └── admin/            # AdminDashboard, CreateMela, ManageMelas, ManageApplications, Visitors
│   │   ├── services/             # firebase.js, eventService, kaarigarService, applicationService, visitorService
│   │   └── styles/               # design-tokens.css, index.css, layout.css, components.css
│   ├── .env.example
│   └── package.json
├── backend/                      # FastAPI Python REST API
│   ├── routes/                   # events.py, kaarigars.py, applications.py, visitors.py, stats.py, auth.py
│   ├── schemas/                  # Pydantic validation schemas
│   ├── config.py
│   ├── firebase_admin_setup.py
│   ├── main.py
│   ├── seed.py                   # Sample data seeder
│   ├── requirements.txt
│   └── .env.example
├── firestore.rules               # Firestore Security Rules
├── storage.rules                 # Firebase Storage Security Rules
└── README.md
```

---

## ⚙️ Setup & Running Locally

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

#### Frontend Environment Variables (`frontend/.env`)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000/api
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

The REST API documentation will be available at `http://localhost:8000/docs`.

#### Backend Environment Variables (`backend/.env`)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

---

## 🗄️ Database Collections (Firestore)

- **`users`**: `{ uid, name, email, role: 'admin'|'kaarigar'|'visitor', phone, createdAt }`
- **`events`**: `{ id, name, date, startTime, endTime, location, city, state, description, image, maxArtisans, maxVisitors, status, createdBy, createdAt }`
- **`kaarigars`**: `{ id, userId, name, email, phone, craftType, description, city, state, profilePhoto, craftPhoto, createdAt, updatedAt }`
- **`kaarigarApplications`**: `{ id, kaarigarId, eventId, craftType, description, craftImage, message, status: 'pending'|'approved'|'rejected', appliedAt, reviewedAt, reviewedBy }`
- **`visitorRegistrations`**: `{ id, visitorId, eventId, name, email, phone, numberOfVisitors, createdAt }`

---

## 🔒 Security & Route Guards
- Client-side routes are guarded by `<ProtectedRoute allowedRoles={[...]}>`.
- Backend endpoints enforce payload validation via Pydantic.
- Firestore Security Rules (`firestore.rules`) enforce role-based access for modifications and reads.
