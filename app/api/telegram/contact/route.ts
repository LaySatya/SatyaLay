import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("📨 Telegram API called");

  try {
    const body = await req.json();
    console.log("📦 Payload:", body);

    const { name, email, message } = body;

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    // Format message nicely using Markdown
    const telegramMessage = `
📩 *New Message from Website*

*Name:* ${name}
*Email:* ${email}
*Message:*
${message}
    `;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    console.log("📬 Telegram response:", data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Telegram error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
