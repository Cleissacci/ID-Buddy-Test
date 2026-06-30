import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import mime from "mime-types";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK
// Requires GEMINI_API_KEY environment variable to be set
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // API Route: Transcribe Video/Audio
  app.post("/api/transcribe", upload.single('mediaFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let mimeType = req.file.mimetype;
      if (mimeType === "application/octet-stream" || !mimeType) {
        const lookup = mime.lookup(req.file.originalname);
        if (lookup) {
          mimeType = lookup;
        } else {
          // Default to video/mp4 if we can't figure it out, as it's a safe bet for media
          mimeType = "video/mp4";
        }
      }

      console.log(`Processing uploaded file: ${req.file.originalname} (${mimeType})`);

      // Upload to Gemini
      const uploadResult = await ai.files.upload({
        file: req.file.path,
        config: {
          mimeType: mimeType,
          displayName: req.file.originalname,
        }
      });

      console.log(`Uploaded to Gemini as: ${uploadResult.name}`);

      // Polling to ensure processing is done for videos
      let fileInfo = await ai.files.get({ name: uploadResult.name });
      while (fileInfo.state === 'PROCESSING') {
        console.log(`File ${uploadResult.name} is processing, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        fileInfo = await ai.files.get({ name: uploadResult.name });
      }

      if (fileInfo.state === 'FAILED') {
        throw new Error("File processing failed on Gemini.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            fileData: {
              fileUri: uploadResult.uri,
              mimeType: mimeType
            }
          },
          { text: "Generate a verbatim transcript of this media file. Output only the transcript with timestamps like [00:00:00] Speaker 1: ... Do not include any markdown formatting, just the raw text." }
        ]
      });

      // Cleanup local file
      fs.unlinkSync(req.file.path);
      
      // Attempt to clean up remote file asynchronously
      ai.files.delete({ name: uploadResult.name }).catch(console.error);

      res.json({ transcript: response.text });
    } catch (error: any) {
      console.error("Transcription error:", error);
      fs.writeFileSync("error.log", String(error.stack || error.message || error));
      // Make sure to clean up the local file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to transcribe media" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
