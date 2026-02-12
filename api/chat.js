export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Valid message is required" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    // 🔥 Cek status response dulu
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({
        error: errorData.error?.message || "AI request failed",
      });
    }

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") || null;

    if (!reply) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
