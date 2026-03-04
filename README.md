# PDF Text Extractor

This project is a small full-stack PDF text extraction app.

It has two parts:

- A Node.js + Express backend in the project root
- A React + Vite frontend inside `pdf-ui/`

The backend receives a PDF file, extracts its text with `pdf-parse`, and returns the parsed result as JSON.  
The frontend lets you choose a PDF, send it to the backend, and display the extracted text in the browser.

## Project Structure

```text
Tsomp_Portfolio/
├── src/
│   └── server.ts
├── pdf-ui/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── package.json
└── README.md
```


# Backend
The backend is implemented in `src/server.ts`.

Main responsibilities:

- Start an Express server on port 8080
- Allow requests from the frontend using CORS
- Accept uploaded files using express-fileupload
- Read the uploaded PDF as binary data
- Extract text and metadata using pdf-parse
- Return the result as JSON
- Backend Flow
- The frontend sends a POST request to /upload
- The request contains a PDF file in multipart/form-data
- The backend checks that a file exists in req.files.file
- The file buffer is converted to a Uint8Array
- PDFParse extracts the text, metadata, and page count
- The backend responds with JSON like this:

# Frontend
The frontend is implemented in `pdf-ui/src/App.jsx`.

Main responsibilities:

- Let the user pick a PDF file
- Send the file to the backend using fetch
- Read the backend JSON response
- Display the extracted text in the UI
- Show loading or error feedback
- Frontend Flow
- The user selects a PDF file from the file input
- The app stores that file in React state
- When the user clicks the extract button:
- A FormData object is created
- The file is appended under the key "file"
- The frontend sends the request to http://localhost:8080/upload
- The backend returns JSON
- The frontend reads data.result.text
- The extracted text is rendered on the page

# Technologies Used
Backend
Node.js
TypeScript
Express
express-fileupload
cors
pdf-parse
nodemon
ts-node
Frontend
React
Vite
JavaScript (JSX)
CSS

# How To Run The Project
You need two terminals: one for the backend and one for the frontend.

### Run the Backend
From the project root:

```
npm install
npm run dev
The backend runs on:

http://localhost:8080
You can test it in the browser at:

http://localhost:8080/
You should see:

backend is running
```

### Run the Frontend
Open a second terminal and move into the frontend folder:

```
cd pdf-ui
npm install
npm run dev
Vite starts the frontend on:

http://localhost:5173
Open that URL in the browser and use the interface to upload a PDF.

Build Commands
Backend build
From the project root:

npm run build
Frontend build
From inside pdf-ui/:

npm run build
```

### Manual API Test
You can test the backend without the frontend using curl:
```
curl -X POST http://localhost:8080/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/file.pdf"
```

### Development Notes
- The backend currently allows requests from http://localhost:5173
- The upload endpoint is POST /upload
- The uploaded file field name must be file
- The backend currently limits uploaded files to 50 MB


### Summary
This project demonstrates a simple full-stack file upload flow:

- React collects the PDF file from the user
- The frontend sends it to the Express backend
- The backend extracts text from the PDF
- The frontend displays the result

