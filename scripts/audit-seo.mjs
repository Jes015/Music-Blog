#!/usr/bin/env node
// Auditoría de dist/: node scripts/audit-seo.mjs   (sale con código 1 si hay errores)
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const errors = []
const warns = []

const files = []
;(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.html')) files.push(full)
  }
})(dist)

const pick = (re, s) => (s.match(re) || [])[1]
const decode = (s = '') =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
const seenTitle = new Map()
const seenDesc = new Map()
const noindexPaths = new Set()
let pages = 0

for (const file of files) {
  const rel = file.slice(dist.length)
  if (/^google[0-9a-f]+\.html$/.test(rel)) continue
  pages++
  const html = readFileSync(file, 'utf8')
  const where = `/${rel.replace(/index\.html$/, '')}`

  const title = decode(pick(/<title>([^<]*)<\/title>/, html))
  const desc = decode(pick(/<meta name="description" content="([^"]*)"/, html))
  const canonical = pick(/<link rel="canonical" href="([^"]*)"/, html)
  const robots = pick(/<meta name="robots" content="([^"]*)"/, html) ?? ''
  const ogImage = pick(/<meta property="og:image" content="([^"]*)"/, html)
  const twitterCard = pick(/<meta name="twitter:card" content="([^"]*)"/, html)
  const noindex = /noindex/.test(robots)
  if (noindex) noindexPaths.add(where)

  if (!title) errors.push(`${where}: sin <title>`)
  else if (title.length > 60) errors.push(`${where}: title ${title.length} chars (>60): ${title}`)
  if (!desc) errors.push(`${where}: sin description`)
  else if (desc.length < 120 || desc.length > 155) warns.push(`${where}: description ${desc.length} chars (ideal 120-155)`)
  if (!canonical || !/^https:\/\//.test(canonical)) errors.push(`${where}: canonical ausente o no absoluto`)
  if (!ogImage) errors.push(`${where}: sin og:image`)
  else {
    const path = new URL(ogImage).pathname
    if (!existsSync(join(dist, path))) errors.push(`${where}: og:image no existe en dist (${path})`)
  }
  if (twitterCard !== 'summary_large_image') errors.push(`${where}: twitter:card = ${twitterCard}`)

  const h1 = (html.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) errors.push(`${where}: ${h1} <h1>`)
  if ((html.match(/<!doctype/gi) || []).length !== 1) errors.push(`${where}: doctype duplicado (HTML anidado)`)
  if ((html.match(/<head[\s>]/g) || []).length !== 1) errors.push(`${where}: <head> duplicado`)
  if ((html.match(/<main[\s>]/g) || []).length !== 1) errors.push(`${where}: debe haber exactamente 1 <main>`)
  if (/<img\b[^>]*\swidth="[^"]*%"/.test(html)) warns.push(`${where}: <img> con width en %`)

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1])
    } catch {
      errors.push(`${where}: JSON-LD inválido`)
    }
  }

  if (!noindex) {
    if (title) (seenTitle.get(title) ?? seenTitle.set(title, []).get(title)).push(where)
    if (desc) (seenDesc.get(desc) ?? seenDesc.set(desc, []).get(desc)).push(where)
  }
}

for (const [t, list] of seenTitle) if (list.length > 1) errors.push(`title duplicado (${list.length}): "${t}" → ${list.slice(0, 3).join(', ')}`)
for (const [d, list] of seenDesc) if (list.length > 1) errors.push(`description duplicada (${list.length}): ${list.slice(0, 3).join(', ')}`)

// Coherencia sitemap ↔ noindex
const sitemapFile = join(dist, 'sitemap-0.xml')
if (existsSync(sitemapFile)) {
  const locs = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  for (const p of locs) if (noindexPaths.has(p)) errors.push(`sitemap incluye URL noindex: ${p}`)
  console.log(`Sitemap: ${locs.length} URLs`)
} else errors.push('falta dist/sitemap-0.xml')

for (const f of ['rss.xml', 'robots.txt', 'favicon.ico', 'favicon.svg', 'og/default.png', 'icons/180.png']) {
  if (!existsSync(join(dist, f))) errors.push(`falta dist/${f}`)
}

console.log(`Páginas auditadas: ${pages} | noindex: ${noindexPaths.size}`)
console.log(`\nERRORES (${errors.length})`)
errors.slice(0, 40).forEach((e) => console.log(' ✗', e))
console.log(`\nAVISOS (${warns.length})`)
warns.slice(0, 40).forEach((w) => console.log(' !', w))
process.exit(errors.length ? 1 : 0)
