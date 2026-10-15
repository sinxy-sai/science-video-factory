import {z} from 'zod';

export const shotImplementationSchema = z.object({
  hyperframes: z.boolean().default(false),
  manim: z.boolean().default(false),
  remotion: z.boolean().default(true),
  files: z.array(z.string().min(1)).default([]),
});

export const shotContinuitySchema = z.object({
  leaves: z.array(z.string().min(1)).default([]),
  inherits: z.array(z.string().min(1)).default([]),
});

export const shotAssetSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  source: z.string().min(1),
  publicPath: z.string().min(1),
});

export const shotBriefSchema = z.object({
  id: z.string().regex(/^shot-[0-9]{3}$/),
  sceneId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  narration: z.string().min(1),
  visual: z.string().min(1),
  durationInFrames: z.number().int().positive(),
  continuity: shotContinuitySchema,
  implementation: shotImplementationSchema,
  assets: z.array(shotAssetSchema).default([]),
});

export type ShotBrief = z.infer<typeof shotBriefSchema>;
