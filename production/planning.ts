import {existsSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {z} from 'zod';

export const planningStateSchema = z.enum([
  'discussion',
  'content-approved',
  'storyboard-approved',
  'shot-design-approved',
  'source-authoring',
  'renderer-validation',
  'final-render',
]);

export const planningApprovalsSchema = z.object({
  content: z.boolean(),
  storyboard: z.boolean(),
  shotDesign: z.boolean(),
});

export const planningFrontMatterSchema = z.object({
  state: planningStateSchema,
  approvals: planningApprovalsSchema,
}).strict();

export type PlanningState = z.infer<typeof planningStateSchema>;
export type PlanningApprovals = z.infer<typeof planningApprovalsSchema>;

export const planningThresholdSchema = z.object({
  contentPlanMinChars: z.number().int().positive(),
  shotDesignMinChars: z.number().int().positive(),
});

export type PlanningThresholds = z.infer<typeof planningThresholdSchema>;

export const DEFAULT_PLANNING_THRESHOLDS: PlanningThresholds = {
  contentPlanMinChars: 10_000,
  shotDesignMinChars: 10_000,
};

const approvedStates = new Set<PlanningState>([
  'shot-design-approved',
  'source-authoring',
  'renderer-validation',
  'final-render',
]);

function parseFrontMatter(text: string, path: string): unknown {
  if (!text.startsWith('---')) throw new Error(`${path}: missing YAML front matter`);
  const end = text.indexOf('\n---', 3);
  if (end < 0) throw new Error(`${path}: unterminated YAML front matter`);
  const lines = text.slice(3, end).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const values: Record<string, unknown> = {};
  let inApprovalFields = false;
  for (const line of lines) {
    if (line === 'approvals:') { inApprovalFields = true; continue; }
    if (inApprovalFields && /^(content|storyboard|shot-design):/.test(line)) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (key === 'approvals') continue;
    values[key] = value;
  }
  const approvals: Record<string, boolean> = {};
  let inApprovals = false;
  for (const line of lines) {
    if (line === 'approvals:') { inApprovals = true; continue; }
    if (inApprovals) {
      const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(true|false)$/);
      if (match) approvals[match[1] === 'shot-design' ? 'shotDesign' : match[1]] = match[2] === 'true';
    }
  }
  values.approvals = approvals;
  return planningFrontMatterSchema.parse(values);
}

export function getPlanningThresholds(env: NodeJS.ProcessEnv = process.env): PlanningThresholds {
  const shared = Number(env.PLANNING_MIN_CHARS ?? '');
  const content = Number(env.PLANNING_CONTENT_MIN_CHARS ?? '') || shared || DEFAULT_PLANNING_THRESHOLDS.contentPlanMinChars;
  const shot = Number(env.PLANNING_SHOT_DESIGN_MIN_CHARS ?? '') || shared || DEFAULT_PLANNING_THRESHOLDS.shotDesignMinChars;
  return planningThresholdSchema.parse({contentPlanMinChars: content, shotDesignMinChars: shot});
}

export type PlanningDocument = {
  path: string;
  text: string;
  characters: number;
  frontMatter: z.infer<typeof planningFrontMatterSchema>;
};

export function loadPlanningDocuments(episodeId: string): {contentPlan: PlanningDocument; shotDesign: PlanningDocument} {
  const root = resolve('content', 'episodes', episodeId);
  const read = (name: string): PlanningDocument => {
    const path = join(root, name);
    if (!existsSync(path)) throw new Error(`${episodeId}: missing ${name}`);
    const text = readFileSync(path, 'utf8');
    if (text.trim().length === 0) throw new Error(`${episodeId}: ${name} is empty`);
    return {path, text, characters: text.length, frontMatter: parseFrontMatter(text, `${episodeId}/${name}`) as PlanningDocument['frontMatter']};
  };
  return {contentPlan: read('content-plan.md'), shotDesign: read('shot-design.md')};
}

export function validatePlanning(episodeId: string, thresholds = getPlanningThresholds()): {contentPlan: PlanningDocument; shotDesign: PlanningDocument} {
  const documents = loadPlanningDocuments(episodeId);
  for (const [label, document, minimum] of [
    ['content-plan.md', documents.contentPlan, thresholds.contentPlanMinChars],
    ['shot-design.md', documents.shotDesign, thresholds.shotDesignMinChars],
  ] as const) {
    if (document.characters < minimum) throw new Error(`${episodeId}: ${label} has ${document.characters} characters; requires at least ${minimum}`);
    if (!approvedStates.has(document.frontMatter.state)) throw new Error(`${episodeId}: ${label} state must be shot-design-approved or later (got ${document.frontMatter.state})`);
    if (!document.frontMatter.approvals.content || !document.frontMatter.approvals.storyboard || !document.frontMatter.approvals.shotDesign) {
      throw new Error(`${episodeId}: ${label} requires content, storyboard, and shot-design approvals`);
    }
  }
  return documents;
}
