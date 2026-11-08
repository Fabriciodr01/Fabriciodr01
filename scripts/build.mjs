// Generates the SVG panels used by README.md. Run with `node scripts/build.mjs` after editing the data below.
// Fonts are embedded as data URIs because GitHub renders README SVGs as <img>,
// which cannot load external resources.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const b64 = (p) => readFileSync(root + p).toString('base64')

const C = {
  void: '#0a0a0a',
  panel: '#100c08',
  ed: '#ff7100',
  amber: '#ffb066',
  dim: '#9a5a25',
  muted: '#c4824a',
  ink: '#e8c9a8',
  bone: '#ffe9d6',
}

const DISPLAY = `@font-face{font-family:BSD;font-weight:800;src:url(data:font/woff2;base64,${b64('scripts/fonts/big-shoulders-display-latin-800-normal.woff2')}) format('woff2')}
.d{font-family:BSD,Impact,'Arial Narrow',sans-serif;font-weight:800}`
const MONOFACE = `@font-face{font-family:STM;src:url(data:font/woff2;base64,${b64('scripts/fonts/share-tech-mono-latin-400-normal.woff2')}) format('woff2')}
.m{font-family:STM,ui-monospace,Consolas,monospace}`
// Only embed the faces a panel actually uses; each one adds ~15-20 KB.
const fontsFor = (body) => [body.includes('class="d"') && DISPLAY, body.includes('class="m"') && MONOFACE].filter(Boolean).join('\n')

// Share Tech Mono advance width, used to size chips and buttons around their labels.
const MONO = 0.545

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${fontsFor(body)}</style>
${body}
</svg>
`

// Panel outline with the clipped top-left and bottom-right corners used across the portfolio HUD.
const frame = (x, y, w, h, cut = 18, stroke = C.ed, opacity = 1) =>
  `<path d="M${x + cut} ${y}H${x + w}V${y + h - cut}L${x + w - cut} ${y + h}H${x}V${y + cut}Z" fill="${C.panel}" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.5"/>`

const grid = (id) =>
  `<pattern id="${id}" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${C.ed}" stroke-opacity="0.07"/></pattern>`

const chip = (x, y, label, size = 12) => {
  const w = Math.round(label.length * size * MONO + 20)
  return {
    w,
    s: `<rect x="${x}" y="${y}" width="${w}" height="26" fill="${C.ed}" fill-opacity="0.08" stroke="${C.ed}" stroke-opacity="0.45"/>
<text x="${x + 10}" y="${y + 17.5}" class="m" font-size="${size}" fill="${C.ink}" letter-spacing="0">${esc(label)}</text>`,
  }
}

const chipRow = (x, y, labels, gap = 8) => {
  let cx = x
  return labels
    .map((l) => {
      const c = chip(cx, y, l)
      cx += c.w + gap
      return c.s
    })
    .join('\n')
}

const W = 860

// ---------------------------------------------------------------- header

function header() {
  const h = 250
  const edge = `M24 4H${W - 4}V${h - 24}L${W - 28} ${h - 4}H4V28Z`
  const cx = 690
  const cy = h / 2
  const ticks = [0, 90, 180, 270]
    .map((d) => `<line x1="${cx}" y1="${cy - 112}" x2="${cx}" y2="${cy - 96}" transform="rotate(${d} ${cx} ${cy})"/>`)
    .join('')
  const body = `<defs>${grid('g')}
<radialGradient id="glow" cx="0.8" cy="0.5" r="0.45"><stop offset="0" stop-color="${C.ed}" stop-opacity="0.3"/><stop offset="1" stop-color="${C.ed}" stop-opacity="0"/></radialGradient>
<clipPath id="clip"><path d="${edge}"/></clipPath></defs>
<rect width="${W}" height="${h}" fill="${C.void}"/>
<g clip-path="url(#clip)">
<rect width="${W}" height="${h}" fill="${C.panel}"/>
<rect width="${W}" height="${h}" fill="url(#g)"/>
<rect width="${W}" height="${h}" fill="url(#glow)"/>
</g>
<g fill="none" stroke="${C.ed}">
<circle cx="${cx}" cy="${cy}" r="100" stroke-opacity="0.35" stroke-dasharray="2 5"/>
<circle cx="${cx}" cy="${cy}" r="62" stroke-opacity="0.2"/>
<circle cx="${cx}" cy="${cy}" r="3" fill="${C.ed}" fill-opacity="0.6" stroke="none"/>
<g stroke-opacity="0.5">${ticks}</g>
</g>
<path d="${edge}" fill="none" stroke="${C.ed}" stroke-width="1.5"/>
<text x="42" y="98" class="d" font-size="68" fill="${C.bone}">FABRICIO</text>
<text x="42" y="164" class="d" font-size="68" fill="${C.ed}">DIAS DA ROSA</text>
<text x="44" y="200" class="m" font-size="17" letter-spacing="2.4" fill="${C.amber}">SOFTWARE ENGINEER · FULL STACK</text>
<line x1="44" y1="214" x2="420" y2="214" stroke="${C.ed}" stroke-opacity="0.35"/>
<text x="44" y="234" class="m" font-size="12.5" letter-spacing="1.8" fill="${C.muted}">SÃO LEOPOLDO, BRAZIL</text>
<g class="m" font-size="11" letter-spacing="1.5" fill="${C.ed}">
<text x="836" y="34" text-anchor="end">● ONLINE</text>
<text x="836" y="${h - 30}" text-anchor="end" fill="${C.dim}">SYS.ID FDR-01</text>
</g>`
  return svg(W, h, body, 'Fabricio Dias da Rosa, Software Engineer, Full Stack. São Leopoldo, Brazil.')
}

