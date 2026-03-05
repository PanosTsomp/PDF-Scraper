import { useState } from "react";
import "./App.css"; // Assuming you put the new styles here

function JsonViewer({ data, indent = 0 }) {
  const [expanded, setExpanded] = useState(true);

  if (typeof data === "object" && data !== null) {
    const isArray = Array.isArray(data);
    const entries = isArray ? data.entries() : Object.entries(data);
    const typeClass = isArray ? "json-array" : "json-object";

    const toggleExpand = () => setExpanded(!expanded);

    return (
      <div
        style={{ marginLeft: `${indent * 20}px` }}
        className={`${typeClass} ${expanded ? "" : "collapsed"}`}
        onClick={entries.length > 0 ? toggleExpand : undefined}
      >
        <span>{isArray ? "[" : "{"}</span>
        {expanded && (
          <div className="json-children">
            {Array.from(entries).map(([key, value], index) => (
              <div key={isArray ? index : key}>
                {!isArray && <span className="json-key">"{key}": </span>}
                <JsonViewer data={value} indent={indent + 1} />
                {index < entries.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>
        )}
        <span>{isArray ? "]" : "}"}</span>
      </div>
    );
  }

  let valueClass = "";
  let displayValue = JSON.stringify(data);
  if (typeof data === "string") valueClass = "json-string";
  else if (typeof data === "number") valueClass = "json-number";
  else if (typeof data === "boolean") valueClass = "json-boolean";
  else if (data === null) valueClass = "json-null";

  return <span className={valueClass}>{displayValue}</span>;
}

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null); // Store parsed data instead of text
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Choose a PDF first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      //Creates a FormData object (for sending files via HTTP) and appends the selected file to it under the key "file". 
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      setResult(data); // Store the raw JSON data
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>PDF Text Extractor</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div className="output-container">
          {result.text ? (
            // If there's a plain 'text' field, render it nicely
            <div>
              <h2>Extracted Text:</h2>
              <pre>{result.text}</pre>
              <h2>Metadata:</h2>
              <JsonViewer data={result} />
            </div>
          ) : (
            // Otherwise, render full JSON
            <JsonViewer data={result} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;