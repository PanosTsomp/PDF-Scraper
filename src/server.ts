import express, { type Request, type Response } from "express";
import fileUpload, { type UploadedFile } from "express-fileupload";
import { PDFParse } from "pdf-parse";
import cors from "cors";
import JSZip from "jszip";
import * as docx from "docx";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://yourwebsite.com"],
  })
);

app.get("/", (_req, res) => res.send("backend is running"));

// Better file upload config (still uses memory/buffer, no temp files needed)
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    abortOnLimit: true,
  })
);

// Reusable parser helper (with proper cleanup)
async function createPDFParser(buffer: Uint8Array) {
  const parser = new PDFParse(buffer);
  return parser;
}

app.post("/upload", async (req: Request, res: Response) => {
  let parser: PDFParse | null = null;
  try {
    if (!req.files || !("file" in req.files)) {
      return res.status(400).json({ error: "No PDF file shared." });
    }

    const pdfFile = req.files.file as UploadedFile;
    const data = new Uint8Array(pdfFile.data);

    parser = await createPDFParser(data);
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo({ parsePageInfo: true });

    const result = {
      text: textResult?.text || "",
      info: infoResult,
      numpages: infoResult?.pages || 0,
    };

    console.log("PDF parsed successfully");
    res.json({ result, success: true });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    });
  } finally {
    if (parser) await parser.destroy(); // IMPORTANT: prevents memory leaks
  }
});

// ==================== NEW ENDPOINTS ====================

// 1. Download extracted text as .txt
app.post("/download-text", async (req: Request, res: Response) => {
  let parser: PDFParse | null = null;
  try {
    const pdfFile = req.files?.file as UploadedFile;
    if (!pdfFile) return res.status(400).json({ error: "No file" });

    parser = await createPDFParser(new Uint8Array(pdfFile.data));
    const textResult = await parser.getText();

    const text = textResult?.text || "No text found";

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", 'attachment; filename="extracted-text.txt"');
    res.send(text);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    if (parser) await parser.destroy();
  }
});

// 2. Extract all pages as PNGs → download as ZIP
app.post("/extract-images", async (req: Request, res: Response) => {
  let parser: PDFParse | null = null;
  try {
    const pdfFile = req.files?.file as UploadedFile;
    if (!pdfFile) return res.status(400).json({ error: "No file" });

    parser = await createPDFParser(new Uint8Array(pdfFile.data));
    const screenshotResult = await parser.getScreenshot({
      scale: 2,           // high quality (change to 1.5 or 3 if you want smaller/faster)
      imageBuffer: true,  // we want raw Buffer
    });

    const zip = new JSZip();
    screenshotResult.pages.forEach((page, i) => {
      zip.file(`page_${i + 1}.png`, page.data as Buffer);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="pdf-pages.zip"');
    res.send(zipBuffer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    if (parser) await parser.destroy();
  }
});

// 3. Convert to simple DOCX (using extracted text – good layout for text-heavy PDFs)
app.post("/convert-to-docx", async (req: Request, res: Response) => {
  let parser: PDFParse | null = null;
  try {
    const pdfFile = req.files?.file as UploadedFile;
    if (!pdfFile) return res.status(400).json({ error: "No file" });

    parser = await createPDFParser(new Uint8Array(pdfFile.data));
    const textResult = await parser.getText();
    const text = textResult?.text || "No text found";

    // Create nice DOCX with paragraphs
    const paragraphs = text
      .split(/\n\n+/) // split on blank lines
      .filter(p => p.trim())
      .map(p => new docx.Paragraph({ text: p.trim(), spacing: { after: 200 } }));

    const doc = new docx.Document({
      sections: [{ children: paragraphs }],
    });

    const docxBuffer = await docx.Packer.toBuffer(doc);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="converted.docx"');
    res.send(docxBuffer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    if (parser) await parser.destroy();
  }
});

app.listen(PORT, () => {
  console.log(`The Server is running on http://localhost:${PORT}`);
});