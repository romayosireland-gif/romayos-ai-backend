const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Simple check route
app.get("/", (req, res) => {
  res.send("Romayos AI backend is running.");
});

// Main AI route
app.post("/ask", async (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.status(400).json({ error: "No message provided." });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for Romayos staff. Answer clearly and briefly. If you don't know something, say so.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong talking to OpenAI." });
  }
});

app.listen(port, () => {
  console.log(`Romayos AI backend listening on port ${port}`);
});
