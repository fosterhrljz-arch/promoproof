import fs from 'node:fs/promises';
import path from 'node:path';
const dist = path.resolve('dist');
let html = await fs.readFile(path.join(dist,'index.html'),'utf8');
for (const match of [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)]) {
  const js=await fs.readFile(path.join(dist,match[1]),'utf8');
  html=html.replace(match[0],()=>`<script type="module">${js.replaceAll('</script','<\\/script')}</script>`);
}
for (const match of [...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)]) {
  const css=await fs.readFile(path.join(dist,match[1]),'utf8');
  html=html.replace(match[0],()=>`<style>${css}</style>`);
}
await fs.writeFile(path.join(dist,'index.html'),html);
console.log('Built self-contained dist/index.html. Open directly in a browser; no server required.');
