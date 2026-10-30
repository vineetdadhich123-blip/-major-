# QuickPrint Pro — Full-Stack Online Printing & Document Delivery Platform
**Version:** 2.0 (Full-Stack Commercial Release)  
**Backend & Database:** Node.js, Express.js, MongoDB (Mongoose) + Embedded SQL (SQLite Fallback), and Multer

---

## 1. Overview

**QuickPrint Pro** is a full-stack commercial online printing and document delivery platform. Customers can upload documents, configure printing specifications (Color / B&W, A4/A3, paper stock, duplex, binding, lamination, copies), receive live transparent price breakdowns in Indian Rupees (₹), place print orders, and track manufacturing and delivery across 5 commercial production stages in real-time.

The platform includes a robust **Node.js & Express.js backend** with **Dual-Database Support**:
- **MongoDB (via Mongoose)**: Production cloud/local database mode configured via `MONGODB_URI` in `.env`.
- **SQL (Embedded SQLite `quickprint.db`)**: Automatic, zero-configuration local database fallback that runs out-of-the-box without requiring an external database server to be installed.
- **Multer**: Real multipart file upload processing for `.pdf`, `.docx`, `.jpg`, and `.png` documents saved to `./uploads/` with automated page estimation.

---

## 2. Full-Stack Architecture

```
value 2/
├── server.js                    # Production Express HTTP server & database bootstrapper
├── package.json                 # Project descriptor, scripts, & dependencies
├── .env                         # Active environment configuration
├── .env.example                 # Sample configuration template
├── quickprint.db                # Persistent embedded SQL database (SQLite)
├── uploads/                     # Persistent storage for uploaded print documents
│
├── backend/
│   ├── app.js                   # Express application setup, CORS, JSON parsers, static routing
│   ├── config/
│   │   └── db.js                # Dual-Database Manager (MongoDB Atlas + SQLite auto-fallback)
│   ├── models/
│   │   ├── Order.js             # Mongoose Order schema (MongoDB)
│   │   ├── Document.js          # Mongoose Document schema (MongoDB)
│   │   └── Contact.js           # Mongoose Contact/Support schema (MongoDB)
│   ├── storage/
│   │   ├── sqliteAdapter.js     # SQLite database tables & SQL query runner
│   │   └── repo.js              # Unified Data Repository (Repository Pattern)
│   ├── middleware/
│   │   └── uploadMiddleware.js  # Multer disk storage, 25MB file validation, page count estimator
│   └── routes/
│       ├── uploadRoutes.js      # POST /api/v1/uploads, GET /api/v1/uploads/:filename
│       ├── orderRoutes.js       # POST, GET, PATCH /api/v1/orders/:id/status, receipt API
│       ├── ratesRoutes.js       # GET /api/v1/rates (Active print pricing in INR)
│       ├── contactRoutes.js     # POST /api/v1/contact (Customer inquiries)
│       └── healthRoutes.js      # GET /api/v1/health (System status, DB engine & metrics)
│
├── index.html                   # Semantic HTML5 SPA with live DB status badge & order lookup
├── css/
│   ├── styles.css               # Design system, responsive styles, live database badge
│   └── print.css                # Print stylesheet for official tax invoices & receipts
└── js/
    ├── config.js                # Client configuration & demo files
    ├── state.js                 # Reactive state store & pub/sub system
    ├── pricing.js               # INR price calculation engine
    ├── upload.js                # Document upload manager (connected to POST /api/v1/uploads)
    ├── preferences.js           # Print preferences & live 3D visual preview
    ├── delivery.js              # Delivery validation controller
    ├── checkout.js              # Order review & payment (connected to POST /api/v1/orders)
    ├── confirmation.js          # 5-stage live tracking (connected to PATCH /api/v1/orders/:id/status)
    └── app.js                   # Bootstrap, DB health indicator, order lookup modal
```

---

## 3. Database Options & Configuration

QuickPrint Pro supports both **MongoDB** and **SQL**:

### Option 1: MongoDB (MongoDB Atlas Cloud or Local MongoDB)
To connect to MongoDB, open `.env` and set your connection string:
```env
# Example MongoDB Atlas URI:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/quickprint?retryWrites=true&w=majority

# Or local MongoDB:
# MONGODB_URI=mongodb://127.0.0.1:27017/quickprint

DB_TYPE=auto
```

### Option 2: Embedded SQL Database (SQLite)
If `MONGODB_URI` is left blank or MongoDB is offline, the backend **automatically activates SQLite** (`quickprint.db`).
- Zero setup or installation required.
- Tables (`orders`, `documents`, `contacts`, `pricing_rates`) are automatically created and indexed.
- All order histories, files, and tracking stages persist across server restarts.

---

## 4. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | System health check, active database engine, and statistics |
| `POST` | `/api/v1/uploads` | Multipart file upload (Multer). Saves documents to disk & database |
| `GET` | `/api/v1/uploads/:filename` | Download or view an uploaded document |
| `POST` | `/api/v1/orders` | Creates a new order in MongoDB/SQLite with unique reference `QP-IN-YYYY-XXXXX` |
| `GET` | `/api/v1/orders` | Retrieves recent orders |
| `GET` | `/api/v1/orders/:id` | Queries order status, details, and tracking history by ID or reference |
| `PATCH` | `/api/v1/orders/:id/status` | Advances production pipeline stage (1 to 5) with audit trail |
| `GET` | `/api/v1/orders/:id/receipt` | Generates verified GST tax invoice & receipt data |
| `GET` | `/api/v1/rates` | Active operational print rates in Indian Rupees |
| `POST` | `/api/v1/contact` | Submits support inquiries to database |

---

## 5. Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
Or with hot-reload during development:
```bash
npm run dev
```

### 3. Open in Browser
Navigate to:
```
http://localhost:3000
```

---

## 6. Key Features Verified
- [x] **Live Database Indicator**: Header displays real-time connection badge (`SQL (SQLite Embedded)` or `MongoDB (Mongoose)`).
- [x] **Real Multipart Uploads**: Files uploaded via Drag & Drop or file picker are stored in `./uploads/` and recorded in database.
- [x] **Order Persistence**: Submitting an order creates a persistent record with order reference `QP-IN-2026-XXXXX`.
- [x] **Live Pipeline Synchronization**: Production stages advance in the UI and automatically update in the database via `PATCH /api/v1/orders/:id/status`.
- [x] **Track Order Lookup**: Customers can click "Track Order" in the navbar, enter their reference code, and view live order status and receipt fetched from the database.
- [x] **In-Page Official Tax Receipt**: Instant printable receipt generation with GST breakdowns in Indian Rupees (₹).
