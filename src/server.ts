import express, { type Request, type Response } from "express";
import fileUpload, { type UploadedFile } from "express-fileupload";
import { PDFParse } from "pdf-parse";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://yourwebsite.com"],
  })
);

app.get("/", (_req, res) => res.send("backend is running"))

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
    abortOnLimit: true,
  })
);

async function parsePDF(file: Uint8Array) {
  const parser = new PDFParse(file);
  const data = await parser.getText();
  const info = await parser.getInfo({ parsePageInfo: true });
  return { text: data?.text || "", info, numpages: info?.pages || 0 };
}

app.post("/upload", async (req: Request, res: Response) => {
  try {
    if (!req.files || !("file" in req.files)) {
      return res.status(400).json({
        error: "No PDF file shared.",
        body: `Body is ${JSON.stringify(req.body)}`,
      });
    }

    const pdfFile = req.files.file as UploadedFile;
    const unit8ArrayData = new Uint8Array(pdfFile?.data);
    const result = await parsePDF(unit8ArrayData);
    console.log("PDF parsed successfully: ", result);
    res.json({ result, success: true });
  } catch (error) {
    console.error("Error processing PDF:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message, success: false });
    }
    res.status(500).json({
      error: "Failed to process PDF due to an unknown error.",
      success: false,
    });
  }
});


app.listen(PORT, () => {
  console.log(`The Server is running on http://localhost:${PORT}`);
});