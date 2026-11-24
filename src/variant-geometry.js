// The FigCraft master export uses absolute M/L/C/Z commands. Keep edits in
// master coordinates so all non-edited strokes retain their original position.
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const line = (a, b) => [a, b]
const end = (segment) => segment.at(-1)
const point = (p) => p.map((n) => Number(n.toFixed(3))).join(' ')

function parse(path) {
  const items = []
  let item, cursor
  for (const [, command, args] of path.matchAll(/([MLCZ])([^MLCZ]*)/g)) {
    const numbers = args.match(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)?.map(Number) ?? []
    const points = Array.from({ length: numbers.length / 2 }, (_, i) => numbers.slice(i * 2, i * 2 + 2))
    if (command === 'M') {
      cursor = points[0]
      item = { start: cursor, segments: [], closed: false }
      items.push(item)
    } else if (command === 'Z') {
      item.closed = true
      if (distance(cursor, item.start) > .0001) item.segments.push(line(cursor, item.start))
    } else {
      item.segments.push([cursor, ...points])
      cursor = points.at(-1)
    }
  }
  return items
}

function encode(segments, closed = false) {
  if (!segments.length) return ''
  return `M${point(segments[0][0])}${segments.map((segment) => `${segment.length === 2 ? 'L' : 'C'}${segment.slice(1).map(point).join(' ')}`).join('')}${closed ? 'Z' : ''}`
}

function split(segment, t) {
  const left = [segment[0]]
  const right = [end(segment)]
  while (segment.length > 1) {
    segment = segment.slice(1).map((p, i) => mix(segment[i], p, t))
    left.push(segment[0])
    right.unshift(end(segment))
  }
  return [left, right]
}

function sample(segment, t) {
  if (segment.length === 2) return mix(...segment, t)
  const [a, b, c, d] = segment
  const s = 1 - t
  return a.map((_, i) => s ** 3 * a[i] + 3 * s * s * t * b[i] + 3 * s * t * t * c[i] + t ** 3 * d[i])
}

function pointLineDistance(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)))
  return distance(p, mix(a, b, t))
}

function pickGap(items, gap, minLength, minChord) {
  const segments = items.flatMap(({ segments }, itemIndex) => segments.map((segment, index) => ({ segment, index, itemIndex })))
  segments.forEach((entry) => {
    const { segment } = entry
    entry.length = segment.length === 2 ? distance(...segment) : Math.max(distance(segment[0], end(segment)), segment.slice(1).reduce((sum, p, i) => sum + distance(segment[i], p), 0) * .84)
    const n = segment.length === 2 ? 1 : 10
    entry.samples = Array.from({ length: n + 1 }, (_, i) => sample(segment, i / n))
  })
  let best
  for (const entry of segments) {
    if (entry.length < minLength) continue
    const { segment } = entry
    const half = Math.min(.31, gap / (entry.length * 2))
    for (const center of [.64, .39, .5, .76, .24]) {
      if (center - half < .09 || center + half > .91) continue
      const from = sample(segment, center - half), to = sample(segment, center + half)
      if (distance(from, to) < minChord) continue
      const middle = sample(segment, center)
      let clearance = 6
      for (const neighbor of segments) {
        if (neighbor === entry) continue
        const points = neighbor.samples
        for (let k = 1; k < points.length; k++) clearance = Math.min(clearance, pointLineDistance(middle, points[k - 1], points[k]))
      }
      const score = Math.min(entry.length, 14) * .23 + clearance * 1.05 + (center === .64 ? .25 : 0)
      if (!best || score > best.score) best = { ...entry, score, from: center - half, to: center + half }
    }
  }
  return best
}

export function brokenGeometry(path) {
  const items = parse(path)
  const gap = pickGap(items, 4.4, 5.2, 2.7) ?? pickGap(items, 2.9, 2.6, 1.7)
  if (!gap) throw new Error(`Broken needs a hand-drawn override: ${path}`)
  return items.map(({ segments, closed }, i) => {
    if (i !== gap.itemIndex) return encode(segments, closed)
    const head = segments.slice(0, gap.index), tail = segments.slice(gap.index + 1)
    const [before] = split(gap.segment, gap.from)
    const [, after] = split(gap.segment, gap.to)
    return closed ? encode([after, ...tail, ...head, before]) : encode([...head, before]) + encode([after, ...tail])
  }).join('')
}