// ---------------------------------------------------------------- linkedin cover

// LinkedIn crops covers to 1584x396 and lays the profile photo over the lower-left corner,
// so the text sits right-aligned and the left side only carries the reticle.
function cover() {
  const w = 1584
  const h = 396
  const edge = `M40 6H${w - 6}V${h - 40}L${w - 40} ${h - 6}H6V40Z`
  const cx = 330
  const cy = 170
  const ticks = [0, 90, 180, 270]
    .map((d) => `<line x1="${cx}" y1="${cy - 150}" x2="${cx}" y2="${cy - 128}" transform="rotate(${d} ${cx} ${cy})"/>`)
    .join('')
  const right = w - 72
  const contact = 24
  // Icons sit left of right-aligned text, so they are offset by the text's monospace width.
  const iconX = (label) => right - label.length * contact * MONO - 40
  const site = 'fabriciodr01.github.io/portifolio'
  const mail = 'fabriciodr01@gmail.com'
  const gx = iconX(site)
  const mx = iconX(mail)
  const body = `<defs>
<pattern id="g" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="${C.ed}" stroke-opacity="0.07"/></pattern>
<radialGradient id="glow" cx="0.2" cy="0.45" r="0.4"><stop offset="0" stop-color="${C.ed}" stop-opacity="0.32"/><stop offset="1" stop-color="${C.ed}" stop-opacity="0"/></radialGradient>
<clipPath id="clip"><path d="${edge}"/></clipPath></defs>
<rect width="${w}" height="${h}" fill="${C.void}"/>
<g clip-path="url(#clip)">
<rect width="${w}" height="${h}" fill="${C.panel}"/>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<rect width="${w}" height="${h}" fill="url(#glow)"/>
</g>
<g fill="none" stroke="${C.ed}">
<circle cx="${cx}" cy="${cy}" r="134" stroke-opacity="0.35" stroke-dasharray="3 7"/>
<circle cx="${cx}" cy="${cy}" r="84" stroke-opacity="0.2"/>
<circle cx="${cx}" cy="${cy}" r="4" fill="${C.ed}" fill-opacity="0.6" stroke="none"/>
<g stroke-opacity="0.5" stroke-width="1.5">${ticks}</g>
</g>
<path d="${edge}" fill="none" stroke="${C.ed}" stroke-width="2.5"/>
<text x="${right}" y="152" text-anchor="end" class="d" font-size="104"><tspan fill="${C.bone}">SOFTWARE</tspan> <tspan fill="${C.ed}">ENGINEER</tspan></text>
<text x="${right}" y="200" text-anchor="end" class="m" font-size="24" letter-spacing="3" fill="${C.amber}">VUE · REACT · TYPESCRIPT · C# / .NET</text>
<line x1="${right - 640}" y1="228" x2="${right}" y2="228" stroke="${C.ed}" stroke-opacity="0.35" stroke-width="1.5"/>
<g class="m" font-size="${contact}" fill="${C.bone}" text-anchor="end">
<text x="${right}" y="276">${site}</text>
<text x="${right}" y="318">${mail}</text>
</g>
<g fill="none" stroke="${C.ed}" stroke-width="2">
<circle cx="${gx + 12}" cy="268" r="11"/><ellipse cx="${gx + 12}" cy="268" rx="5" ry="11"/><line x1="${gx + 1}" y1="268" x2="${gx + 23}" y2="268"/>
<rect x="${mx}" y="301" width="24" height="17"/><path d="M${mx} 301l12 9 12-9"/>
</g>
<text x="${right}" y="${h - 44}" text-anchor="end" class="m" font-size="16" letter-spacing="2.4" fill="${C.dim}">SÃO LEOPOLDO, BRAZIL</text>`
  return svg(w, h, body, `Software Engineer. ${site}, ${mail}`)
}

