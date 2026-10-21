// DC002 source-derived numerical oracle (NOT original flowshape Runtime, SVG export, or INK test).
// References: Jossifresben/flowshape@b39b76012aaa040345c30f3373243d920945b746
// src/poster/formats.ts, src/compose/{units,skeletons,variants,render}.ts,
// src/patterns/truchet.ts, src/core/prng.ts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function deriveSeed(seed, name) {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (seed ^ h) >>> 0;
}
function oracle(seed = 36131) {
  const sheet = { w: 600, h: Math.round(600 * 420 / 297) }; // A3, short edge 600
  const artH = sheet.h * (1 - 0.56); // 3c.s0: art is trailing 44%, horizontal split
  const size = { w: Math.round(600 * sheet.w / artH), h: 600 }; // artworkSize
  const cell = 30, half = cell / 2;
  const cols = Math.floor(size.w / cell), rows = Math.floor(size.h / cell);
  const ox = (size.w - cols * cell) / 2, oy = (size.h - rows * cell) / 2;
  const rnd = mulberry32(deriveSeed(seed, 'truchet'));
  let flipped = 0, bold = 0, accented = 0;
  const decisions = [], pathData = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = ox + i * cell, y = oy + j * cell;
    const flip = rnd() > 0.5;
    const thick = rnd() < 0.14;
    const accent = rnd() < 0.04;
    flipped += Number(flip); bold += Number(thick); accented += Number(accent);
    decisions.push(`${i},${j}:${Number(flip)}${Number(thick)}${Number(accent)}`);
    const d = flip
      ? `M${x} ${y + half}A${half} ${half} 0 0 1 ${x + half} ${y}M${x + half} ${y + cell}A${half} ${half} 0 0 1 ${x + cell} ${y + half}`
      : `M${x} ${y + half}A${half} ${half} 0 0 0 ${x + half} ${y + cell}M${x + half} ${y}A${half} ${half} 0 0 0 ${x + cell} ${y + half}`;
    pathData.push(d);
  }
  return { sheet, artH, size, cols, rows, ox, oy, flipped, bold, accented,
    tileCount: pathData.length, arcCount: pathData.length * 2,
    decisionsHash: sha256(decisions.join('\n')), pathDataHash: sha256(pathData.join('\n')) };
}
test('DC002 3c composer uses artwork region, not full A3 sheet for generator', () => {
  const r = oracle();
  assert.deepEqual(r.sheet, { w: 600, h: 848 });
  assert.deepEqual(r.size, { w: 965, h: 600 });
  assert.deepEqual([r.cols, r.rows, r.ox, r.oy, r.tileCount, r.arcCount],
    [32, 20, 2.5, 0, 640, 1280]);
});
test('DC002 pinned seed output decisions and paths are stable under source-derived replay', () => {
  const r = oracle();
  assert.equal(r.flipped, 326);
  assert.equal(r.bold, 92);
  assert.equal(r.accented, 21);
  assert.equal(r.decisionsHash, 'e07ea862613bd4ecaee27d3a5caf9c3075dcc3b7048ce1fce6d3db7c8002de8a');
  assert.equal(r.pathDataHash, '6b165cc451b3b2844822c0f42ec6dc8a79d440deceb4cd8476b29691eff2e143');
  assert.deepEqual(oracle(), r);
  assert.notEqual(oracle(36132).pathDataHash, r.pathDataHash);
});
