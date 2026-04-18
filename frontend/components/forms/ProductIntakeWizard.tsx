"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@frontend/components/ui/Button";
import { Card } from "@frontend/components/ui/Card";
import { Input } from "@frontend/components/ui/Input";
import { Textarea } from "@frontend/components/ui/Textarea";
import { apiPost } from "@frontend/lib/api";

export function ProductIntakeWizard() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const product = await apiPost<{ id: string }>("/products", {
        url,
        githubUrl: githubUrl || undefined,
        description,
        brandVoice: {
          tone: "technical but approachable",
          style: "clear and direct",
          vocabulary: {
            include: ["developers", "workflow", "ship"],
            avoid: ["synergy", "revolutionary"]
          },
          preset: "Technical OSS"
        }
      });
      const run = await apiPost<{ runId: string }>("/run", { productId: product.id });
      router.push(`/opportunities?runId=${run.runId}&productId=${product.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Product Intake</h1>
        <p className="text-sm text-zinc-400">Capture the product URL, source repository, and launch description.</p>
      </div>
      <Input placeholder="https://your-product.com" value={url} onChange={(event) => setUrl(event.target.value)} />
      <Input placeholder="https://github.com/org/repo" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} />
      <Textarea
        rows={6}
        maxLength={500}
        placeholder="Describe the product, its ICP, and why developers share it."
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex justify-end">
        <Button disabled={!url || !description || submitting} onClick={() => void submit()}>
          {submitting ? "Launching..." : "Analyze Product"}
        </Button>
      </div>
    </Card>
  );
}
