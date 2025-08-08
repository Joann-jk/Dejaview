"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, RefreshCw, Share2, Sparkles, ImagePlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Props = {
  titleClassName?: string
}

type Result = {
  story: string
  role: string
  personality: string
  death: string
  skills: { name: string; score: number }[]
}

const SCAN_STEPS = [
  "Scanning facial wrinkles for karmic energy…",
  "Measuring aura density…",
  "Triangulating deja vu frequency…",
  "Contacting Past Life Archives in Himalayas…",
  "Decrypting cosmic paperwork (so many stamps)…",
]

const ROLES = [
  "Market bread seller in 18th-century France",
  "Local post office clerk",
  "Village well caretaker",
  "Traveling spice merchant",
  "Street musician with only two songs",
  "Bookstore assistant who reads on the job",
  "Apprentice shoemaker",
  "Train station tea seller",
  "Public park bench painter",
  "Ferry ticket collector",
  "Town crier who never shouts loud enough",
  "Carpenter’s apprentice",
  "Small-town newspaper delivery person",
  "Flower market vendor",
  "School janitor who knows all the gossip",
  "Ice cream cart pusher in summer",
  "Clock tower maintenance helper",
  "Community theater costume maker",
];

const DEATHS = [
  "Choked on a piece of bread during breakfast",
  "Slipped on freshly mopped floor",
  "Fell asleep on a park bench in winter",
  "Bitten by a mosquito and had an allergic reaction",
  "Hit by a falling coconut",
  "Overexerted while chasing a runaway hat",
  "Stepped in front of a cart while daydreaming",
  "Electrocuted while fixing a radio",
  "Tripped over own shoelaces on stairs",
  "Fell into a well while peeking inside",
  "Accidentally swallowed a button",
  "Knocked over by a runaway goat",
  "Fainted in a hot kitchen",
  "Caught under collapsing bookshelves",
  "Overdosed on cough syrup",
  "Slipped on ice carrying groceries",
  "Bit tongue too hard while eating",
  "Collapsed from laughing too much",
];

const PERSONALITIES = [
  "Always late but always with snacks",
  "Never trusted escalators",
  "Collected buttons from every shirt owned",
  "Refused to drink tea unless stirred clockwise",
  "Believed umbrellas bring bad luck",
  "Couldn’t stop correcting people’s grammar",
  "Loved telling the same story to everyone",
  "Kept forgetting where they parked",
  "Always wore mismatched socks",
  "Was overly competitive about board games",
  "Insisted on writing with fountain pens only",
  "Could not sleep without background noise",
  "Believed their handwriting was art",
  "Ate dessert before meals",
  "Talked to pets as if they were human",
  "Kept a secret stash of candies everywhere",
  "Never finished reading any book they started",
  "Got offended if someone didn’t greet them",
];

const SKILL_POOL = [
  "Knot tying for everyday problems",
  "Bargaining in street markets",
  "Navigating without a map",
  "Carrying too many grocery bags at once",
  "Cooking with exactly three ingredients",
  "Fixing squeaky doors",
  "Reading while walking without bumping into people",
  "Folding clothes perfectly",
  "Guessing people’s jobs based on their shoes",
  "Packing a suitcase efficiently",
  "Balancing heavy trays",
  "Remembering faces but not names",
  "Whistling any song out of tune",
  "Starting conversations with strangers",
  "Organizing messy drawers",
  "Making tea at the perfect temperature",
  "Repairing torn clothes quickly",
  "Finding lost items in unlikely places",
];


