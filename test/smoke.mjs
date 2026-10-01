// Loads the plugin against a stub `ctx.skills` and checks the provider contract.
// Run: node test/smoke.mjs  (no harness or API key needed)
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import * as plugin from '../index.js'

assert.deepEqual(plugin.inject, ['skills'])

let provider
const disposer = () => {}
const ctx = {
  skills: {
    registerProvider(create) {
      provider = create({ signal: new AbortController().signal, invalidate() {} })
      return disposer
    },
  },
}
plugin.apply(ctx)

const candidates = await provider.list({})
assert.equal(candidates.length, 1)
const [candidate] = candidates
assert.equal(candidate.name, 'owasp-security')
assert.match(candidate.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
assert.ok(candidate.description.startsWith('Reviews code for security vulnerabilities'))
assert.ok(candidate.whenToUse.includes('security review'))
assert.equal(candidate.provider, provider.name)
assert.equal(candidate.source, 'bundled')
assert.equal(typeof candidate.rank, 'number')
assert.deepEqual(candidate.invocation, { modelInvocable: true, userInvocable: true })

const skill = await provider.get(candidate, {})
assert.equal(skill.name, candidate.name)
assert.ok(skill.content.startsWith('\n# OWASP Security') || skill.content.startsWith('# OWASP Security'))
assert.ok(!skill.content.includes('when_to_use:'), 'frontmatter must be stripped from the body')

// Every reference file the body links to must ship in the resource directory.
const links = [...skill.content.matchAll(/\]\((reference\/[^)]+)\)/g)].map(m => m[1])
assert.ok(links.length >= 4)
for (const link of links) assert.ok(existsSync(join(skill.resourceBase.path, link)), `missing ${link}`)

console.log('smoke test passed')
