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

// ⭐ FIXED: REAL ASSISTANT CALL
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const assistantId = process.env.ASSISTANT_ID;

    // 1. Create a thread
    const thread = await client.beta.threads.create();

    // 2. Add message to the thread
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage
    });

    // 3. Run assistant
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId
    });

    // 4. Extract response
    const messages = await client.beta.threads.messages.list(thread.id);
    const reply = messages.data[0].content[0].text.value;

    res.json({ reply });

  } catch (err) {
    console.error("BACKEND ERROR:", err);
    res.status(500).json({ error: "AI backend failed" });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Romayos AI backend running on port ${port}`));


