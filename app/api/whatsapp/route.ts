import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import twilio from 'twilio';

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper function to pause execution and prevent out-of-order messages
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const incomingMsg = formData.get('Body') as string;
    const fromNumber = formData.get('From') as string;

    // Use the stable 2.5 model and inject a highly specific persona
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      
    });

    // 1. Ask Gemini for the answer
    const result = await model.generateContent(incomingMsg);
    const aiResponse = result.response.text();

    // 2. Split the massive response into safe 1500-character chunks
    const chunks = aiResponse.match(/[\s\S]{1,1500}/g) || [];
    const totalChunks = chunks.length;

    // 3. Send chunks one by one in the correct order
    for (let i = 0; i < totalChunks; i++) {
      // Add a page number like *[1/3]* if the message had to be split
      const prefix = totalChunks > 1 ? `*[${i + 1}/${totalChunks}]*\n` : "";
      
      await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER as string,
        to: fromNumber,
        body: prefix + chunks[i],
      });

      // Wait 1 second before sending the next part so WhatsApp doesn't scramble them
      if (i < totalChunks - 1) {
        await delay(1000); 
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    
    // Fallback message if something catastrophically breaks
    try {
        const fromNumber = (await req.formData()).get('From') as string;
        await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER as string,
            to: fromNumber,
            body: "⚠️ System error or rate limit hit. Give me a minute to cool down.",
        });
    } catch(e) {
        // Ignore if we can't even send the error message
    }

    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}