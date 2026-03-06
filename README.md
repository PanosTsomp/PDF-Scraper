# PDF Scraper

A full-stack web app for PDF processing:
- `apps/api`: TypeScript + Express backend
- `apps/web`: React + Vite frontend

## Folder Structure

```text
PDF-Scraper/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   └── server.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── src/
│       ├── package.json
│       └── vite.config.js
├── scripts/
│   └── send-upload-request.sh
├── package.json
└── README.md
```

## API Endpoints

Base URL: `http://localhost:8080`

- `GET /` health check
- `POST /upload` parse PDF and return JSON preview
- `POST /download-text` return extracted text as `.txt`
- `POST /extract-images` return PDF pages as `.zip` of PNGs
- `POST /convert-to-docx` return converted `.docx`

## Installation

Install dependencies for each app:

```bash
npm install --prefix apps/api
npm install --prefix apps/web
```

## Development

Run backend:

```bash
npm run dev:api
```

Run frontend in a second terminal:

```bash
npm run dev:web
```

- API: `http://localhost:8080`
- Web: `http://localhost:5173`

## Build

Build both apps:

```bash
npm run build
```

Or build separately:

```bash
npm run build:api
npm run build:web
```

## Run API Production Build

```bash
npm run start:api
```

## Manual API Test

```bash
bash scripts/send-upload-request.sh
```
