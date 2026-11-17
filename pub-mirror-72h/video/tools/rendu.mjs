// Rendu de la scène avec Chromium (Playwright).
//   node tools/rendu.mjs stills --times 0.5,3,6 --dpr 0.5 --dir out/essai
//   node tools/rendu.mjs video --dpr 2 --fps 30 --workers 4 --out out/muet.mp4 [--crf 16] [--scene luxe/index.html] [--query st=0]
import { createServer } from 'node:http';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), mode = args[0];
const opt = k => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : undefined; };
const dpr = parseFloat(opt('dpr') || '1'), fps = parseInt(opt('fps') || '30'), workers = parseInt(opt('workers') || '4');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try { const p = join(ROOT, decodeURIComponent(req.url.split('?')[0])); const b = await readFile(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const scenePath = opt('scene') || 'scene/index.html', extra = opt('query') ? '&' + opt('query') : '';
const url = `http://127.0.0.1:${server.address().port}/${scenePath}?dpr=${dpr}${extra}`;

const browser = await chromium.launch({ args: ['--disable-web-security', '--font-render-hinting=none'] });
async function newPage() {
  const page = await browser.newPage({ viewport: { width: Math.round(1080 * dpr), height: Math.round(1920 * dpr) }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('ERREUR PAGE', e.message));
  await page.goto(url);
  await page.addStyleTag({ content: `canvas{width:${1080 * dpr}px!important;height:${1920 * dpr}px!important}` });
  await page.evaluate(() => window.pret);
  return page;
}
async function frame(page, t, type = 'jpeg', transparent = false) {
  await page.evaluate(t => window.draw(t), t);
  return page.screenshot({ type, omitBackground: transparent, quality: type === 'jpeg' ? 95 : undefined, clip: { x: 0, y: 0, width: Math.round(1080 * dpr), height: Math.round(1920 * dpr) } });
}

if (mode === 'stills') {
  const dir = resolve(opt('dir') || 'out/stills'); await mkdir(dir, { recursive: true });
  const page = await newPage();
  for (const t of opt('times').split(',').map(Number)) {
    const b = await frame(page, t, 'png');
    await (await import('node:fs/promises')).writeFile(join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`), b);
  }
  console.log('images dans', dir);
} else if (mode === 'calque') { // images PNG transparentes, pour poser du texte sur une vraie vidéo
  const dir = resolve(opt('dir') || 'out/calque'); await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true });
  const total = Math.round(25 * fps); let next = 0;
  const { writeFile } = await import('node:fs/promises');
  await Promise.all(Array.from({ length: workers }, async () => {
    const page = await newPage();
    while (next < total) { const i = next++; await writeFile(join(dir, `f${String(i).padStart(5, '0')}.png`), await frame(page, i / fps, 'png', true)); }
  }));
  console.log('calque :', dir);
} else if (mode === 'video') {
  const out = resolve(opt('out') || 'out/muet.mp4'), crf = opt('crf') || '16';
  const tmp = out + '.frames'; await rm(tmp, { recursive: true, force: true }); await mkdir(tmp, { recursive: true });
  const total = Math.round(25 * fps); let next = 0, done = 0; const t0 = Date.now();
  const { writeFile } = await import('node:fs/promises');
  await Promise.all(Array.from({ length: workers }, async () => {
    const page = await newPage();
    while (next < total) {
      const i = next++;
      await writeFile(join(tmp, `f${String(i).padStart(5, '0')}.jpg`), await frame(page, i / fps));
      if (++done % 75 === 0) console.log(`${done}/${total} images, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }));
  await new Promise((ok, ko) => {
    const ff = spawn(process.env.FFMPEG_PATH || 'ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(tmp, 'f%05d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out], { stdio: 'inherit' });
    ff.on('exit', c => c === 0 ? ok() : ko(new Error('ffmpeg ' + c)));
  });
  await rm(tmp, { recursive: true, force: true });
  console.log('vidéo :', out);
}
await browser.close(); server.close();
