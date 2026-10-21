#!/usr/bin/env node
// PIN DC002 — source-derived geometry bridge fixture generator, NOT original flowshape export.
// Attribution: Jossifresben/flowshape@b39b76012aaa040345c30f3373243d920945b746 (MIT).
// Grayscale substitute ONLY for importer smoke QA; DO NOT report palette equivalence.
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
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
    tileCount: pathData.length, arcCount: pathData.length * 2, decisions, pathData,
    decisionsHash: sha256(decisions.join('\n')), pathDataHash: sha256(pathData.join('\n')) };
}

const r=oracle();
if(r.size.w!==965||r.size.h!==600||r.tileCount!==640||r.arcCount!==1280||
   r.flipped!==326||r.bold!==92||r.accented!==21||
   r.decisionsHash!=='e07ea862613bd4ecaee27d3a5caf9c3075dcc3b7048ce1fce6d3db7c8002de8a'||
   r.pathDataHash!=='6b165cc451b3b2844822c0f42ec6dc8a79d440deceb4cd8476b29691eff2e143'){
  throw new Error('PIN_DC002_SOURCE_DERIVED_ORACLE_MISMATCH');
}
const nodes=r.pathData.map((d,k)=>{
  const [position, flags]=r.decisions[k].split(':');
  const [i,j]=position.split(',');
  const accent=flags[2]==='1',bold=flags[1]==='1';
  return `<path id="dc002-r${j}-c${i}" d="${d}" fill="none" stroke="${accent?'#777777':'#000000'}" stroke-width="${bold?2:1}" stroke-linecap="round" data-source-role="${accent?'accent':'ink'}"/>`;
});
const svg=[
  '<svg xmlns="http://www.w3.org/2000/svg" width="965" height="600" viewBox="0 0 965 600">',
  '<!-- Pattern-only source-derived fixture, not an original flowshape complete A3 poster export. -->',
  '<!-- Colors are grayscale QA substitutes, not flowshape OKLCH palette. Source pinned to flowshape b39b76012aaa040345c30f3373243d920945b746 MIT. -->',
  ...nodes,
  '</svg>', ''
].join('\\n');
const output=process.argv[2];
if(!output){throw new Error('Output path required: node recipes/tools/DC002_pattern_fixture.mjs /path/to/out.svg');}
writeFileSync(output,svg,'utf8');
console.log(JSON.stringify({schema:'PIN_DC002_SOURCE_DERIVED_SVG_FIXTURE_V1',output,sha256:sha256(svg),bytes:Buffer.byteLength(svg),sourcePinned:'b39b76012aaa040345c30f3373243d920945b746',patternOnly:true,fullOriginalPoster:false,inkNativeExecuted:false,paths:nodes.length,arcs:r.arcCount,sourceDerivedPathHash:r.pathDataHash,sourceDerivedDecisionHash:r.decisionsHash},null,2));
