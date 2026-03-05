# PDF Scraper

A full-stack PDF processing app with:
- A TypeScript + Express backend (`src/server.ts`)
- A React + Vite frontend (`pdf-ui/`)

You can upload a PDF and choose one of these outputs:
- JSON preview (text + metadata)
- Download extracted text as `.txt`
- Download rendered pages as `.zip` of `.png` images
- Download converted `.docx`

## Project Structure

```text
PDF-Scraper/
├── src/
│   ├── server.ts
│   └── server.js
├── pdf-ui/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── package.json
└── README.md
```

## Backend API

Base URL: `http://localhost:8080`

- `GET /`
  - Health check response: `backend is running`
- `POST /upload`
  - Input: multipart/form-data with `file` (PDF)
  - Output: JSON with extracted text + PDF info
- `POST /download-text`
  - Input: multipart/form-data with `file` (PDF)
  - Output: downloadable `extracted-text.txt`
- `POST /extract-images`
  - Input: multipart/form-data with `file` (PDF)
  - Output: downloadable `pdf-pages.zip`
- `POST /convert-to-docx`
  - Input: multipart/form-data with `file` (PDF)
  - Output: downloadable `converted.docx`

### Backend Notes

- CORS allows `http://localhost:5173`
- Upload limit is `50MB`
- Uploaded field name must be `file`
- PDF parser instances are explicitly destroyed to avoid memory leaks

## Frontend

The frontend (`pdf-ui/src/App.jsx`) provides:
- PDF file picker
- Output type selector
- One-click processing
- JSON preview for `/upload`
- Browser download flow for TXT/ZIP/DOCX endpoints

## Setup

### 1) Install backend dependencies

From project root:

```bash
npm install
```

### 2) Install frontend dependencies

```bash
cd pdf-ui
npm install
```

## Run in Development

You need two terminals.

### Terminal A: backend

From project root:

```bash
npm run dev
```

Backend runs on `http://localhost:8080`.

### Terminal B: frontend

From `pdf-ui/`:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Build

### Backend

From project root:

```bash
npm run build
```

### Frontend

From `pdf-ui/`:

```bash
npm run build
```

## Optional: Run compiled backend

After backend build:

```bash
npm run start
```

## Manual API Test

```bash
curl -X POST http://localhost:8080/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/file.pdf"
```
