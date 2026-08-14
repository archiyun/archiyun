import { siteConfig } from '../../../siteConfig';
import { localWin11Reply } from '../../../lib/win11Persona';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const userMessage = typeof message === 'string' ? message : '';
    const apiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();

    if (apiKey) {
      const modelId = siteConfig.geminiConfig.modelId;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: siteConfig.geminiConfig.systemPrompt }],
          },
          contents: [{
            parts: [{ text: userMessage || '（主人没说话，只是看了你一眼）' }],
          }],
          generationConfig: {
            maxOutputTokens: siteConfig.geminiConfig.maxOutputTokens,
            temperature: siteConfig.geminiConfig.temperature,
          },
        }),
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (response.ok && reply) {
        return Response.json({ reply });
      }
      console.error('Gemini unavailable, using local persona:', data?.error?.message || response.status);
    }

    return Response.json({ reply: localWin11Reply(userMessage) });
  } catch (error: any) {
    return Response.json({ reply: localWin11Reply('') });
  }
}

export async function GET() {
  return Response.json({
    status: 'Ready',
    model: siteConfig.geminiConfig.modelId,
    hasKey: Boolean((process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim()),
  });
}
