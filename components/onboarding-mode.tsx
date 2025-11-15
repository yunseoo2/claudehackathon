"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, FileText, User, AlertTriangle, CheckCircle2, BookOpen, Briefcase, UserCircle, ArrowRight, ChevronRight } from "lucide-react";

interface Team {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  team: string;
}

interface Contact {
  id: number;
  person_id: number;
  person_name: string;
  person_role: string | null;
  contact_reason: string | null;
  priority: number;
}

interface Document {
  id: number;
  title: string;
  summary?: string;
}

interface PersonalizedOnboarding {
  team: string;
  role?: string;
  plan: string;
  relevant_docs: Array<{ id: number; title: string }>;
  key_contacts: Contact[];
}

type OnboardingStep = "team" | "role" | "plan";

export function OnboardingMode() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("team");
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [plan, setPlan] = useState<PersonalizedOnboarding | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("http://localhost:8001/api/teams");
        if (!res.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await res.json();
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load teams");
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // Fetch roles when a team is selected
  useEffect(() => {
    if (!selectedTeam) return;

    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await fetch(`http://localhost:8001/api/teams/${encodeURIComponent(selectedTeam.name)}/roles`);
        if (!res.ok) {
          throw new Error("Failed to fetch roles");
        }
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roles");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [selectedTeam]);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setSelectedRole(null); // Reset role selection when team changes
    setCurrentStep("role");
    setPlan(null); // Reset plan when team changes
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleGeneratePlan = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("http://localhost:8001/api/onboarding/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team: selectedTeam.name,
          role: selectedRole?.name,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate onboarding plan");
      }

      const data = await res.json();
      setPlan(data);
      setCurrentStep("plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Progress Steps */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-accent/30 rounded-xl border border-border/60 px-6 py-4 w-full max-w-2xl mb-6">
          <p className="text-center text-muted-foreground text-sm">
            Welcome to your personalized onboarding journey! Follow these steps to get a customized onboarding plan tailored to your team and role.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'team' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}
          >
            <Briefcase className="w-5 h-5" />
          </div>
          <span className={`text-sm ${currentStep === 'team' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Select Team</span>
          
          <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
          
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'role' ? 'bg-primary text-primary-foreground' : currentStep === 'plan' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            <UserCircle className="w-5 h-5" />
          </div>
          <span className={`text-sm ${currentStep === 'role' ? 'text-foreground font-medium' : currentStep === 'plan' ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>Choose Role</span>
          
          <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
          
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'plan' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className={`text-sm ${currentStep === 'plan' ? 'text-foreground font-medium' : 'text-muted-foreground/60'}`}>Get Your Plan</span>
        </div>
      </div>

      {/* Team Selection */}
      {currentStep === "team" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-10"
        >
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="heading text-2xl text-foreground">
                  Select Your Team
                </h2>
                <p className="text-[15px] text-muted-foreground font-light leading-relaxed">
                  Choose the team you're joining to get a personalized onboarding experience
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {loadingTeams ? (
              <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-xl border border-border/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <span className="text-muted-foreground">Loading teams...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team)}
                      className={`p-6 rounded-xl border transition-all text-left ${
                        selectedTeam?.id === team.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/30 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedTeam?.id === team.id ? "bg-primary/20" : "bg-accent/30"}`}>
                          <Users
                            className={`w-6 h-6 ${
                              selectedTeam?.id === team.id ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <span
                            className={`block font-medium text-[16px] ${
                              selectedTeam?.id === team.id ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {team.name}
                          </span>
                          {team.description && (
                            <span className="block text-sm text-muted-foreground mt-1">
                              {team.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Role Selection */}
      {currentStep === "role" && selectedTeam && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-10"
        >
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="heading text-2xl text-foreground">
                    Select Your Role
                  </h2>
                  <p className="text-[15px] text-muted-foreground font-light leading-relaxed">
                    Choose your role in the <span className="text-primary font-medium">{selectedTeam.name}</span> to get role-specific documentation
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentStep("team")} 
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 h-fit"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Back to Teams
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {loadingRoles ? (
              <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-xl border border-border/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <span className="text-muted-foreground">Loading roles...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {roles.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        className={`p-6 rounded-xl border transition-all text-left ${
                          selectedRole?.id === role.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card hover:border-primary/30 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole?.id === role.id ? "bg-primary/20" : "bg-accent/30"}`}>
                            <UserCircle
                              className={`w-6 h-6 ${
                                selectedRole?.id === role.id ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <span
                              className={`block font-medium text-[16px] ${
                                selectedRole?.id === role.id ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {role.name}
                            </span>
                            {role.description && (
                              <span className="block text-sm text-muted-foreground mt-1">
                                {role.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-border/50">
                    <UserCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No roles found for this team.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">You can still generate a general onboarding plan.</p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleGeneratePlan}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px] shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Your Personalized Plan...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Generate {selectedRole ? `${selectedRole.name}` : ""} Onboarding Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-6 flex items-start gap-4"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="heading text-[16px] text-rose-900">Error</h3>
            <p className="text-[14px] text-rose-700 font-light">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Personalized Onboarding Plan */}
      {currentStep === "plan" && plan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="heading text-2xl text-foreground">
                  Your Personalized Onboarding Plan
                </h2>
                <p className="text-[15px] text-muted-foreground font-light leading-relaxed">
                  Customized for <span className="text-primary font-medium">{plan.team}</span> {plan.role ? <span>as a <span className="text-primary font-medium">{plan.role}</span></span> : ""}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setCurrentStep("role")} 
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 h-fit"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              Back to Role Selection
            </button>
          </div>

          {/* Success Message */}
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-6 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="heading text-[18px] text-emerald-900">Your Onboarding Plan is Ready!</h4>
              <p className="text-[15px] text-emerald-700 font-light leading-relaxed">
                We've created a personalized onboarding plan to help you get up to speed quickly. Follow the plan below and reach out to the key contacts for guidance.
              </p>
            </div>
          </div>

          {/* Main Plan */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="heading text-2xl text-foreground">
                  Onboarding Plan
                </h3>
                <p className="text-[15px] text-muted-foreground font-light">
                  Follow this step-by-step guide to get started in your new role
                </p>
              </div>
            </div>
            <div className="prose prose-slate max-w-none">
              <div className="text-[16px] text-foreground/90 leading-relaxed font-light whitespace-pre-wrap">
                {plan.plan}
              </div>
            </div>
          </div>

          {/* Documents to Read */}
          {plan.relevant_docs && plan.relevant_docs.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="heading text-xl text-foreground">
                    Essential Documents
                  </h3>
                  <p className="text-[15px] text-muted-foreground font-light">
                    Prioritized reading list to help you get started
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.relevant_docs.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-blue-50/30 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-[16px] font-medium flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-[16px] text-foreground">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-blue-100/50 text-blue-700 text-xs rounded-full">Doc #{doc.id}</span>
                          <span className="px-2 py-0.5 bg-accent/30 text-muted-foreground text-xs rounded-full">{plan.team}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Contacts */}
          {plan.key_contacts && plan.key_contacts.length > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-10">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="heading text-xl text-foreground">
                    Key People to Contact
                  </h3>
                  <p className="text-[15px] text-muted-foreground font-light">
                    Reach out to these team members for guidance and support
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plan.key_contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-5 bg-purple-50/30 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-[16px] text-foreground">{contact.person_name}</p>
                        {contact.person_role && (
                          <p className="text-[14px] text-muted-foreground">{contact.person_role}</p>
                        )}
                        {contact.contact_reason && (
                          <p className="text-[13px] text-purple-700 font-light mt-2 bg-purple-50 px-3 py-1 rounded-lg inline-block">{contact.contact_reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="flex justify-center pt-4">
            <button className="bg-primary/10 hover:bg-primary/20 text-primary font-medium py-3 px-6 rounded-xl transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Onboarding Plan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
