// README banner generator: converts every text run to SVG vector outlines and
// assembles the final SVG from a template, so the banners render identically on
// every platform (no system-font fallback). See tools/banner/README.md.
//
// Usage:
//   node gen.js header   -> writes ../../header.svg
//   node gen.js arch     -> writes ../../architecture.svg
//
// Template tokens:
//   @@id@@              -> path `d` for run `id` (baseline origin at 0,0, anchor applied)
//   @@x:id:BASE:PAD@@   -> BASE + width(id) + PAD   (for chaining runs on one line)
//   @@w:id@@            -> width of run `id`
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");

const DIR = __dirname;
const TARGETS = {
  header: { spec: "spec-header.js", template: "header-template.svg", out: "../../header.svg" },
  arch: { spec: "spec-arch.js", template: "arch-template.svg", out: "../../architecture.svg" },
};
const target = TARGETS[process.argv[2]];
if (!target) {
  console.error("usage: node gen.js <header|arch>");
  process.exit(1);
}

const FONTS = {
  sg700: opentype.loadSync(path.join(DIR, "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff")),
  sg500: opentype.loadSync(path.join(DIR, "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff")),
  sg400: opentype.loadSync(path.join(DIR, "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff")),
  jbm400: opentype.loadSync(path.join(DIR, "fonts/JetBrainsMono-Regular.ttf")),
  jbm500: opentype.loadSync(path.join(DIR, "fonts/JetBrainsMono-Medium.ttf")),
};

function runToPath(run) {
  const font = FONTS[run.font];
  const size = run.size;
  const tracking = run.tracking || 0; // px added between glyphs
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(run.text);
  let x = 0;
  const combined = new opentype.Path();
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const gp = g.getPath(x, 0, size);
    combined.commands.push(...gp.commands);
    x += g.advanceWidth * scale;
    if (i < glyphs.length - 1) {
      x += font.getKerningValue(g, glyphs[i + 1]) * scale;
      x += tracking;
    }
  }
  const width = x;
  let shift = 0;
  if (run.anchor === "middle") shift = -width / 2;
  else if (run.anchor === "end") shift = -width;
  if (shift !== 0) {
    for (const c of combined.commands) {
      if (c.x !== undefined) c.x += shift;
      if (c.x1 !== undefined) c.x1 += shift;
      if (c.x2 !== undefined) c.x2 += shift;
    }
  }
  return { d: combined.toPathData(2), width };
}

const spec = require("./" + target.spec);
const runs = {};
for (const run of spec) runs[run.id] = runToPath(run);

let tpl = fs.readFileSync(path.join(DIR, target.template), "utf8");
tpl = tpl.replace(/@@x:([\w-]+):([\d.-]+):([\d.-]+)@@/g, (_, id, base, pad) => {
  if (!runs[id]) throw new Error("unknown run in x token: " + id);
  return (parseFloat(base) + runs[id].width + parseFloat(pad)).toFixed(1);
});
tpl = tpl.replace(/@@w:([\w-]+)@@/g, (_, id) => {
  if (!runs[id]) throw new Error("unknown run in w token: " + id);
  return runs[id].width.toFixed(1);
});
tpl = tpl.replace(/@@([\w-]+)@@/g, (_, id) => {
  if (!runs[id]) throw new Error("unknown run token: " + id);
  return runs[id].d;
});

const outFile = path.resolve(DIR, target.out);
fs.writeFileSync(outFile, tpl);
console.log("wrote", outFile, (fs.statSync(outFile).size / 1024).toFixed(1) + "KB");
for (const [id, r] of Object.entries(runs)) console.log(id.padEnd(14), "w=" + r.width.toFixed(1));
