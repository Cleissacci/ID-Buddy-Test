import "dotenv/config";
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

const app = express();
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

// API Route: SME Processing (Jargon & Analogies)
app.post("/api/sme-process", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: `You are an expert instructional designer. Analyze the following subject matter expert (SME) brain dump. Identify complex jargon/technical terms and suggest 2-3 simpler, plain-language alternatives for each. Also, generate 2-3 creative, everyday analogies to explain the complex concepts mentioned in the text. Text:\n\n${text}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            jargonTerms: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  term: { type: "STRING" },
                  alternatives: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  }
                },
                required: ["term", "alternatives"]
              }
            },
            analogies: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  text: { type: "STRING" }
                }
              },
              required: ["title", "text"]
            }
          },
          required: ["jargonTerms", "analogies"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("SME processing error:", error);
    res.status(500).json({ error: "Failed to process SME input" });
  }
});

// API Route: Generate Distractors
app.post("/api/generate-distractors", async (req, res) => {
  try {
    const { question, correctAnswer } = req.body;
    if (!question || !correctAnswer) {
      return res.status(400).json({ error: "Question and correct answer are required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: `You are an expert instructional designer and psychometrician. Generate exactly 3 plausible but incorrect multiple-choice distractors for the following question. Ensure the distractors represent common misconceptions or plausible incorrect reasoning. Provide each distractor with a brief explanation in parentheses, for example: 'Distractor text (Explanation of why it is a plausible misconception)'.\n\nQuestion: ${question}\nCorrect Answer: ${correctAnswer}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            distractors: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["distractors"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Distractor generation error:", error);
    res.status(500).json({ error: "Failed to generate distractors" });
  }
});

// API Route: Clean Script
app.post("/api/clean-script", async (req, res) => {
  try {
    const { script } = req.body;
    if (!script) {
      return res.status(400).json({ error: "Script text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: `You are an expert audio-visual scripting assistant. Clean and polish the following raw speech transcript. Remove speaker tags, timestamps (e.g., [00:00:00]), filler words (e.g., 'uh', 'um', 'like', 'you know'), and improve the overall grammatical flow so that it sounds like a professional, polished narration or voiceover script. Return the clean script split into logical paragraph blocks. Text:\n\n${script}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            cleanedBlocks: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["cleanedBlocks"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Script cleaning error:", error);
    res.status(500).json({ error: "Failed to clean script" });
  }
});

// API Route: Suggest Interactions
app.post("/api/suggest-interactions", async (req, res) => {
  try {
    const { blockText } = req.body;
    if (!blockText) {
      return res.status(400).json({ error: "Block text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: `You are an interactive e-learning developer. Suggest exactly 3 interactive learning treatments (e.g. timelines, drag-and-drops, click-to-reveals, scenarios, quizzes) that would fit the following paragraph text to engage learners. Assign a type ('timeline', 'drag-drop', or 'quiz') to each suggestion based on its style, and write a title and brief description. Text:\n\n${blockText}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            suggestions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING", enum: ["timeline", "drag-drop", "quiz"] },
                  title: { type: "STRING" },
                  description: { type: "STRING" }
                },
                required: ["type", "title", "description"]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Interaction suggestions error:", error);
    res.status(500).json({ error: "Failed to suggest interactions" });
  }
});

// API Route: Accessibility Checker
app.post("/api/a11y-check", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: `You are a WCAG 2.1 accessibility auditor for e-learning content. Analyze the following content for potential accessibility and readability issues. Check readability grade level (Flesch-Kincaid style, e.g. Grade 8), look for complex sentences, check if captions might be required for media mentions, check for keyboard navigation compatibility issues, and check contrast / alt text issues. Return a parsed response with contrastScore (out of 100, where 100 is no contrast issues), altTextScore (out of 100, where 100 is no missing alt text issues), readabilityGrade (as integer), a WCAG checklist state (contrast, captions, keyboard as boolean true/false passes), and a list of criticalIssues containing type ('contrast', 'captions', 'keyboard', 'complexity', etc.), a title, and description. Content:\n\n${content}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            contrastScore: { type: "INTEGER" },
            altTextScore: { type: "INTEGER" },
            readabilityGrade: { type: "INTEGER" },
            checklist: {
              type: "OBJECT",
              properties: {
                contrast: { type: "BOOLEAN" },
                captions: { type: "BOOLEAN" },
                keyboard: { type: "BOOLEAN" }
              },
              required: ["contrast", "captions", "keyboard"]
            },
            criticalIssues: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING" },
                  title: { type: "STRING" },
                  description: { type: "STRING" }
                },
                required: ["type", "title", "description"]
              }
            }
          },
          required: ["contrastScore", "altTextScore", "readabilityGrade", "checklist", "criticalIssues"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Accessibility check error:", error);
    res.status(500).json({ error: "Failed to perform accessibility check" });
  }
});

// Vite middleware for development
if (!process.env.VERCEL) {
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

export default app;
