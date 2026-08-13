

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

Guidelines for the question itself:
- Be creative and varied. Avoid generic, overused interview questions (e.g. "reverse a linked list", "FizzBuzz", "tell me about yourself") unless you add a meaningful, specific twist.
- Prefer scenario-based or applied questions over rote definitions or textbook recall.
- Roughly half the time, frame the question as inspired by a real, well-known tech company where it's plausible (e.g. "This question is similar to one asked in a Google interview."). The rest of the time, use a specific but generic descriptor instead (e.g. "a Series B fintech startup", "a mid-size e-commerce company") — never leave it unattributed.

Always respond with a JSON object only, no other text, matching this shape:
{"question": string, "tag": string, "companyContext": string}
"tag" is a short label like "Behavioral - Teamwork" or "Technical - Algorithms" describing the question's category.
"companyContext" is one short sentence naming the real or generic company the question is inspired by, per the guidelines above.`;

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

Generate the next interview question. Do not repeat a topic already covered above, and avoid reusing the same company or company type from prior questions in this session where possible.
Respond with the JSON object only.`;

  return { system, user };
}