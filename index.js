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

// ⭐ Final working Assistants endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const assistantId = process.env.ASSISTANT_ID;

    // 1. Create a NEW thread
    const thread = await client.beta.threads.create();

    // 2. Add user message to thread (CORRECT FORMAT)
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: [
        {
          type: "text",
          text: userMessage
        }
      ]
    });

    // 3. Run the assistant
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId
    });

    // 4. Retrieve thread messages
    const msgList = await client.beta.threads.messages.list(thread.id);

    // 5. Find the latest assistant reply
    const assistantMsg = msgList.data.find(m => m.role === "assistant");

    const reply =
      assistantMsg?.content?.[0]?.text?.value ||
      "Assistant returned no text.";

    res.json({ reply });

  } catch (err) {
    console.error("BACKEND ERROR:", err);
    res.status(500).json({ error: "AI backend failed" });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Romayos AI backend running on port ${port}`));
