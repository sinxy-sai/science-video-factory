import {existsSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const episodeIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const episodesDirectory = resolve(process.cwd(), 'content/episodes');
const registryPath = resolve(episodesDirectory, 'registry.generated.ts');

function toImportAlias(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_, character: string) => character.toUpperCase());
}

function generateRegistry(): void {
  const episodeIds = readdirSync(episodesDirectory)
    .filter((entry) => statSync(resolve(episodesDirectory, entry)).isDirectory())
    .map((entry) => {
      if (!episodeIdPattern.test(entry)) {
        throw new Error(`Invalid episode directory "${entry}". Episode ids must match ${episodeIdPattern}`);
      }
      const episodePath = resolve(episodesDirectory, entry, 'episode.ts');
      if (!existsSync(episodePath)) {
        throw new Error(`Episode directory "${entry}" is missing episode.ts`);
      }
      return entry;
    })
    .sort();

  const imports = episodeIds
    .map((id) => `import {episode as ${toImportAlias(id)}} from './${id}/episode';`)
    .join('\n');
  const entries = episodeIds
    .map((id) => `  [${toImportAlias(id)}.manifest.id]: ${toImportAlias(id)},`)
    .join('\n');

  const output = `// GENERATED FILE. Run npm run generate-registry to update.\nimport type {EpisodeModule} from '../episode-module';\n${imports}\n\nexport const episodeRegistry: Record<string, EpisodeModule> = {\n${entries}\n};\n\nexport function getEpisodeModule(id: string): EpisodeModule {\n  const episode = episodeRegistry[id];\n  if (!episode) {\n    throw new Error(\`Unknown episode "\${id}". Available episodes: \${Object.keys(episodeRegistry).join(', ')}\`);\n  }\n  return episode;\n}\n`;

  writeFileSync(registryPath, output, 'utf8');
}

generateRegistry();
