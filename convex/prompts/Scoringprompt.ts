// convex/prompts/scoringPrompt.ts
// Fresh draft — replace with your own tested prompt if you already had
// one, this is just a reasonable starting point for the shape.

type ScoringPromptArgs = {
  role: string;
  level: string;
  question: string;
  answer: string;
};

export function buildScoringPrompt(args: ScoringPromptArgs) {
  const { role, level, question, answer } = args;

  const system = `You are an experienced interviewer scoring a candidate's answer to a single interview question.
Score fairly for the candidate's stated level — a junior candidate should not be penalized for lacking senior-level depth.
Always respond with a JSON object only, no other text, matching this shape:
{"relevance": number, "clarity": number, "depth": number, "feedback": string}
Each score is an integer from 0 to 10. "feedback" is 1-3 sentences of specific, constructive feedback.`;

  const user = `Candidate role: ${role}
Candidate level: ${level}

Question: ${question}

Candidate's answer: ${answer || "(no answer provided — candidate skipped this question)"}

Score this answer and respond with the JSON object only.`;

  return { system, user };
}