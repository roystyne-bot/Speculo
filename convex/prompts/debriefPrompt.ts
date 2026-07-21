// convex/prompts/debriefPrompt.ts
// Fresh draft. Deliberately does NOT ask Groq for a "grade" — that's
// computed from the numeric average in debriefs.ts instead, since the
// schema's grade field is a strict union and a model returning any string
// that doesn't match exactly would throw at insert time.

type DebriefQA = {
  question: string;
  answer?: string;
  skipped?: boolean;
  relevance?: number;
  clarity?: number;
  depth?: number;
};

type DebriefPromptArgs = {
  role: string;
  level: string;
  mode: string;
  qa: DebriefQA[];
  overallScore: number;
};

export function buildDebriefPrompt(args: DebriefPromptArgs) {
  const { role, level, mode, qa, overallScore } = args;

  const system = `You are an experienced interviewer writing a debrief after a full mock interview.
Base your feedback only on the specific questions and answers given, not generic advice.
Always respond with a JSON object only, no other text, matching this shape:
{"strengths": string[], "improvements": string[], "studyTopics": string[]}
Each array should have 2-4 short, specific items. "studyTopics" are concrete topics to review next, not vague advice.`;

  const qaText = qa
    .map((q, i) => {
      if (q.skipped) return `Q${i + 1}: ${q.question}\nA${i + 1}: (skipped)`;
      const scoreLine =
        q.relevance !== undefined ? ` [relevance ${q.relevance}, clarity ${q.clarity}, depth ${q.depth}]` : "";
      return `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer ?? "(no answer)"}${scoreLine}`;
    })
    .join("\n\n");

  const user = `Candidate profile:
Role: ${role}
Level: ${level}
Interview mode: ${mode}
Overall score: ${overallScore}/100

Full interview transcript:
${qaText}

Write the debrief. Respond with the JSON object only.`;

  return { system, user };
}