export default function DejaViewApp({ titleClassName }: Props) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [phase, setPhase] = useState<"idle" | "scanning" | "result">("idle")
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [duration, setDuration] = useState<number>(4000)
  const progressTimer = useRef<number | null>(null)

  const randomBetween = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const pick = useCallback(<T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)]
  }, [])

  const generateSkills = useCallback(() => {
    const shuffled = [...SKILL_POOL].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 4)
    return selected.map((name) => ({
      name,
      score: randomBetween(1, 10),
    }))
  }, [])

  const generateResult = useCallback((): Result => {
    const role = pick(ROLES)
    const death = pick(DEATHS)
    const personality = pick(PERSONALITIES)
    const story = `In your past life, you were a ${role}, known for being ${personality}, until you ${death}.`
    return {
      story,
      role,
      personality,
      death,
      skills: generateSkills(),
    }
  }, [generateSkills, pick])

  const startScan = useCallback(() => {
    setPhase("scanning")
    setStepIndex(0)
    setProgress(0)
    const total = randomBetween(3200, 5000)
    setDuration(total)

    // Smooth progress animation loop
    const start = performance.now()
    const loop = (now: number) => {
      const elapsed = now - start
      const pct = Math.min(99, Math.floor((elapsed / total) * 100))
      setProgress(pct)
      if (pct < 99) {
        progressTimer.current = window.requestAnimationFrame(loop)
      }
    }
    progressTimer.current = window.requestAnimationFrame(loop)

    // Step advance timing
    const perStep = Math.floor(total / SCAN_STEPS.length)
    SCAN_STEPS.forEach((_, i) => {
      window.setTimeout(() => setStepIndex(i), perStep * i)
    })

    // Finish
    window.setTimeout(() => {
      if (progressTimer.current) window.cancelAnimationFrame(progressTimer.current)
      setProgress(100)
      const r = generateResult()
      setResult(r)
      setPhase("result")
    }, total)
  }, [generateResult])

  const onFileChange = useCallback(
    (f: File | null) => {
      if (!f) return
      if (!f.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" })
        return
      }
      setFile(f)
      const url = URL.createObjectURL(f)
      setPreview(url)
      startScan()
    },
    [startScan, toast]
  )

  useEffect(() => {
    return () => {
      if (progressTimer.current) window.cancelAnimationFrame(progressTimer.current)
      if (preview) URL.revokeObjectURL(preview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentStep = useMemo(() => SCAN_STEPS[Math.min(stepIndex, SCAN_STEPS.length - 1)], [stepIndex])

  const reset = () => {
    setPhase("idle")
    setStepIndex(0)
    setProgress(0)
    setResult(null)
    setFile(null)
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }

  const share = async () => {
    const text = `DejaView says: ${result?.story} 🔮`
    try {
      if (navigator.share) {
        await navigator.share({
          title: "DejaView Past Life Reveal",
          text,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        })
      } else {
        await navigator.clipboard.writeText(text)
        toast({ title: "Copied to clipboard", description: "Your past life has entered the group chat." })
      }
    } catch {
      // ignore cancel
    }
  }

  return (
    <div className="relative z-10">
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <h1
            className={cn(
              "text-5xl sm:text-6xl font-bold tracking-wide text-transparent bg-clip-text",
              "bg-gradient-to-b from-fuchsia-300 via-violet-200 to-amber-200 drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]",
              "select-none"
            )}
            style={{ letterSpacing: "0.06em", textShadow: "0 0 30px rgba(139,92,246,0.35)" }}
          >
            <span className={cn(titleClassName, "inline-flex items-center gap-3")}>
              DejaView <Sparkles className="h-8 w-8 text-amber-200" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-violet-100/90">
            Upload your photo to reveal your ridiculous past life.
          </p>
        </div>

        <Card className="w-full bg-black/40 backdrop-blur-md border-violet-300/20 shadow-[0_0_40px_rgba(124,58,237,0.25)]">
          <CardContent className="p-4 sm:p-6">
            {/* Uploader / Preview */}
            {phase === "idle" && (
              <div className="grid gap-5">
                <label
                  htmlFor="dejaview-file"
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden",
                    "rounded-xl border-2 border-dashed border-violet-300/40 p-8 text-center",
                    "transition hover:border-violet-200/80 hover:bg-violet-300/5 focus-within:ring-2 focus-within:ring-violet-300/40"
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(14,165,233,0.08),transparent_70%)]" />
                  <Upload className="h-10 w-10 text-violet-200 mb-3" aria-hidden="true" />
                  <div className="text-violet-50 font-medium">Click to upload a photo</div>
                  <div className="text-violet-200/70 text-sm">or drag and drop (PNG, JPG)</div>
                  <input
                    id="dejaview-file"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                  />
                </label>

                <div className="flex items-center justify-center gap-2 text-xs text-violet-200/70">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  Tip: Drama increases accuracy by 300% (totally scientific).
                </div>
              </div>
            )}

            {phase !== "idle" && (
              <div className="grid gap-6">
                {/* Image Preview */}
                {preview && (
                  <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg ring-1 ring-violet-300/30">
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt="Uploaded photo preview for DejaView analysis"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                    {/* Aura overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 mix-blend-screen"
                      style={{
                        background:
                          "radial-gradient(40% 40% at 50% 50%, rgba(168,85,247,0.35), rgba(2,6,23,0) 70%)",
                      }}
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* Scanning */}
                {phase === "scanning" && (
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-violet-100">Performing Quantum Karmic Analysis</div>
                      <div className="text-xs text-amber-200/90">{Math.ceil(duration / 1000)}s</div>
                    </div>
                    <Progress value={progress} className="h-3 bg-violet-100/10" />
                    <div className="min-h-[2.25rem]">
                      <span className="glitch-text text-violet-50/95 text-sm sm:text-base">
                        {currentStep}
                      </span>
                    </div>
                    <div className="text-[11px] text-violet-200/60">
                      Note: This may involve bribing several bureaucratic ghosts.
                    </div>
                  </div>
                )}

                {/* Result */}
                {phase === "result" && result && (
                  <div className="grid gap-5">
                    <div className="text-center">
                      <div className="inline-block rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1 text-xs uppercase tracking-widest text-amber-100 shadow-[0_0_20px_rgba(234,179,8,0.25)]">
                        Past Life Identified
                      </div>
                      <p className="mt-3 text-xl sm:text-2xl font-semibold text-violet-50 drop-shadow">
                        {result.story}
                      </p>
                    </div>

                    {/* Skill scores */}
                    <div className="grid gap-3">
                      <h3 className="text-sm font-medium text-violet-100/90">Past Life Skill Scores</h3>
                      <div className="grid gap-3">
                        {result.skills.map((s, idx) => (
                          <div key={`${s.name}-${idx}`} className="grid gap-1.5">
                            <div className="flex items-center justify-between text-xs text-violet-200/90">
                              <span>{s.name}</span>
                              <span className="text-amber-200 font-semibold">{s.score}/10</span>
                            </div>
                            <Progress
                              value={(s.score / 10) * 100}
                              className="h-2 bg-violet-100/10"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        onClick={reset}
                        variant="secondary"
                        className="bg-violet-100/10 text-violet-50 border border-violet-300/30 hover:bg-violet-100/20"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Scan Again
                      </Button>
                      <Button
                        onClick={share}
                        className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Result
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <footer className="mt-6 text-center text-[11px] text-violet-100/60">
          DejaView is 100% real, according to absolutely no scientists.
        </footer>
      </div>

      {/* Glitch text effect and subtle twinkle */}
      <style>{`
        @keyframes glitch {
          0% { text-shadow: 0.03em 0 0 rgba(168,85,247,0.8), -0.03em 0 0 rgba(56,189,248,0.8); transform: translate(0,0); }
          20% { text-shadow: -0.03em 0 0 rgba(168,85,247,0.8), 0.03em 0 0 rgba(56,189,248,0.8); transform: translate(0.5px,0); }
          40% { text-shadow: 0.06em 0 0 rgba(168,85,247,0.8), -0.06em 0 0 rgba(56,189,248,0.8); transform: translate(-0.5px,0.5px);}
          60% { text-shadow: -0.04em 0 0 rgba(168,85,247,0.8), 0.04em 0 0 rgba(56,189,248,0.8); transform: translate(0.5px,-0.5px);}
          80% { text-shadow: 0.02em 0 0 rgba(168,85,247,0.8), -0.02em 0 0 rgba(56,189,248,0.8); transform: translate(-0.5px,0);}
          100% { text-shadow: 0.03em 0 0 rgba(168,85,247,0.8), -0.03em 0 0 rgba(56,189,248,0.8); transform: translate(0,0); }
        }
        .glitch-text {
          animation: glitch 1.2s infinite;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  )
}
