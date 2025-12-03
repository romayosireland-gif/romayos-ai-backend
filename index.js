import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Romayos AI backend is running.");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.responses.create({
      model: process.env.ASSISTANT_MODEL || "gpt-4.1",
      input: message,
      attachments: [{
        file_id: process.env.VECTOR_ID,
        tools: [{ type: "file_search" }]
      }],
      metadata: { assistant_id: process.env.ASSISTANT_ID }
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Romayos AI backend running on port ${port}`));

