import {validatePlanning} from '../production/planning';

const [episodeId] = process.argv.slice(2);
if (!episodeId) {
  console.error('Usage: npm run validate-planning -- <episode-id>');
  process.exit(1);
}
try {
  const {contentPlan, shotDesign} = validatePlanning(episodeId);
  console.log(`Valid planning: ${episodeId}`);
  console.log(`  content-plan.md: ${contentPlan.characters} characters`);
  console.log(`  shot-design.md: ${shotDesign.characters} characters`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
