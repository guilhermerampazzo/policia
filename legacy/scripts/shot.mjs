import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const root = 'E:/coder/audios/telas-html';
const outDir = 'E:/coder/audios/telas';
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  ['index.html', 'landing-page'],
  ['dashboard-aluno.html', 'dashboard-aluno'],
  ['caderno-erros.html', 'caderno-de-erros'],
  ['painel-mentor.html', 'painel-do-mentor'],
  ['edital-verticalizado.html', 'edital-verticalizado-ia'],
  ['chat.html', 'chat-mentor-aluno'],
];

const viewports = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  for (const [file, name] of pages) {
    const url = 'file:///' + path.join(root, file).replace(/\\/g, '/');
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    // fixed prototype nav "sticks" to the top when Chromium stitches a fullPage
    // screenshot; hide it only for the capture, the live page keeps it.
    await page.addStyleTag({ content: '.proto-nav, .proto-nav-mobile { display: none !important; }' });
    const out = path.join(outDir, `${name}--${vp.tag}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log('saved', out);
  }
  await page.close();
}
await browser.close();
