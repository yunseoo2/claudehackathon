"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Dept = { id: string; name: string };
type Team = { id: string; name: string; departmentId: string };
type Person = { id: string; name: string; teamId?: string; managerId?: string | null; role?: string };

export default function TeamGraph({ departments, teams, people }: { departments: Dept[]; teams: Team[]; people: Person[] }) {
  // start with no department selected so user explicitly chooses one
  const [selectedDept, setSelectedDept] = React.useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null);
  const router = useRouter();

  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const dragRef = React.useRef<{ x: number; y: number } | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const filteredTeams = selectedDept ? teams.filter(t => t.departmentId === selectedDept) : [];
  const teamPeople = selectedTeam ? people.filter(p => p.teamId === selectedTeam) : [];

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY / 500;
    setScale(s => Math.max(0.5, Math.min(2, s + delta)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onMouseUp = () => {
    setDragging(false);
    dragRef.current = null;
  };

  return (
    <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-8">
      <div className="flex gap-4 mb-8 items-center">
        <select
          value={selectedDept || ""}
          onChange={(e) => {
            setSelectedDept(e.target.value || null);
            setSelectedTeam(null);
          }}
          className="px-4 py-2.5 border border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-dark-700 font-light text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-300 dark:focus:border-blue-600 transition-all"
        >
          <option value="">Select department</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={selectedTeam || ""}
          onChange={(e) => setSelectedTeam(e.target.value || null)}
          className="px-4 py-2.5 border border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-dark-700 font-light text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-300 dark:focus:border-blue-600 transition-all"
        >
          <option value="">Select team</option>
          {filteredTeams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3">
          <button className="px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-light hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-md transition-all" onClick={() => setScale(s => Math.min(2, s + 0.1))}>Zoom +</button>
          <button className="px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-light hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-md transition-all" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>Zoom -</button>
          <button className="px-4 py-2 border border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-dark-700 text-slate-600 dark:text-slate-400 font-light hover:bg-slate-50 dark:hover:bg-dark-600 hover:shadow-md transition-all" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}>Reset</button>
        </div>
      </div>

      {!selectedTeam && (
        <div className="text-slate-500 dark:text-slate-400 font-light text-center py-12">Select a team to render its hierarchy graph.</div>
      )}

      {selectedTeam && (
        <div className="mt-6">
          <div
            className="overflow-hidden border border-blue-100 dark:border-blue-900/50 rounded-2xl relative bg-gradient-to-br from-slate-50/50 to-blue-50/20 dark:from-dark-700/30 dark:to-blue-950/20"
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ height: 720 }}
          >
            <svg width="100%" height="100%" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid meet">
              <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
                {/* team title at top */}
                <g transform="translate(500,40)">
                  <text y="6" textAnchor="middle" fontSize="18" fill="currentColor" className="dark:fill-blue-100 fill-slate-900">{teams.find(t => t.id === selectedTeam)?.name}</text>
                </g>

                {/* Build simple tree layout based on managerId -> children */}
                {(() => {
                  const nodes = teamPeople.slice();
                  const map = new Map<string, Person>();
                  nodes.forEach(n => { if (n.id) map.set(n.id, n); });

                  // build children lists
                  const children = new Map<string, string[]>();
                  nodes.forEach(n => {
                    const mid = n.managerId;
                    if (mid && map.has(mid)) {
                      children.set(mid, [...(children.get(mid) || []), n.id!]);
                    }
                  });

                  // find roots (no manager in filtered set)
                  const roots = nodes.filter(n => !n.managerId || !map.has(n.managerId));

                  // BFS to assign levels
                  const levels: string[][] = [];
                  const visited = new Set<string>();
                  const queue: { id: string; level: number }[] = [];
                  roots.forEach(r => queue.push({ id: r.id!, level: 0 }));

                  while (queue.length) {
                    const { id, level } = queue.shift()!;
                    if (!levels[level]) levels[level] = [];
                    if (!visited.has(id)) {
                      visited.add(id);
                      levels[level].push(id);
                      const ch = children.get(id) || [];
                      ch.forEach(c => queue.push({ id: c, level: level + 1 }));
                    }
                  }

                  // compute positions per level
                  const width = 1000;
                  const nodeW = 180;
                  const nodeH = 64;
                  const vGap = 80;
                  const positions = new Map<string, { x: number; y: number }>();

                  levels.forEach((ids, lvl) => {
                    const count = ids.length || 1;
                    const spacing = width / (count + 1);
                    ids.forEach((id, i) => {
                      const x = (i + 1) * spacing;
                      const y = 100 + lvl * (nodeH + vGap);
                      positions.set(id, { x, y });
                    });
                  });

                  // render connectors (elbow: down -> across -> down)
                  const connectorElems: React.ReactNode[] = [];
                  map.forEach((n, id) => {
                    const ch = children.get(id) || [];
                    const pPos = positions.get(id);
                    if (!pPos) return;
                    ch.forEach(cid => {
                      const cPos = positions.get(cid);
                      if (!cPos) return;
                      const parentBottom = pPos.y + nodeH / 2;
                      const childTop = cPos.y - nodeH / 2;
                      const midY = parentBottom + (childTop - parentBottom) / 2;
                      // path: parentBottom -> midY (vertical), midY -> child.x (horizontal), midY -> childTop (vertical)
                      const d = `M ${pPos.x} ${parentBottom} L ${pPos.x} ${midY} L ${cPos.x} ${midY} L ${cPos.x} ${childTop}`;
                      connectorElems.push(
                        <path key={`${id}-${cid}`} d={d} stroke="currentColor" strokeWidth={1.25} fill="none" className="stroke-slate-900 dark:stroke-slate-400" />
                      );
                    });
                  });

                  // render nodes
                  const nodeElems = nodes.map(n => {
                    const pos = positions.get(n.id!);
                    if (!pos) return null;
                    const hovered = hoveredId === n.id;
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${pos.x},${pos.y}) scale(${hovered ? 1.05 : 1})`}
                        className="cursor-pointer transition-all duration-200"
                        onClick={() => router.push(`/simulator/person/${n.id}`)}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/simulator/person/${n.id}`); }}
                        onMouseEnter={() => setHoveredId(n.id!)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        {/* Background gradient for shine effect */}
                        <defs>
                          <linearGradient id={`shine-${n.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#dbeafe" stopOpacity={hovered ? 0.6 : 0} />
                            <stop offset="50%" stopColor="#bfdbfe" stopOpacity={hovered ? 0.8 : 0} />
                            <stop offset="100%" stopColor="#dbeafe" stopOpacity={hovered ? 0.6 : 0} />
                          </linearGradient>
                        </defs>

                        {/* Main rectangle */}
                        <rect
                          x={-nodeW / 2}
                          y={-nodeH / 2}
                          width={nodeW}
                          height={nodeH}
                          rx={12}
                          fill="currentColor"
                          stroke={hovered ? "#3b82f6" : "currentColor"}
                          strokeWidth={hovered ? 2.5 : 1.5}
                          className="transition-all duration-200 fill-white dark:fill-dark-800 stroke-slate-300 dark:stroke-slate-600"
                        />

                        {/* Shine overlay */}
                        {hovered && (
                          <rect
                            x={-nodeW / 2}
                            y={-nodeH / 2}
                            width={nodeW}
                            height={nodeH}
                            rx={12}
                            fill={`url(#shine-${n.id})`}
                            className="animate-shine"
                          />
                        )}

                        <text y={-8} textAnchor="middle" fontSize={14} fontWeight={600} fill={hovered ? "#1e40af" : "currentColor"} className="dark:fill-blue-100 fill-slate-900">{n.name}</text>
                        <text y={12} textAnchor="middle" fontSize={12} fill={hovered ? "#3b82f6" : "currentColor"} className="dark:fill-slate-400 fill-slate-600">{n.role}</text>
                      </g>
                    );
                  });

                  return (
                    <g>
                      {connectorElems}
                      {nodeElems}
                    </g>
                  );
                })()}
              </g>
            </svg>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400 font-light mt-6 text-center">Click a person node (or press Enter) to open their lanyard + handoff view. Use mouse-wheel or the buttons to zoom; drag to pan.</div>
        </div>
      )}
    </div>
  );
}
