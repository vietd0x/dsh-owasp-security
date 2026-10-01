# OWASP Security skill for DeepSeek Harness

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) bundle that adds the
`owasp-security` skill: security review and secure-coding guidance covering OWASP Top 10:2025,
ASVS 5.0, the OWASP Top 10 for LLM Applications (2026), and the OWASP Top 10 for Agentic
Applications (2026).

Ported from the Claude Code plugin [agamm/claude-code-owasp](https://github.com/agamm/claude-code-owasp).
The skill content (`skills/owasp-security/`) is unchanged; only the packaging differs.

## Install

Install the bundle into a profile with `dsh plugin`:

```sh
dsh plugin --profile demo add ./dsh-owasp-security
```

Check that the layer is present, then boot:

```sh
dsh --profile demo --dump-config   # shows a "# == dsh-owasp-security" layer
dsh --profile demo
```

Remove it with `dsh plugin --profile demo remove dsh-owasp-security`.

From a source checkout of the harness, run the same commands as `pnpm dsh ...`.

### Try it without installing

Load the plugin through a `--patch` overlay. The path must be absolute:

```yaml
# owasp.patch.yml
- insert:
    - id: owasp-security
      name: '/absolute/path/to/dsh-owasp-security/index.js'
```

```sh
dsh web --patch ./owasp.patch.yml
```

### Install as a plain skill

The harness's filesystem provider also discovers skill directories, so the plugin is optional.
Copy the skill folder to a project or user skill root:

```sh
cp -r dsh-owasp-security/skills/owasp-security YOUR_PROJECT/.dsh/skills/
```

```sh
cp -r dsh-owasp-security/skills/owasp-security ~/.dsh/skills/
```

## How it works

```
dsh-owasp-security/
├── package.json        # declares dsh.bundle
├── cordis.patch.yml    # inserts the plugin row
├── index.js            # Cordis plugin: registers a skill provider on ctx.skills
└── skills/owasp-security/
    ├── SKILL.md        # workflow, triage rubric, report format, quick-reference tables
    └── reference/      # loaded on demand through the skill's resource directory
```

`index.js` declares `inject = ['skills']` and calls `ctx.skills.registerProvider(...)` with one
`bundled` candidate. The skill's name and description appear in the session's skill catalog; the
model loads the body with the `skill` tool and reads `reference/*.md` only when the task needs
them. A project or user skill named `owasp-security` takes precedence over this packaged one.

The plugin imports only Node built-ins, so it needs no build step and no dependencies.

## Usage

Ask for a security review, or invoke the skill by name:

```
"Review this code for security issues"
"Is this authentication implementation secure?"
"Check this AI agent for OWASP agentic risks"
```

## Test

```sh
node test/smoke.mjs
```

This loads the plugin against a stub `ctx.skills` and checks the provider contract. It does not
start the harness or call a model.

## Not ported

The original repository's `evals/` suite runs on `claude plugin eval` and has no harness
equivalent here, so it is not included.

## License

MIT. See [LICENSE](LICENSE).
