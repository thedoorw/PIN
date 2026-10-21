// DC002 source-derived A3 INK document candidate. NOT PUBLIC Runtime File→Open evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const content = readFileSync(new URL('../evidence/DC002_A3_native_candidate.ink', import.meta.url));
const document = JSON.parse(content.toString('utf8'));
const paths = document.pages[0].layers[0].objects;
const canonicalize = v => Array.isArray(v) ? v.map(canonicalize) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonicalize(v[k])])) : (typeof v === 'number' && !Number.isFinite(v) ? null : v);
const fingerprint = v => {
  const text=JSON.stringify(canonicalize(v)); let hash=0x811c9dc5;
  for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i); hash=Math.imul(hash,0x01000193);}
  return 'fnv1a32:'+(hash>>>0).toString(16).padStart(8,'0');
};
test('DC002 .ink candidate has exact A3 raw INK document accepted by the File→Open schema',()=>{
  assert.equal(content.length,2095036);
  assert.equal(createHash('sha256').update(content).digest('hex'),'0fa565cec43cfedd2fb0f8dce3995d80810df361cd8d1d63c22dd4edc8798d7a');
  assert.equal(document.schema,undefined); // PUBLIC src/ink.js saveProject/openProjectFile use raw document
  assert.ok(Array.isArray(document.pages));
  assert.equal(document.format,'INK'); assert.equal(document.formatVersion,4);
  assert.equal(document.id,'dc002-a3-source-derived-native-candidate');
  assert.equal(fingerprint(document),'fnv1a32:b2781eee');
  assert.equal(document.pages[0].artboard.widthMm,297);
  assert.equal(document.pages[0].artboard.heightMm,420);
});
test('DC002 .ink candidate stores 640 independently editable curved Paths within sheet',()=>{
  assert.equal(paths.length,640);
  assert.equal(new Set(paths.map(p=>p.id)).size,640);
  const W=297*96/25.4,H=420*96/25.4;
  let arcs=0,anchors=0,handles=0;
  for(const path of paths){
    assert.equal(path.type,'path'); assert.equal(path.subpaths.length,2);
    assert.equal(path.fill,'none');assert.equal(path.matrix.length,6);
    for(const sub of path.subpaths){
      assert.equal(sub.closed,false); assert.equal(sub.anchors.length,2);
      arcs++;
      for(const anchor of sub.anchors){
        anchors++;
        const x=path.matrix[0]*anchor.x+path.matrix[4];
        const y=path.matrix[3]*anchor.y+path.matrix[5];
        assert.ok(x>=-W/2-1e-8 && x<=W/2+1e-8);
        assert.ok(y>=-H/2-1e-8 && y<=H/2+1e-8);
        for(const v of [anchor.x,anchor.y,anchor.in.x,anchor.in.y,anchor.out.x,anchor.out.y]) assert.ok(Number.isFinite(v));
        if(Math.abs(anchor.in.x)+Math.abs(anchor.in.y)+Math.abs(anchor.out.x)+Math.abs(anchor.out.y)>0)handles++;
      }
    }
  }
  assert.deepEqual([arcs,anchors,handles],[1280,2560,2560]);
});
