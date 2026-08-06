export async function sendSupportEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Speculo Support <@onboarding@resend.dev>",
      to: "you@roycoldy@gmail.com",
      reply_to: params.email,
      subject: `[Speculo Contact] ${params.subject}`,
      text: `From: ${params.name} (${params.email})\n\n${params.message}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend failed: ${await res.text()}`);
  }
}