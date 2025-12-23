import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `You are MemeForge, an elite Italian social automation director.
Deliver ultra-structured YouTube Shorts plans that fuse Italian brainrot slang, comedic pacing,
and monetizable hooks. Respond strictly as JSON.`;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { message: "OPENAI_API_KEY mancante. Configura l'ambiente." },
      { status: 500 }
    );
  }

  try {
    const { topic, length, vibe, channelGoal, extraDetails } = await request.json();

    if (!topic || !vibe) {
      return NextResponse.json(
        { message: "Topic e vibe sono obbligatori" },
        { status: 400 }
      );
    }

    const seconds = Number.parseInt(length, 10);

    const completion = await openai.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      top_p: 0.9,
      max_output_tokens: 1400,
      response_format: { type: "json_object" },
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Craft a complete automation-ready creative pack for a YouTube Short.
Topic: ${topic}
Target runtime: ${Number.isFinite(seconds) ? seconds : 60} seconds
Primary vibe: ${vibe}
Channel goal: ${channelGoal ?? "grow the channel"}
Extra notes: ${extraDetails ?? "no additional info"}

Requirements:
- Use viral Italian brainrot slang throughout, mix English catchphrases if it enhances virality.
- Provide sections: title, hook, description, callToAction, hashtags (array), voiceover (array of sentences with timestamp markers optional), shotList (array with scene, visuals, sfx), editingBeats (array with timestamp, action, notes), captions (array), soundtrack (array with trackIdea, vibe), bRollPrompts (array), automationStack (automation tools suggestions).
- Keep timestamps aligned to the runtime, start at 0s and progress quickly.
- Emphasize meme culture, calcio references, chaotic pacing, and agentic workflow automation tips.
- Voiceover must sound like a hyperactive Italian creator.
- automationStack should list concrete SaaS or AI tools to automate production.
- Keep JSON keys camelCase.
          `,
        },
      ],
    });

    const outputText = completion.output_text;

    if (!outputText) {
      throw new Error("Risposta modello non valida");
    }

    const parsed = JSON.parse(outputText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("/api/generate error", error);
    return NextResponse.json(
      { message: "Impossibile generare il blueprint al momento" },
      { status: 500 }
    );
  }
}
