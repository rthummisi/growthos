import inquirer from "inquirer";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

export async function approveCommand() {
  const response = await fetch(`${API_BASE}/suggestions?status=pending`);
  const payload = (await response.json()) as { suggestions: { id: string; title: string }[] };
  const choices = payload.suggestions.map((suggestion) => ({
    name: suggestion.title,
    value: suggestion.id
  }));

  if (choices.length === 0) {
    console.log("No pending suggestions.");
    return;
  }

  const answer = await inquirer.prompt<{ suggestionId: string; decision: string }>([
    { type: "list", name: "suggestionId", message: "Select suggestion", choices },
    {
      type: "list",
      name: "decision",
      message: "Decision",
      choices: ["approved", "rejected", "deferred"]
    }
  ]);

  await fetch(`${API_BASE}/approvals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answer)
  });
  console.log("Decision saved.");
}
