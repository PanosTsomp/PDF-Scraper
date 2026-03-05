import { useState } from "react";
import "./App.css"; // Assuming styles are here

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
  const [result, setResult] = useState(null); // For JSON preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outputType, setOutputType] = useState("json"); // New: Dropdown state

  const handleAction = async () => {
    if (!file) {
      alert("Choose a PDF first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      let endpoint = "/upload";
      let isDownload = false;
      let filename = "";

      switch (outputType) {
        case "txt":
          endpoint = "/download-text";
          isDownload = true;
          filename = "extracted-text.txt";
          break;
        case "images":
          endpoint = "/extract-images";
          isDownload = true;
          filename = "pdf-pages.zip";
          break;
        case "docx":
          endpoint = "/convert-to-docx";
          isDownload = true;
          filename = "converted.docx";
          break;
        case "json":
        default:
          // Keep as /upload for JSON preview
          break;
      }

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Backend error ${response.status}: ${errText}`);
      }

      if (isDownload) {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON preview
        const data = await response.json();
        setResult(data.result); // Assuming backend wraps in {result: {...}}
      }
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

      <select value={outputType} onChange={(e) => setOutputType(e.target.value)}>
        <option value="json">Extract & Preview JSON</option>
        <option value="txt">Download Text (TXT)</option>
        <option value="images">Extract Images (ZIP)</option>
        <option value="docx">Convert to DOCX</option>
      </select>

      <button onClick={handleAction} disabled={loading}>
        {loading ? "Processing..." : "Process"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && outputType === "json" && (
        <div className="output-container">
          <JsonViewer data={result} />
        </div>
      )}
    </div>
  );
}

export default App;