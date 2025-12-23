"use client";

import { useMemo, useState } from "react";

type GeneratorResponse = {
  title: string;
  hook: string;
  description: string;
  hashtags: string[];
  voiceover: string[];
  shotList: { scene: string; visuals: string; sfx: string }[];
  editingBeats: { timestamp: string; action: string; notes: string }[];
  captions: string[];
  callToAction: string;
  soundtrack: { trackIdea: string; vibe: string }[];
  bRollPrompts: string[];
  automationStack: string[];
};

const normalizeResponse = (payload: Record<string, unknown>): GeneratorResponse => {
  const ensureStringArray = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item) => typeof item === "string")
      : [];

  const ensureShotList = (value: unknown) =>
    Array.isArray(value)
      ? value
          .map((item) =>
            typeof item === "object" && item !== null
              ? {
                  scene: typeof (item as { scene?: unknown }).scene === "string"
                    ? (item as { scene: string }).scene
                    : "Scene improvvisata",
                  visuals:
                    typeof (item as { visuals?: unknown }).visuals === "string"
                      ? (item as { visuals: string }).visuals
                      : "Visual glitch + overlay meme",
                  sfx:
                    typeof (item as { sfx?: unknown }).sfx === "string"
                      ? (item as { sfx: string }).sfx
                      : "Bass boost + risate",
                }
              : null
          )
          .filter((item): item is { scene: string; visuals: string; sfx: string } => Boolean(item))
      : [];

  const ensureBeats = (value: unknown) =>
    Array.isArray(value)
      ? value
          .map((item) =>
            typeof item === "object" && item !== null
              ? {
                  timestamp:
                    typeof (item as { timestamp?: unknown }).timestamp === "string"
                      ? (item as { timestamp: string }).timestamp
                      : "0s",
                  action:
                    typeof (item as { action?: unknown }).action === "string"
                      ? (item as { action: string }).action
                      : "Cut rapido",
                  notes:
                    typeof (item as { notes?: unknown }).notes === "string"
                      ? (item as { notes: string }).notes
                      : "Aggiungi overlay testi meme",
                }
              : null
          )
          .filter((item): item is { timestamp: string; action: string; notes: string } => Boolean(item))
      : [];

  const ensureSoundtrack = (value: unknown) =>
    Array.isArray(value)
      ? value
          .map((item) =>
            typeof item === "object" && item !== null
              ? {
                  trackIdea:
                    typeof (item as { trackIdea?: unknown }).trackIdea === "string"
                      ? (item as { trackIdea: string }).trackIdea
                      : "Italo-dance sped up",
                  vibe:
                    typeof (item as { vibe?: unknown }).vibe === "string"
                      ? (item as { vibe: string }).vibe
                      : "Hyperpop + eurobeat",
                }
              : null
          )
          .filter((item): item is { trackIdea: string; vibe: string } => Boolean(item))
      : [];

  return {
    title: typeof payload.title === "string" ? payload.title : "",
    hook: typeof payload.hook === "string" ? payload.hook : "",
    description:
      typeof payload.description === "string" ? payload.description : "",
    hashtags: ensureStringArray(payload.hashtags),
    voiceover: ensureStringArray(payload.voiceover),
    shotList: ensureShotList(payload.shotList),
    editingBeats: ensureBeats(payload.editingBeats),
    captions: ensureStringArray(payload.captions),
    callToAction:
      typeof payload.callToAction === "string" ? payload.callToAction : "",
    soundtrack: ensureSoundtrack(payload.soundtrack),
    bRollPrompts: ensureStringArray(payload.bRollPrompts),
    automationStack: ensureStringArray(payload.automationStack),
  };
};

const defaultResponse: GeneratorResponse = {
  title: "",
  hook: "",
  description: "",
  hashtags: [],
  voiceover: [],
  shotList: [],
  editingBeats: [],
  captions: [],
  callToAction: "",
  soundtrack: [],
  bRollPrompts: [],
  automationStack: [],
};

