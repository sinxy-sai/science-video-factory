import {resolveDependencyPaths, missingProjectDependencies} from '../lib/project-dependencies';

const paths = resolveDependencyPaths();
console.log(`Project root: ${paths.root}`);
console.log(`Python: ${paths.python ?? 'MISSING (.venv)'}`);
console.log(`Manim: ${paths.manim ?? 'MISSING (.venv)'}`);
console.log(`FFmpeg: ${paths.ffmpeg ?? 'MISSING (tools/ffmpeg)'}`);
console.log(`FFprobe: ${paths.ffprobe ?? 'MISSING (tools/ffmpeg)'}`);

const missing = missingProjectDependencies();
if (missing.length > 0) {
  console.error(`Missing project dependencies: ${missing.join(', ')}`);
  process.exit(1);
}
console.log('Project dependencies are ready.');
