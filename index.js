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

// ⭐ Correct Assistants API Integration
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const assistantId = process.env.ASSISTANT_ID;

    // 1. Create thread
    const thread = await client.beta.threads.create();

    // 2. Add user message - MUST use "input_text"
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: [
        {
          type: "input_text",
          text: userMessage
        }
      ]
    });

    // 3. Run assistant
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId
    });

    // 4. Retrieve messages
    const messages = await client.beta.threads.messages.list(thread.id);

    // 5. Extract assistant reply
    const assistantMsg = messages.data.find(
      msg => msg.role === "assistant"
    );

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
app.listen(port, () =>
  console.log(`Romayos AI backend running on port ${port}`)
);