// ---------------------------------------------------------------- section titles

function section(title) {
  const h = 40
  const tx = 18 + title.length * 15 * MONO + 18
  const body = `<rect x="0" y="12" width="8" height="16" fill="${C.ed}"/>
<text x="18" y="26" class="m" font-size="15" letter-spacing="0" fill="${C.ed}">${esc(title)}</text>
<line x1="${tx}" y1="20" x2="${W - 40}" y2="20" stroke="${C.ed}" stroke-opacity="0.35"/>
<path d="M${W - 30} 14l6 6-6 6M${W - 18} 14l6 6-6 6" fill="none" stroke="${C.ed}" stroke-opacity="0.6"/>`
  return svg(W, h, body, title)
}

// ---------------------------------------------------------------- link buttons

function button(label) {
  const size = 13
  const w = Math.round(label.length * size * MONO + 2 * 20 + 18)
  const h = 40
  const body = `<path d="M10 1H${w - 1}V${h - 11}L${w - 11} ${h - 1}H1V11Z" fill="${C.panel}" stroke="${C.ed}" stroke-width="1.5"/>
<text x="20" y="25" class="m" font-size="${size}" letter-spacing="0" fill="${C.bone}">${esc(label)}</text>
<path d="M${w - 26} 25l8-8M${w - 24} 17h6v6" fill="none" stroke="${C.ed}" stroke-width="1.5"/>`
  return { w, s: svg(w, h, body, label) }
}

// ---------------------------------------------------------------- stack panel

const STACK = [
  ['FRONTEND', ['Vue 3', 'React', 'TypeScript', 'Quasar', 'Capacitor', 'Tailwind CSS', 'three.js']],
  ['BACKEND', ['C#', '.NET / ASP.NET Core', 'EF Core', 'Node.js', 'NestJS', 'PostgreSQL', 'REST', 'GraphQL']],
  ['QUALITY & DELIVERY', ['Jest', 'Cypress', 'xUnit', 'Testcontainers', 'Docker', 'GitHub Actions']],
  ['GAMES', ['Unity', 'GameMaker', 'Blender']],
]

function stack() {
  const rowH = 46
  const top = 26
  const h = top + STACK.length * rowH + 10
  const rows = STACK.map(([group, items], i) => {
    const y = top + i * rowH
    return `<text x="34" y="${y + 18}" class="m" font-size="12" letter-spacing="2" fill="${C.ed}">${esc(group)}</text>
${chipRow(210, y, items)}
${i < STACK.length - 1 ? `<line x1="34" y1="${y + rowH - 10}" x2="${W - 34}" y2="${y + rowH - 10}" stroke="${C.ed}" stroke-opacity="0.12"/>` : ''}`
  }).join('\n')
  const body = `<defs>${grid('g')}</defs>
${frame(1, 1, W - 2, h - 2)}
<rect x="1" y="1" width="${W - 2}" height="${h - 2}" fill="url(#g)"/>
${rows}`
  return svg(W, h, body, 'Tech stack: ' + STACK.map(([g, i]) => `${g}: ${i.join(', ')}`).join('. '))
}

// ---------------------------------------------------------------- write

mkdirSync(root + 'assets', { recursive: true })
const out = (name, s) => writeFileSync(`${root}assets/${name}.svg`, s)

out('header', header())
mkdirSync(root + 'linkedin', { recursive: true })
writeFileSync(`${root}linkedin/cover.svg`, cover())
out('section-stack', section('LOADOUT'))
out('stack', stack())
for (const [name, label] of [
  ['btn-portfolio', 'PORTFOLIO'],
  ['btn-linkedin', 'LINKEDIN'],
  ['btn-email', 'EMAIL'],
]) {
  const b = button(label)
  out(name, b.s)
  console.log(name, b.w)
}
console.log('done')
