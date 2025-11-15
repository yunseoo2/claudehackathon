"use client";

import { Button } from "./ui/button";
import { GitIcon, VercelIcon } from "./icons";
import Link from "next/link";
import { BookOpen, Home, Activity, Users } from "lucide-react";

export const Navbar = () => {
  return (
    <div className="px-6 py-4 flex flex-row gap-4 justify-between border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="flex gap-2">
        <Link href="/">
          <button className="px-4 py-2 rounded-lg text-[14px] font-light text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 border border-transparent hover:border-border/40">
            <Home className="w-4 h-4" />
            Home
          </button>
        </Link>
        <Link href="/knowledge">
          <button className="px-4 py-2 rounded-lg text-[14px] font-light text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 border border-transparent hover:border-border/40">
            <BookOpen className="w-4 h-4" />
            Knowledge
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="px-4 py-2 rounded-lg text-[14px] font-light text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 border border-transparent hover:border-border/40">
            <Activity className="w-4 h-4" />
            Dashboard
          </button>
        </Link>
        <Link href="/transition">
          <button className="px-4 py-2 rounded-lg text-[14px] font-light text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 border border-transparent hover:border-border/40">
            <Users className="w-4 h-4" />
            Transition
          </button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Link href="https://github.com/vercel-labs/ai-sdk-preview-python-streaming">
          <button className="px-4 py-2 rounded-lg text-[14px] font-light text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-2 border border-border/40">
            <GitIcon />
            View Source
          </button>
        </Link>

        <Link href="https://vercel.com/new/clone?repository-url=https://github.com/vercel-labs/ai-sdk-preview-python-streaming">
          <button className="px-4 py-2 rounded-lg text-[14px] font-light bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
            <VercelIcon />
            Deploy
          </button>
        </Link>
      </div>
    </div>
  );
};
