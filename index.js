import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'owasp-security'
export const inject = ['skills']

const PROVIDER = 'owasp-security'
// Rank of the `bundled` source in the harness's local discovery order, so a
// project or user skill with the same name overrides this packaged one.
const BUNDLED_SKILL_RANK = 600

const skillDir = join(dirname(fileURLToPath(import.meta.url)), 'skills', 'owasp-security')
const skillPath = join(skillDir, 'SKILL.md')

// SKILL.md frontmatter is flat `key: value` lines, so no YAML parser is needed.
function parseSkill(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) throw new Error(`${skillPath}: missing frontmatter`)
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (field) meta[field[1]] = field[2].trim()
  }
  if (!meta.name || !meta.description) throw new Error(`${skillPath}: frontmatter needs name and description`)
  return { meta, content: text.slice(match[0].length) }
}

async function loadSkill() {
  const { meta, content } = parseSkill(await readFile(skillPath, 'utf8'))
  const summary = {
    path: skillPath,
    name: meta.name,
    description: meta.description,
    whenToUse: meta.when_to_use,
    invocation: { modelInvocable: true, userInvocable: true },
    source: 'bundled',
    provider: PROVIDER,
    // Lets the `skill` tool resolve the relative `reference/*.md` links.
    resourceBase: { kind: 'directory', path: skillDir },
  }
  return { summary, content }
}

export function apply(ctx) {
  ctx.skills.registerProvider(() => ({
    name: PROVIDER,
    async list() {
      const { summary } = await loadSkill()
      return [{ ...summary, rank: BUNDLED_SKILL_RANK, locator: skillPath }]
    },
    async get() {
      const { summary, content } = await loadSkill()
      return { ...summary, content }
    },
  }))
}
