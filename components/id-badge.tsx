"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface IdBadgeProps {
  name: string;
  team?: string;
  id?: string;
  avatarUrl?: string;
}

export default function IdBadge({ name, team = "Employee", id, avatarUrl }: IdBadgeProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 10;
      const rotateX = ((centerY - y) / centerY) * 10;

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      {/* ID Badge Card */}
      <div
        className="relative group cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        <Card className="w-64 bg-gradient-to-br from-white via-blue-50/30 to-white border-2 border-blue-200 shadow-2xl hover:shadow-blue-200/50 transition-all duration-300">
          <CardContent className="p-6 space-y-4">
            {/* Header with Logo/Company */}
            <div className="flex justify-between items-start">
              <div className="text-xs font-semibold text-blue-600 tracking-wider">
                EMPLOYEE ID
              </div>
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {team}
              </Badge>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="w-20 h-20 border-4 border-blue-100 shadow-lg ring-2 ring-blue-200/50">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>

              {/* Name */}
              <div className="text-center">
                <h3 className="font-bold text-lg text-slate-800 tracking-tight">
                  {name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {team} Team
                </p>
              </div>
            </div>

            {/* ID Number with Barcode Style */}
            {id && (
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="text-[10px] text-slate-400 font-semibold tracking-widest mb-1">
                  ID NUMBER
                </div>
                <div className="font-mono text-sm font-bold text-slate-700 tracking-wider">
                  {id}
                </div>
                {/* Barcode visualization */}
                <div className="flex gap-[2px] mt-2 opacity-60">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-800"
                      style={{
                        width: "3px",
                        height: `${Math.random() * 12 + 8}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Holographic Effect Overlay */}
            <div
              className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background: `linear-gradient(
                  ${rotation.y + 135}deg,
                  rgba(147, 197, 253, 0.4) 0%,
                  rgba(191, 219, 254, 0.2) 25%,
                  rgba(147, 197, 253, 0.4) 50%,
                  rgba(191, 219, 254, 0.2) 75%,
                  rgba(147, 197, 253, 0.4) 100%
                )`,
              }}
            />
          </CardContent>
        </Card>

        {/* Badge Clip */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-md shadow-lg border-2 border-slate-500">
          <div className="absolute inset-2 bg-slate-200 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
