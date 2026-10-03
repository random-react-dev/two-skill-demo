# Two-skill feedback demo

A Codex coordinator launches one child. The child installs its own counting skill, reads its installed instructions, counts a synthetic feedback dataset, and returns a completion result. The coordinator awaits completion without status polling.

## Install only the coordinator

Requires Node 22.20+ and a Codex session with native subagent tools.

```sh
npx -y skills@1.7.0 add random-react-dev/two-skill-demo --skill demo-orchestrator -a codex -g -y
```

Then ask Codex:

```text
Use $demo-orchestrator to run the bundled product-feedback demo.
```

Installation adds files; it does not launch the workflow. The launched child runs:

```sh
npx -y skills@1.7.0 add https://github.com/random-react-dev/two-skill-demo/tree/7fde0ea8f9ef2307108807284e8a9163a1d9603e/skills/demo-feedback-worker --skill demo-feedback-worker -a codex -g -y
```

The coordinator pins the worker to a reviewed commit and supplies expected SHA-256 values for its instructions, script, and fixture. The child verifies all three before reading or executing the worker. A mismatch returns `BLOCKED`.

The first `-y` accepts the npx package prompt. The last `-y` accepts the skills CLI prompts. These flags do not change Codex permissions. Global installation targets the user's skills directories, not a separate child-only filesystem.

## Expected results

The fixture has 20 labeled feedback records: 8 bugs, 6 feature requests, 4 praise, and 2 other. Labels are supplied; the worker does not classify prose. Reports include input path, SHA-256, installed skill path, and exact counts.

After completion, ask:

```text
Add category percentages to this report using the same worker and dataset.
```

Expected percentages: 40%, 30%, 20%, and 10%. The worker's final response delivers its completion event; no Slack, email, scheduler, heartbeat, or external messaging is involved. This is background work inside the active session, not a persistent service after Codex exits.

## Local development

```sh
npm test
npx -y skills@1.7.0 add . --skill demo-orchestrator -a codex -y
```

Invoke the local coordinator and explicitly provide this repository's absolute path as the development install source for the child. Keep a dedicated output directory for each run. Do not overwrite an unrelated same-name skill.

The counting script has no npm dependencies. Standalone execution for testing:

```sh
node skills/demo-feedback-worker/scripts/count-feedback.mjs --input skills/demo-feedback-worker/assets/feedback.json --output outputs/manual-test --percentages
```

## Failure behavior and audits

Unavailable delegation or installation access returns `BLOCKED`. Invalid data returns `FAILED` before reports are created. Native child context is separate; filesystem access is shared. The coordinator does not perform the child's count as a fallback.

Skill validation and actual delegation tests are separate from public security audits. See both skill pages on skills.sh for their current provider results. An absent, pending, stale, or warned result is not a pass. This repository does not promise third-party scanner outcomes.

Authoritative references: [Codex skills](https://learn.chatgpt.com/docs/build-skills), [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [skills CLI](https://github.com/vercel-labs/skills), [skills.sh audit API](https://www.skills.sh/docs/api).

MIT licensed. All bundled feedback is fictional.
