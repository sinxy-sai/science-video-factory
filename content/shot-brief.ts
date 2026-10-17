import {z} from 'zod';
import {shotImplementationSchema, shotRendererSchema, shotLayerSchema, type ShotRenderer} from '../production/shot-contract';
export {shotImplementationSchema, shotRendererSchema, shotLayerSchema};
export type {ShotRenderer};

export const shotPacingSchema = z.enum(['slow', 'measured', 'fast', 'explosive']);

export const shotContinuitySchema = z.object({
  leaves: z.array(z.string().min(1)).default([]),
  inherits: z.array(z.string().min(1)).default([]),
});

export const shotAssetSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  source: z.string().min(1),
  staticPath: z.string().min(1),
});

export const shotVisualDirectionSchema = z.object({
  composition: z.string().min(1),
  focalPoint: z.string().min(1),
  hierarchy: z.array(z.string().min(1)).min(1),
  palette: z.string().min(1),
  typography: z.string().min(1),
  texture: z.string().min(1).optional(),
});

export const shotMotionSchema = z.object({
  entrance: z.string().min(1),
  transformation: z.string().min(1),
  exit: z.string().min(1),
  transition: z.string().min(1),
  pacing: shotPacingSchema,
});

export const shotQualityChecksSchema = z.object({
  lint: z.boolean().default(true),
  validate: z.boolean().default(true),
  inspect: z.boolean().default(true),
  animationMap: z.boolean().default(true),
  strict: z.boolean().default(true),
});

export const shotBriefSchema = z.object({
  id: z.string().regex(/^shot-[0-9]{3}$/),
  sceneId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  narration: z.string().min(1),
  visual: z.string().min(1),
  renderer: shotRendererSchema.default('browser'),
  visualStyle: z.string().min(1),
  visualDirection: shotVisualDirectionSchema,
  motion: shotMotionSchema,
  durationInFrames: z.number().int().positive(),
  continuity: shotContinuitySchema,
  implementation: shotImplementationSchema,
  qualityChecks: shotQualityChecksSchema,
  assets: z.array(shotAssetSchema).default([]),
}).superRefine((brief, ctx) => {
  if (brief.renderer !== 'composite' || brief.implementation.composition !== 'layered') return;
  for (const [index, layer] of brief.implementation.layers.entries()) {
    if (layer.durationInFrames !== brief.durationInFrames) ctx.addIssue({code: z.ZodIssueCode.custom, path: ['implementation', 'layers', index, 'durationInFrames'], message: 'Layer duration must match the shot duration'});
  }
});

export type ShotBrief = z.infer<typeof shotBriefSchema>;