const presets = [
  {
    label: "Calcio Chaos",
    topic: "Serie A tifosi losing it over VAR",
    vibe: "extremely online brainrot with Roman slang",
    length: "55",
    channelGoal: "viral Shorts carousel for calcio meme page",
  },
  {
    label: "Milano Glow Up",
    topic: "day in the life of a Milan secchione turned meme lord",
    vibe: "fashion-core with hyperactive Gen Z narration",
    length: "75",
    channelGoal: "boost YouTube automation CPM with lifestyle memes",
  },
  {
    label: "Roman Holiday Fail",
    topic: "tourists discovering Roman brainrot slang",
    vibe: "chaotic vlog recap with speed-ramp transitions",
    length: "65",
    channelGoal: "grow travel automation channel with comedic shorts",
  },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState("60");
  const [vibe, setVibe] = useState("Italian brainrot, meme-saturated, hyper-edited");
  const [channelGoal, setChannelGoal] = useState("Grow automation channel with daily meme uploads");
  const [extraDetails, setExtraDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratorResponse>(defaultResponse);

  const canGenerate = useMemo(() => topic.trim().length > 3 && vibe.trim().length > 3, [topic, vibe]);

  const handlePreset = (index: number) => {
    const preset = presets[index];
    setTopic(preset.topic);
    setVibe(preset.vibe);
    setLength(preset.length);
    setChannelGoal(preset.channelGoal);
    setExtraDetails("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canGenerate || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          length,
          vibe,
          channelGoal,
          extraDetails,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Qualcosa è andato storto, riprova");
      }

      const data = (await response.json()) as Record<string, unknown>;
      setResult(normalizeResponse(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore imprevisto";
      setError(message);
      setResult(defaultResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffedd5] via-[#e4e4ff] to-[#fef08a] px-4 py-10 font-sans text-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="w-full rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur lg:w-[420px]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-500">Automation Lab</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-zinc-900">
                Brainrot Shorts Foundry
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Drop a topic, let the agentic meme-bot craft a full Italian brainrot YouTube automation package.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-zinc-600">Topic</label>
                <textarea
                  className="mt-1 h-20 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                  placeholder="Esempio: Il nonno che scopre TikTok e diventa il king del brainrot"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-600">Runtime (secondi)</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                  type="number"
                  min={30}
                  max={180}
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-600">Vibe principale</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                  placeholder="Es. Romanaccio super speed con glitch e bass boost"
                  value={vibe}
                  onChange={(event) => setVibe(event.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-600">Channel Goal</label>
                <input
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                  placeholder="Es. Monetizzare con 10 shorts al giorno"
                  value={channelGoal}
                  onChange={(event) => setChannelGoal(event.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-600">Extra dettagli</label>
                <textarea
                  className="mt-1 h-20 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                  placeholder="Call to action, prodotti da promuovere, inside jokes..."
                  value={extraDetails}
                  onChange={(event) => setExtraDetails(event.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={!canGenerate || isLoading}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Generazione in corso..." : "Genera pacchetto meme"}
              </button>
            </form>

            <div className="-mx-2 flex gap-2">
              {presets.map((preset, index) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePreset(index)}
                  className="flex-1 rounded-2xl border border-transparent bg-zinc-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">
                {error}
              </p>
            )}
          </div>
        </aside>

        <section className="flex-1 rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400">
                Render queue
              </p>
              <h2 className="text-3xl font-black text-zinc-900">Meme Blueprint</h2>
            </header>

            {!result.title && !isLoading && (
              <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/60 p-10 text-center text-sm text-zinc-500">
                Scegli un preset o spara un topic assurdo per spawnare un video script da YouTube automation in stile brainrot italiano.
              </div>
            )}

            {isLoading && (
              <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[3px] border-dashed border-pink-300 border-t-transparent" />
                <p className="mt-4 text-sm font-semibold text-pink-500">
                  Mixando hook, cringe e caos italico...
                </p>
              </div>
            )}

            {result.title && !isLoading && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-zinc-900">Titolo Boom</h3>
                  <p className="mt-2 text-xl font-semibold text-pink-500">{result.title}</p>
                  <p className="mt-3 text-sm font-medium text-zinc-700">Hook veloce:</p>
                  <p className="text-sm text-zinc-600">{result.hook}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900">Voiceover</h3>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                      {result.voiceover.map((line, index) => (
                        <li key={`${line}-${index}`} className="rounded-2xl bg-zinc-100 px-3 py-2">
                          <span className="font-semibold text-pink-500">#{index + 1} </span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900">Shot List</h3>
                    <ul className="mt-3 space-y-3 text-sm text-zinc-600">
                      {result.shotList.map((item, index) => (
                        <li key={`${item.scene}-${index}`} className="rounded-2xl bg-zinc-100 px-3 py-2">
                          <p className="font-semibold text-zinc-800">{item.scene}</p>
                          <p className="text-xs text-zinc-500">Visual: {item.visuals}</p>
                          <p className="text-xs text-zinc-500">SFX: {item.sfx}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-zinc-900">Timeline da Premiere</h3>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                    {result.editingBeats.map((beat, index) => (
                      <li key={`${beat.timestamp}-${index}`} className="flex flex-col rounded-2xl bg-zinc-100 px-3 py-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">{beat.timestamp}</span>
                          <span className="text-xs font-medium text-zinc-500">{beat.action}</span>
                        </div>
                        <p className="text-xs text-zinc-500">{beat.notes}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900">B-Roll Prompts</h3>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                      {result.bRollPrompts.map((prompt, index) => (
                        <li key={`${prompt}-${index}`} className="rounded-2xl bg-zinc-100 px-3 py-2">
                          {prompt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900">Soundtrack Ideas</h3>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                      {result.soundtrack.map((track, index) => (
                        <li key={`${track.trackIdea}-${index}`} className="rounded-2xl bg-zinc-100 px-3 py-2">
                          <p className="font-semibold text-zinc-800">{track.trackIdea}</p>
                          <p className="text-xs text-zinc-500">{track.vibe}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-zinc-900">Caption + CTA</h3>
                  <p className="mt-2 text-sm text-zinc-600">{result.description}</p>
                  <p className="mt-3 text-sm font-semibold text-pink-500">{result.callToAction}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    {result.hashtags.map((tag) => (
                      <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-zinc-900">Automation Stack</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-zinc-600 md:grid-cols-2">
                    {result.automationStack.map((tool, index) => (
                      <li key={`${tool}-${index}`} className="rounded-2xl bg-zinc-100 px-3 py-2">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-zinc-900">Short Captions</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-zinc-600 md:grid-cols-2">
                    {result.captions.map((caption, index) => (
                      <li key={`${caption}-${index}`} className="rounded-2xl bg-zinc-100 px-3 py-2">
                        {caption}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
