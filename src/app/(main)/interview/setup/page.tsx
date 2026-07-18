"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Check } from "lucide-react";

type Role = "fullstack" | "frontend" | "backend" | "devops" | "mobile" | "data" | "systems" | "cloud";
type Level = "junior" | "mid" | "senior";
type Mode = "behavioral" | "technical" | "mixed";

type FormData = {
  role: Role | "";
  level: Level | "";
  mode: Mode | "";
  focusAreas: string[];
};

const STEPS = ["Role", "Type", "Focus", "Review"];

const ROLE_OPTIONS: { id: Role; label: string }[] = [
  { id: "fullstack", label: "Full-Stack" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "devops", label: "DevOps" },
  { id: "mobile", label: "Mobile" },
  { id: "data", label: "Data" },
  { id: "systems", label: "Systems" },
  { id: "cloud", label: "Cloud" },
];

const LEVEL_OPTIONS: { id: Level; label: string }[] = [
  { id: "junior", label: "Junior" },
  { id: "mid", label: "Mid" },
  { id: "senior", label: "Senior" },
];

const MODE_OPTIONS: { id: Mode; label: string; desc: string }[] = [
  { id: "behavioral", label: "Behavioral", desc: "Past experience, teamwork, decisions" },
  { id: "technical", label: "Technical", desc: "Coding and problem solving" },
  { id: "mixed", label: "Mixed", desc: "A blend of behavioral and technical" },
];

// Not part of the sessions schema — these are passed to the first
// AI-generated question as extra context, not persisted on the row.
// If you'd rather store them, add focusAreas: v.optional(v.array(v.string()))
// to the sessions table and pass formData.focusAreas into the mutation below.
const FOCUS_OPTIONS: Record<Mode, string[]> = {
  behavioral: ["Leadership", "Conflict resolution", "Ownership", "Communication", "Feedback"],
  technical: ["React", "Node.js", "SQL", "Algorithms", "Debugging"],
  mixed: ["Communication", "System design", "Algorithms", "Ownership"],
};

const initialFormData: FormData = {
  role: "",
  level: "",
  mode: "",
  focusAreas: [],
};

