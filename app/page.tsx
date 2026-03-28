export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <div className="text-6xl">🤖</div>
        <h1 className="text-4xl font-bold tracking-tight">
          Gemini WhatsApp Bot
        </h1>
        <p className="text-zinc-400 text-lg max-w-sm">
          Your AI-powered WhatsApp assistant is live and running.
        </p>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Webhook active at /api/whatsapp</span>
        </div>
        <p className="text-zinc-600 text-sm mt-4">
          Send a WhatsApp message to your Twilio number to get starteds.
        </p>
      </div>
    </div>
  );
}