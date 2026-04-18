import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function parseRepo(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.replace(/^\//, "").split("/");
    if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
  } catch {}
  return null;
}

export async function createRepo(name: string, description: string, isPrivate: boolean) {
  if (!process.env.GITHUB_TOKEN) {
    return { repoUrl: `https://github.com/local/${name}` };
  }
  const response = await octokit.request("POST /user/repos", {
    name,
    description,
    private: isPrivate,
    auto_init: true
  });
  return { repoUrl: response.data.html_url };
}

export async function commitFiles(repoUrl: string, files: { path: string; content: string }[]) {
  const parsed = parseRepo(repoUrl);
  if (!parsed || !process.env.GITHUB_TOKEN) {
    return { repoUrl, files, sha: `local-${Date.now()}` };
  }

  const { owner, repo } = parsed;

  const refData = await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner, repo, ref: "heads/main"
  });
  const baseSha = refData.data.object.sha;

  const baseTreeData = await octokit.request("GET /repos/{owner}/{repo}/git/commits/{commit_sha}", {
    owner, repo, commit_sha: baseSha
  });
  const baseTreeSha = baseTreeData.data.tree.sha;

  const blobs = await Promise.all(
    files.map((file) =>
      octokit.request("POST /repos/{owner}/{repo}/git/blobs", {
        owner, repo,
        content: Buffer.from(file.content).toString("base64"),
        encoding: "base64"
      }).then((res) => ({ path: file.path, sha: res.data.sha }))
    )
  );

  const treeData = await octokit.request("POST /repos/{owner}/{repo}/git/trees", {
    owner, repo,
    base_tree: baseTreeSha,
    tree: blobs.map((blob) => ({
      path: blob.path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: blob.sha
    }))
  });

  const commitData = await octokit.request("POST /repos/{owner}/{repo}/git/commits", {
    owner, repo,
    message: "chore: add GrowthOS generated files",
    tree: treeData.data.sha,
    parents: [baseSha]
  });

  await octokit.request("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
    owner, repo,
    ref: "heads/main",
    sha: commitData.data.sha
  });

  return { repoUrl, sha: commitData.data.sha };
}

export async function fetchTraffic(repoUrl: string) {
  const parsed = parseRepo(repoUrl);
  if (!parsed || !process.env.GITHUB_TOKEN) {
    return { repoUrl, views: 0, clones: 0, stars: 0, forks: 0 };
  }

  const { owner, repo } = parsed;

  const [repoData, viewsData, clonesData] = await Promise.all([
    octokit.request("GET /repos/{owner}/{repo}", { owner, repo }),
    octokit.request("GET /repos/{owner}/{repo}/traffic/views", { owner, repo }).catch(() => ({ data: { count: 0 } })),
    octokit.request("GET /repos/{owner}/{repo}/traffic/clones", { owner, repo }).catch(() => ({ data: { count: 0 } }))
  ]);

  return {
    repoUrl,
    stars: repoData.data.stargazers_count,
    forks: repoData.data.forks_count,
    views: (viewsData.data as { count?: number }).count ?? 0,
    clones: (clonesData.data as { count?: number }).count ?? 0
  };
}

export async function searchIssues(query: string) {
  if (!process.env.GITHUB_TOKEN) {
    return [{ id: "local", title: query, url: "https://github.com/search?q=" + encodeURIComponent(query) }];
  }

  const response = await octokit.request("GET /search/issues", {
    q: `${query} is:issue is:open`,
    per_page: 10,
    sort: "reactions"
  });

  return response.data.items.map((item) => ({
    id: String(item.id),
    title: item.title,
    url: item.html_url,
    repoUrl: item.repository_url,
    comments: item.comments,
    reactions: (item.reactions as { total_count?: number } | undefined)?.total_count ?? 0
  }));
}

export async function createPR(repoUrl: string, title: string, body: string, branch: string) {
  const parsed = parseRepo(repoUrl);
  if (!parsed || !process.env.GITHUB_TOKEN) {
    return { url: `${repoUrl}/pull/1` };
  }

  const { owner, repo } = parsed;

  const defaultBranchData = await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
  const defaultBranch = defaultBranchData.data.default_branch;

  const refData = await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner, repo, ref: `heads/${defaultBranch}`
  });

  await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner, repo,
    ref: `refs/heads/${branch}`,
    sha: refData.data.object.sha
  }).catch(() => undefined);

  const response = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner, repo,
    title,
    body,
    head: branch,
    base: defaultBranch
  });

  return { url: response.data.html_url };
}
