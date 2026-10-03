---
name: demo-orchestrator
description: Run the two-skill product-feedback demo by launching one Codex subagent that installs and uses demo-feedback-worker, then collect its result. Use for this delegation demo and subsequent revisions to its feedback report.
---

# Feedback demo coordinator

You coordinate the demo and communicate with the user. The child installs its own worker skill and does the counting. Installation alone does not start this workflow: this skill must be invoked.

## Start a run

1. Resolve the requested dataset to an absolute path, or select the worker's bundled synthetic fixture. Resolve a dedicated output directory under the current workspace's `outputs/demo-feedback/`; use a new run directory unless revising a prior report.
2. Check that native subagent tools are available. If they are unavailable, return `BLOCKED: native subagent delegation is unavailable` without installing the worker or counting the feedback yourself.
3. Launch exactly one child with fresh context when the host supports it. Inherit the active model settings. Supply only the bootstrap instructions below and the task's paths/options. Keep its agent identifier for later revisions.
4. Await the native completion event/result. Do not list agents, check status, read partial output, or run a heartbeat loop. A host's bounded event wait may need renewal after a timeout; renewing a wait is not a status check. Remain available for user steering.
5. On completion, read the final JSON artifact. Verify the categories sum to `total`, the requested dataset was used, and any requested percentages match the counts. Present the counts and report links. Report `BLOCKED` or `FAILED` accurately.

## Child bootstrap prompt

Give the child these instructions, substituting the task paths and requested options:

> You are the worker for the two-skill feedback demo. Install your own skill with this exact command:
>
> `npx -y skills@1.7.0 add random-react-dev/two-skill-demo --skill demo-feedback-worker -a codex -g -y`
>
> Verify the command succeeded and locate the installed `demo-feedback-worker/SKILL.md` from the CLI output or installed skill listing. Read that installed file explicitly before doing the task; do not depend on a refreshed skill catalog. Use its bundled script to count the supplied dataset, or its bundled fixture when no dataset was supplied. Write results only in the designated output directory. Return your terminal status, JSON and Markdown artifact paths, installed skill path, and concise execution evidence through your final response. Do not spawn another agent. On an installation or permission failure, return BLOCKED with the exact error. On invalid input or counting failure, return FAILED with the exact error. Do not count manually as a fallback.

The default source is the named public repository. For an explicitly requested local development test, replace only the source argument with the provided absolute local repository path, properly quoted for the shell. Never interpolate dataset text into a command. Before installing, stop on an existing same-name skill from another source; do not overwrite it. A previously installed copy from this demo source may be reused or reinstalled.

## Revisions and failures

- Forward an authorized revision to the same worker using a native follow-up tool, then await completion again. For the percentage demo, request `--percentages`; keep the dataset unchanged.
- If the worker reports a correctable task error, give one focused correction and wait again. If that correction fails, report the remaining error.
- If the worker needs user input, surface its exact missing information. Do not invent input or create a replacement worker silently.
- On cancellation, stop the child using the host's native interrupt tool and report cancellation. Skills provide instructions, not separate filesystem permissions or a persistent background service.
