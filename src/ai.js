async function askQwen(userMessage, pushName) {
    const name = pushName ? pushName.split(" ")[0] : "Boss"
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
                messages: [{ role: "system", content: `You are THIAGO AI built by Thiago. User is ${name}. Reply like Meta AI. Never say you are Qwen.` }, { role: "user", content: userMessage }],
                temperature: 0.7, max_tokens: 1000
            })
        })
        const data = await res.json()
        return data.choices?.[0]?.message?.content || "Try again Boss 😅"
    } catch (e) { console.error(e); return "Network error, try again" }
}
module.exports = { askQwen }
