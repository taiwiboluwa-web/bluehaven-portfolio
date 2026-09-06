import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const pets = ['bubbles-pixel', 'skales-pixel'];
const root = new URL('../public/buddy/', import.meta.url);
const base = 'https://raw.githubusercontent.com/skalesapp/skales/main/pets';

async function download(url, destination) {
  if (existsSync(destination)) return;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download ${url}: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(destination, bytes);
}

await Promise.all(pets.map(async (pet) => {
  const folder = new URL(`${pet}/`, root);
  await mkdir(folder, { recursive: true });
  await download(`${base}/${pet}/spritesheet.png`, new URL('spritesheet.png', folder));
  await download(`${base}/${pet}/pet.json`, new URL('pet.json', folder));
}));

console.log('Buddy assets ready: Bubbles + Skales pixel pets');
