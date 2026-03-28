import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import twilio from 'twilio';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const incomingMsg = formData.get('Body') as string;
    const fromNumber = formData.get('From') as string;

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    // Generate AI response
    const result = await model.generateContent(incomingMsg);
    const aiResponse = result.response.text();

    // Split the AI response into chunks of 1500 characters
    const chunks = aiResponse.match(/[\s\S]{1,1500}/g) || [];

    // Send each chunk as a separate message
    for (const chunk of chunks) {
      await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER as string,
        to: fromNumber,
        body: chunk,
    });
}

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}