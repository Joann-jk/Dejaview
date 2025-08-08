import { Orbitron } from 'next/font/google'
import DejaViewApp from "@/components/dejaview-app"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})

export default function Page() {
  return (
    <main className="min-h-dvh relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/cosmic.png')",
          filter: "saturate(1.2) brightness(0.9)",
        }}
        aria-hidden="true"
      />
      {/* Glow overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(124, 58, 237, 0.45) 0%, rgba(0,0,0,0) 70%), radial-gradient(50% 40% at 70% 90%, rgba(6, 182, 212, 0.35) 0%, rgba(0,0,0,0) 70%), radial-gradient(30% 30% at 10% 80%, rgba(234, 179, 8, 0.25) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <div className="relative">
        <DejaViewApp titleClassName={orbitron.className} />
      </div>
    </main>
  )
}