const angle = (a, p, b) => {
  const m = distance(a, p) * distance(b, p)
  if (m < .001) return 180
  return Math.acos(Math.max(-1, Math.min(1, ((a[0] - p[0]) * (b[0] - p[0]) + (a[1] - p[1]) * (b[1] - p[1])) / m))) * 180 / Math.PI
}

export function beveledGeometry(path) {
  const items = parse(path)
  let edits = 0
  const beveled = items.map(({ segments, closed }) => {
    // Trade small, rounded right-angle joins for a diagonal without flattening
    // curves that define the silhouette (circles, waves, leaves, etc.).
    const corners = segments.map((segment, i) => {
      if (segment.length !== 4 || distance(segment[0], end(segment)) > 4.1) return segment
      const [start, controlIn, controlOut, finish] = segment
      const tangentOut = [start[0] + controlOut[0] - finish[0], start[1] + controlOut[1] - finish[1]]
      if (Math.abs(angle(controlIn, start, tangentOut) - 90) > 9) return segment
      const prev = segments[i - 1] ?? (closed ? segments.at(-1) : null)
      const next = segments[i + 1] ?? (closed ? segments[0] : null)
      if (prev?.length !== 2 || next?.length !== 2) return segment
      return line(start, finish)
    })
    const trims = corners.map((current, i) => {
      const prev = corners[i - 1] ?? (closed ? corners.at(-1) : null)
      if (segments[i] !== current || (i ? segments[i - 1] : segments.at(-1)) !== prev || prev?.length !== 2 || current.length !== 2 || prev === current) return 0
      const bend = angle(prev[0], current[0], end(current))
      const trim = Math.min(distance(...prev) * .27, distance(...current) * .27, 1.65)
      return bend > 32 && bend < 138 && trim >= .72 ? trim : 0
    })
    const output = []
    for (let i = 0; i < corners.length; i++) {
      const segment = corners[i]
      if (segment !== segments[i]) edits++
      if (segment.length !== 2) { output.push(segment); continue }
      const next = trims[i + 1] ?? (closed ? trims[0] : 0)
      const last = end(segment), length = distance(...segment)
      const start = trims[i] ? mix(segment[0], last, trims[i] / length) : segment[0]
      const finish = next ? mix(last, segment[0], next / length) : last
      output.push(line(start, finish))
      if (next) {
        const nextSegment = corners[(i + 1) % corners.length]
        output.push(line(finish, mix(last, end(nextSegment), next / distance(...nextSegment))))
        edits++
      }
    }
    return { segments: output, closed }
  })
  if (!edits) {
    // Facet one curve on otherwise entirely rounded symbols. On straight-only
    // marks, bend a single terminal inward to keep the mark recognizable.
    const curves = beveled.flatMap(({ segments }) => segments.flatMap((segment, i) => segment.length === 4 ? [{ segments, segment, i, bend: pointLineDistance(sample(segment, .5), segment[0], end(segment)) }] : [])).sort((a, b) => b.bend - a.bend)
    const facet = curves[0]
    if (facet?.bend > .38) {
      const [before, rest] = split(facet.segment, .14)
      const [, after] = split(rest, .72 / .86)
      facet.segments.splice(facet.i, 1, before, line(end(before), after[0]), after)
    } else {
      const strokes = beveled.flatMap(({ segments, closed }) => closed || segments.length !== 1 || segments[0].length !== 2 ? [] : [{ segments, length: distance(...segments[0]) }]).sort((a, b) => b.length - a.length)
      const longest = strokes[0]
      if (!longest || longest.length < 3.5) throw new Error(`Potong Serong needs a hand-drawn override: ${path}`)
      const [a, b] = longest.segments[0]
      const neck = mix(b, a, Math.min(.22, 1.7 / longest.length))
      const terminal = [b[0] - (b[1] - a[1]) * 1.35 / longest.length, b[1] + (b[0] - a[0]) * 1.35 / longest.length]
      longest.segments.splice(0, 1, line(a, neck), line(neck, terminal))
    }
  }
  return beveled.map(({ segments, closed }) => encode(segments, closed)).join('')
}
