import TeamGraph from "@/components/simulator/team-graph";
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'] });

export default function TeamsPage() {
  // reuse the same mock data as the continuity simulator for now
  const departments = [
    { id: "1", name: "Engineering" },
    { id: "2", name: "Finance" },
    { id: "3", name: "Operations" },
  ];

  const teams = [
    { id: "1", name: "Backend Team", departmentId: "1" },
    { id: "2", name: "Frontend Team", departmentId: "1" },
    { id: "3", name: "Payroll Team", departmentId: "2" },
    { id: "4", name: "Accounting Team", departmentId: "2" },
    { id: "5", name: "Platform Team", departmentId: "3" },
  ];

  // Use manager relationships and roles so the graph lays out by who manages who.
  const people = [
    // Backend Team (1) - management chain example
    { id: "jane", name: "Jane", teamId: "1", managerId: null, role: "Senior Manager" },
    { id: "tim", name: "Tim", teamId: "1", managerId: "jane", role: "Staff Engineer" },
    { id: "blake", name: "Blake", teamId: "1", managerId: "jane", role: "Engineering Manager" },
    { id: "lily", name: "Lily", teamId: "1", managerId: "blake", role: "Software Engineer" },
    { id: "james", name: "James", teamId: "1", managerId: "blake", role: "Software Engineer" },

    // Frontend Team members (2) - kept simple
    { id: "tom", name: "Tom", teamId: "2", managerId: null, role: "Lead" },
    { id: "uma", name: "Uma", teamId: "2", managerId: "tom", role: "Engineer" },

    // Payroll Team (3)
    { id: "megan", name: "Megan", teamId: "3", managerId: null, role: "Payroll Lead" },
    { id: "jason", name: "Jason", teamId: "3", managerId: "megan", role: "Payroll Specialist" },

    // Accounting (4)
    { id: "sarah", name: "Sarah", teamId: "4", managerId: null, role: "Accounting Manager" },

    // Platform (5)
    { id: "david", name: "David", teamId: "5", managerId: null, role: "Platform Lead" },
  ];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <div className="max-w-6xl mx-auto">
        <h1 className={`${playfair.className} text-center text-4xl font-semibold mb-4 text-slate-900 dark:text-blue-100`}>Team Hierarchy</h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">Select a department and team, then click a person node to open their detail page.</p>
        <TeamGraph departments={departments} teams={teams} people={people} />
      </div>
    </div>
  );
}
