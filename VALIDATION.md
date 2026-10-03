# Demo validation

Validated on October 4, 2026. Both skills passed Codex structural validation. Four Node test groups passed for counting, deterministic reruns, percentages, invalid data, inert feedback text, and empty/error input.

A real native child installed its own skill from a local source and then from GitHub, explicitly read the installed instructions, ran the bundled counter, and returned its final result. The same child handled a percentage revision. An independent coordinator loaded the installed main skill, launched exactly one child with fresh context, awaited completion without status polling, and verified the reports.

Expected and observed: total20, bug8 (40%), feature-request6 (30%), praise4 (20%), other2 (10%).

Failure checks: duplicate IDs rejected before reports were created; unavailable download returned BLOCKED without counting; incorrect expected integrity hash returned BLOCKED before activation. Unavailable native delegation was tested as a simulated host condition, not by changing actual host configuration.

The main-only install was verified with the worker absent. Both skills are now installed globally. The child also verified all three SHA-256 values for the pinned worker before reading or executing it.

Public audits checked 2026-10-04 04:15 IST: worker Gen/Socket/Snyk Pass; coordinator Gen Pass, Snyk Warn (Medium,2issues), Socket no result. The coordinator warning predates the commit pin and hash manifest. Reinstall did not refresh the scan; a refreshed all-pass coordinator audit is not claimed. See the current [coordinator](https://www.skills.sh/random-react-dev/two-skill-demo/demo-orchestrator) and [worker](https://www.skills.sh/random-react-dev/two-skill-demo/demo-feedback-worker) pages.