export default function SetupPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const createSession = useMutation(api.sessions.createSession);

  const canProceed = (): boolean => {
    if (step === 0) return formData.role.length > 0 && formData.level.length > 0;
    if (step === 1) return formData.mode.length > 0;
    return true; // focus is optional, review has nothing to validate
  };

  const hint = (): string | null => {
    if (step === 0 && formData.role.length === 0) return "Pick a role to continue.";
    if (step === 0 && formData.level.length === 0) return "Pick a level to continue.";
    if (step === 1 && formData.mode.length === 0) return "Pick an interview type to continue.";
    return null;
  };

  const goNext = () => {
    if (!canProceed()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // Only completed steps are jumpable to — never skip ahead of validation.
  const jumpTo = (index: number) => {
    if (index < step) setStep(index);
  };

  // Switching mode invalidates previously picked focus tags, since the
  // tag set is keyed by mode and old selections may no longer be valid options.
  const setMode = (mode: Mode) => {
    setFormData((prev) => ({ ...prev, mode, focusAreas: [] }));
  };

  const toggleFocus = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(option)
        ? prev.focusAreas.filter((f) => f !== option)
        : [...prev.focusAreas, option],
    }));
  };

  const handleStart = async () => {
    if (!formData.role || !formData.level || !formData.mode || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const sessionId = await createSession({
        role: formData.role,
        level: formData.level,
        mode: formData.mode,
        focusAreas: formData.focusAreas,
      });
      router.push(`/interview/session/${sessionId}`);
    } catch (err) {
      console.error("Failed to create session:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Set up your interview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer a few questions so we can tailor the session.
        </p>

        <Stepper currentStep={step} onStepClick={jumpTo} />

        <div className="mt-8 rounded-xl border border-gray-700 bg-onyx-light p-6">
          {step === 0 && <RoleStep formData={formData} setFormData={setFormData} />}
          {step === 1 && <TypeStep formData={formData} setMode={setMode} />}
          {step === 2 && <FocusStep formData={formData} toggleFocus={toggleFocus} />}
          {step === 3 && <ReviewStep formData={formData} />}
        </div>

        {hint() && <p className="mt-3 text-xs text-gray-500">{hint()}</p>}

        <div className="mt-6 flex justify-between">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-gray-400 rounded-lg hover:text-white transition-colors duration-150 disabled:opacity-0 disabled:pointer-events-none"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="px-5 py-2 bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isSubmitting}
              className="px-5 py-2 bg-spring text-spring-deep text-sm font-semibold rounded-lg hover:bg-spring-pale transition-colors duration-150 disabled:opacity-60"
            >
              {isSubmitting ? "Starting..." : "Start interview"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="mt-8 flex items-center">
      {STEPS.map((label, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => onStepClick(index)}
                disabled={index >= currentStep}
                className={
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-150 " +
                  (isComplete
                    ? "bg-spring text-spring-deep"
                    : isCurrent
                    ? "border-2 border-spring text-spring"
                    : "border-2 border-gray-700 text-gray-500")
                }
              >
                {isComplete ? <Check size={14} /> : index + 1}
              </button>
              <span className={"text-xs " + (isCurrent ? "text-white" : "text-gray-500")}>
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={"h-px flex-1 mx-2 " + (isComplete ? "bg-spring" : "bg-gray-700")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoleStep({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-gray-400">Role</label>
        <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role.id}
              onClick={() => setFormData((prev) => ({ ...prev, role: role.id }))}
              className={
                "px-3 py-2 rounded-lg text-sm transition-colors duration-150 " +
                (formData.role === role.id
                  ? "bg-spring text-spring-deep"
                  : "border border-gray-700 text-gray-400 hover:text-white")
              }
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400">Level</label>
        <div className="mt-1.5 flex gap-2">
          {LEVEL_OPTIONS.map((level) => (
            <button
              key={level.id}
              onClick={() => setFormData((prev) => ({ ...prev, level: level.id }))}
              className={
                "px-4 py-2 rounded-lg text-sm transition-colors duration-150 " +
                (formData.level === level.id
                  ? "bg-spring text-spring-deep"
                  : "border border-gray-700 text-gray-400 hover:text-white")
              }
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypeStep({
  formData,
  setMode,
}: {
  formData: FormData;
  setMode: (mode: Mode) => void;
}) {
  return (
    <div className="space-y-3">
      {MODE_OPTIONS.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setMode(mode.id)}
          className={
            "w-full text-left px-4 py-3 rounded-lg border transition-colors duration-150 " +
            (formData.mode === mode.id
              ? "border-spring bg-spring/10"
              : "border-gray-700 hover:border-gray-600")
          }
        >
          <p className="text-sm font-medium text-white">{mode.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
        </button>
      ))}
    </div>
  );
}

function FocusStep({
  formData,
  toggleFocus,
}: {
  formData: FormData;
  toggleFocus: (option: string) => void;
}) {
  const options = formData.mode ? FOCUS_OPTIONS[formData.mode] : [];

  if (options.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Go back and pick an interview type to see relevant focus areas.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">
        Optional: pick any areas you want emphasized.
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = formData.focusAreas.includes(option);
          return (
            <button
              key={option}
              onClick={() => toggleFocus(option)}
              className={
                "px-3 py-1.5 rounded-full text-xs transition-colors duration-150 " +
                (selected
                  ? "bg-spring text-spring-deep"
                  : "border border-gray-700 text-gray-400 hover:text-white")
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: FormData }) {
  const roleLabel = ROLE_OPTIONS.find((r) => r.id === formData.role)?.label ?? "";
  const levelLabel = LEVEL_OPTIONS.find((l) => l.id === formData.level)?.label ?? "";
  const modeLabel = MODE_OPTIONS.find((m) => m.id === formData.mode)?.label ?? "";

  const rows = [
    { label: "Role", value: roleLabel },
    { label: "Level", value: levelLabel },
    { label: "Type", value: modeLabel },
    {
      label: "Focus areas",
      value: formData.focusAreas.length > 0 ? formData.focusAreas.join(", ") : "None selected",
    },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between text-sm">
          <span className="text-gray-500">{row.label}</span>
          <span className="text-white">{row.value}</span>
        </div>
      ))}
    </div>
  );
}