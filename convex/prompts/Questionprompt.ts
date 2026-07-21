// convex/prompts/questionPrompt.ts
// Fresh draft — replace with your own tested prompt if you already had
// one, this is just a reasonable starting point for the shape.

type PriorQA = { question: string; answer: string };

type QuestionPromptArgs = {
  role: string;
  level: string;
  mode: string;
  focusAreas?: string[];
  questionNumber: number;
  totalQuestions: number;
  history: PriorQA[];
};

export function buildQuestionPrompt(args: QuestionPromptArgs) {
  const { role, level, mode, focusAreas, questionNumber, totalQuestions, history } = args;

  const system = `You are an experienced technical interviewer conducting a mock interview.
You ask one question at a time, tailored to the candidate's role, level, and interview mode.
Always respond with a JSON object only, no other text, matching this shape:
{"question": string, "tag": string}
"tag" is a short label like "Behavioral - Teamwork" or "Technical - Algorithms" describing the question's category.`;

  const historyText =
    history.length > 0
      ? history
          .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
          .join("\n\n")
      : "No questions asked yet — this is the first question.";

  const focusText =
    focusAreas && focusAreas.length > 0
      ? `The candidate wants these areas emphasized: ${focusAreas.join(", ")}.`
      : "";

  const user = `Candidate profile:
Role: ${role}
Level: ${level}
Interview mode: ${mode}
${focusText}

This is question ${questionNumber} of ${totalQuestions}.

Interview so far:
${historyText}

Generate the next interview question. Do not repeat a topic already covered above.
Respond with the JSON object only.`;

  return { system, user };
}