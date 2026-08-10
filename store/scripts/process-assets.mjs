import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'C:/Users/16186/OneDrive/Documents/prueba/images';
const OUT = 'C:/Users/16186/OneDrive/Documents/prueba/public/assets';

const NAMES = {
  models: {
    dir: 'characters',
    height: 1500,
    slugs: [
      'athlete-01', 'athlete-02', 'athlete-03', 'athlete-04',
      'athlete-05', 'athlete-06', 'athlete-07', 'athlete-08',
    ],
  },
  Shirts: {
    dir: 'tops',
    height: 1100,
    slugs: [
      'core-tee-graphite', 'baseline-tee-chalk', 'signal-run-tee-ember',
      'offgrid-boxy-tee-slate', 'studio-oversized-tee-bone', 'thermo-mesh-tee-teal',
      'voltage-speed-tee-volt', 'nightshift-half-zip-void',
      'longline-base-layer-glacier', 'recovery-hoodie-sand',
    ],
  },
  Shoes: {
    dir: 'footwear',
    height: 1000,
    slugs: [
      'flux-runner-ember', 'voltcell-2-volt', 'aero-glide-glacier',
      'phantom-trainer-void', 'meridian-low-bone', 'hydra-trail-abyss',
      'dune-court-sand', 'redline-gt-scarlet', 'cirrus-lite-chalk',
      'terra-field-moss',
    ],
  },
  pants: {
    dir: 'bottoms',
    height: 1200,
    slugs: [
      'rig-cargo-jogger-black', 'field-cargo-pant-olive', 'stretch-denim-jogger-indigo',
      'wash-denim-cargo-ice', 'studio-cargo-pant-bone', 'thermo-jogger-teal',
      'blackout-cargo-void', 'utility-jogger-graphite',
    ],
  },
};

/**
 * Bounding box of the real subject.
 *
 * A plain min/max over opaque pixels is fooled by the stray hairlines a few of
 * these renders carry in the margins, so a row or column only counts as content
 * once enough of its pixels are opaque. That discards 1px artifacts while still
 * keeping the soft baked-in shadows under the footwear.
 */
async function alphaBounds(file, threshold = 10) {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const { data } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const cols = new Uint32Array(width);
  const rows = new Uint32Array(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        cols[x]++;
        rows[y]++;
      }
    }
  }

  /*
   * A few renders carry a faint stripe against the canvas edge, far from the
   * subject and dense enough to survive any sane per-line threshold. Grouping
   * lines into runs and keeping the heaviest run drops those islands without
   * touching the shadows, which are contiguous with the product.
   */
  const span = (counts) => {
    const floor = Math.max(2, Math.round(Math.max(...counts) * 0.01));
    const maxGap = Math.max(8, Math.round(counts.length * 0.02));
    const runs = [];
    let start = -1;
    let gap = 0;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] >= floor) {
        if (start < 0) start = i;
        runs[runs.length - 1] && gap > 0 && (gap = 0);
        gap = 0;
        if (!runs.length || runs[runs.length - 1].end < start) {
          if (!runs.length || runs[runs.length - 1].start !== start) {
            runs.push({ start, end: i, mass: 0 });
          }
        }
        const run = runs[runs.length - 1];
        run.end = i;
        run.mass += counts[i];
      } else if (start >= 0) {
        gap++;
        if (gap > maxGap) {
          start = -1;
          gap = 0;
        }
      }
    }
    if (!runs.length) return null;
    const best = runs.reduce((a, b) => (b.mass > a.mass ? b : a));
    return [best.start, best.end];
  };

  const x = span(cols);
  const y = span(rows);
  if (!x || !y) return null;
  return { left: x[0], top: y[0], width: x[1] - x[0] + 1, height: y[1] - y[0] + 1 };
}

const manifest = {};
let totalIn = 0;
let totalOut = 0;

for (const [srcDir, cfg] of Object.entries(NAMES)) {
  const outDir = path.join(OUT, cfg.dir);
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(path.join(SRC, srcDir)))
    .filter((f) => f.toLowerCase().endsWith('.png'))
    .sort((a, b) => {
      const n = (s) => parseInt(/\((\d+)\)/.exec(s)?.[1] ?? '0', 10);
      return n(a) - n(b);
    });

  manifest[cfg.dir] = [];

  for (let i = 0; i < files.length; i++) {
    const slug = cfg.slugs[i];
    if (!slug) continue;
    const src = path.join(SRC, srcDir, files[i]);
    const box = await alphaBounds(src);

    // 2% breathing room so soft shadows and antialiased edges are not clipped.
    const pad = Math.round(Math.max(box.width, box.height) * 0.02);
    const meta = await sharp(src).metadata();
    const region = {
      left: Math.max(0, box.left - pad),
      top: Math.max(0, box.top - pad),
      width: Math.min(meta.width - Math.max(0, box.left - pad), box.width + pad * 2),
      height: Math.min(meta.height - Math.max(0, box.top - pad), box.height + pad * 2),
    };

    const dest = path.join(outDir, `${slug}.webp`);
    const info = await sharp(src)
      .extract(region)
      .resize({ height: cfg.height, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5, alphaQuality: 90 })
      .toFile(dest);

    const inKb = Math.round((await sharp(src).metadata()).size / 1024) || 0;
    totalIn += inKb;
    totalOut += Math.round(info.size / 1024);

    manifest[cfg.dir].push({
      slug,
      src: `/assets/${cfg.dir}/${slug}.webp`,
      width: info.width,
      height: info.height,
      ratio: +(info.width / info.height).toFixed(3),
      kb: Math.round(info.size / 1024),
      trimmedFrom: `${meta.width}x${meta.height}`,
    });
  }
}

await writeFile(
  'C:/Users/16186/OneDrive/Documents/prueba/src/data/asset-manifest.json',
  JSON.stringify(manifest, null, 2)
);

console.log(JSON.stringify(manifest, null, 1));
console.log(`\nTOTAL OUT: ${Math.round(totalOut / 1024)} MB across ${Object.values(manifest).flat().length} files`);
