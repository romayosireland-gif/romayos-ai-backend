import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Create a thread
    const thread = await client.beta.threads.create();

    // Add user message
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage
    });

    // Run the assistant
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Wait for the run to finish
    let runStatus;
    do {
      await new Promise(r => setTimeout(r, 500));
      runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
    } while (runStatus.status !== "completed");

    // Fetch messages
    const messages = await client.beta.threads.messages.list(thread.id);

    const lastMessage = messages.data[0].content[0].text.value;

    res.send({ reply: lastMessage });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => console.log("Romayos AI backend running"));
