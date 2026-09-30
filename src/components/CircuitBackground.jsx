// src/components/CircuitBackground.jsx
// Circuit-board background with unsynchronized electric current animations.

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const W = 960
const H = 900

// Builds the circuit layout once (seeded, so it looks the same every load).
function buildCircuit() {
  const rnd = mulberry32(11)
  const r = (a, b) => a + rnd() * (b - a)
  const traces = []
  const dots = []

  // side: L / R (from left / right edge) or T / B (from top / bottom edge)
  function bundle(side, pos, count, reach) {
    const gap = r(9, 12)
    const moves = []
    const segs = rnd() < 0.5 ? 2 : 3
    for (let i = 0; i < segs; i++) {
      moves.push([r(28, 80), 0])
      const shift = (rnd() < 0.5 ? -1 : 1) * r(16, 38)
      moves.push([Math.abs(shift), shift])
    }
    for (let k = 0; k < count; k++) {
      let along = -10
      let across = pos + k * gap
      const pts = [[along, across]]
      const use = moves.length - Math.floor(r(0, 3)) * 1
      for (let m = 0; m < use; m++) {
        if (along + moves[m][0] > reach) break
        along += moves[m][0]
        across += moves[m][1]
        pts.push([along, across])
      }
      along = Math.min(reach, along + r(24, 90))
      pts.push([along, across])

      const xy = pts.map(([a, c]) =>
        side === 'L' ? [a, c] : side === 'R' ? [W - a, c] : side === 'T' ? [c, a] : [c, H - a]
      )
      const d = 'M' + xy.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')
      const dashes = ['8 92', '5 45', '4 21']
      traces.push({
        d,
        end: xy[xy.length - 1],
        lit: rnd() > 0.2,
        dash: dashes[Math.floor(rnd() * dashes.length)],
        dur: +r(2.4, 7.5).toFixed(2),
        delay: +(-r(0, 9)).toFixed(2),
        hot: rnd() > 0.55,
      })
    }
  }

  ;[30, 160, 290, 420, 550, 680, 810].forEach((y) => bundle('L', y, 3 + Math.floor(rnd() * 3), 300))
  ;[95, 225, 355, 485, 615, 745, 850].forEach((y) => bundle('R', y, 3 + Math.floor(rnd() * 3), 300))
  ;[330, 420, 510, 600, 690].forEach((x) => bundle('T', x, 2 + Math.floor(rnd() * 2), 165))
  ;[360, 450, 540, 630].forEach((x) => bundle('B', x, 2 + Math.floor(rnd() * 2), 170))

  for (let i = 0; i < 16; i++) {
    const left = rnd() < 0.5
    dots.push({
      x: +(left ? r(10, 250) : r(710, 950)).toFixed(1),
      y: +r(10, 890).toFixed(1),
      delay: +(-r(0, 4)).toFixed(2),
      dur: +r(1.8, 4.2).toFixed(2),
    })
  }
  return { traces, dots }
}

const { traces, dots } = buildCircuit()

export default function CircuitBackground() {
  return (
    <svg
      className="circuit-svg"
      viewBox="0 0 960 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="circuit-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* static copper traces */}
      <g className="circuit-base">
        {traces.map((t, i) => (
          <path key={i} d={t.d} />
        ))}
      </g>

      {/* pads at the end of every trace */}
      <g className="circuit-pads">
        {traces.map((t, i) => (
          <circle key={i} cx={t.end[0]} cy={t.end[1]} r="3.4" />
        ))}
      </g>

      {/* glowing current pulses, each on its own speed and delay */}
      <g className="circuit-current" filter="url(#circuit-glow)">
        {traces.map((t, i) =>
          t.lit ? (
            <path
              key={i}
              d={t.d}
              pathLength="100"
              className={t.hot ? 'hot' : ''}
              style={{
                strokeDasharray: t.dash,
                animationDuration: t.dur + 's',
                animationDelay: t.delay + 's',
              }}
            />
          ) : null
        )}
      </g>

      {/* blinking status lights */}
      <g className="circuit-dots" filter="url(#circuit-glow)">
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r="3.2"
            style={{
              animationDuration: d.dur + 's',
              animationDelay: d.delay + 's',
            }}
          />
        ))}
      </g>
    </svg>
  )
}