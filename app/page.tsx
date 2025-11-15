import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-3xl p-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-slate-900 leading-tight mb-3">Continuity Simulator</h1>
            <p className="font-light text-slate-600 mb-6">Plan handoffs, identify risks, and keep your organization resilient. Designed to be calm, minimal, and easy to scan.</p>

            <div className="flex gap-4 items-center">
              <Link href="/simulator/teams">
                <a className="inline-block rounded-xl px-6 py-3 bg-sky-700 text-white font-medium shadow hover:bg-sky-800 transition">Open Simulator</a>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="w-full bg-sky-50 rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-serif text-lg text-slate-900 mb-2">Quick preview</h3>
              <p className="text-sm text-slate-600">Select a team, view hierarchy, and open a person's lanyard to review summaries, risks, and handover plans.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
