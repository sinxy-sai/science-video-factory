import {z} from 'zod';

export const shotRendererSchema = z.enum(['browser', 'manim', 'blender']);
export type ShotRenderer = z.infer<typeof shotRendererSchema>;

export const visualModeSchema = z.enum(['html', 'svg', 'canvas', 'webgl', 'external']);
export type VisualMode = z.infer<typeof visualModeSchema>;

export const shotOutputKindSchema = z.enum(['mp4', 'webm', 'frame-sequence']);
export type ShotOutputKind = z.infer<typeof shotOutputKindSchema>;

export const shotOutputSchema = z.object({
  kind: shotOutputKindSchema,
  path: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().int().positive().max(120),
  alpha: z.boolean().optional(),
});
export type ShotOutputContract = z.infer<typeof shotOutputSchema>;

export const shotCompositionSchema = z.literal('asset');

export const shotImplementationSchema = z.object({
  sourceRoot: z.string().regex(/^html\/shot-[0-9]{3}$/),
  output: shotOutputSchema,
  composition: shotCompositionSchema.default('asset'),
  visualMode: visualModeSchema.default('html'),
  files: z.array(z.string().min(1)).min(1),
});
export type ShotImplementation = z.infer<typeof shotImplementationSchema>;

