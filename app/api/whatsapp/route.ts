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

    // 1. Initialize Gemini 2.5 Flash-Lite (Best for Free Tier)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // 2. Generate AI Response
    const result = await model.generateContent(incomingMsg);
    const aiResponse = result.response.text();

    // 3. Send back to WhatsApp via Twilio
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fromNumber,
      body: aiResponse,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}