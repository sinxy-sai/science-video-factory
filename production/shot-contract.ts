import {z} from 'zod';

export const shotRendererSchema = z.enum(['browser', 'manim', 'composite', 'blender']);
export type ShotRenderer = z.infer<typeof shotRendererSchema>;

export const layerRendererSchema = z.enum(['browser', 'manim', 'blender']);
export type LayerRenderer = z.infer<typeof layerRendererSchema>;

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

const sourceRootSchema = z.string().regex(/^(?:html|manim)\/shot-[0-9]{3}(?:\/[a-z0-9-]+)*$/);

export const shotLayerSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  renderer: layerRendererSchema,
  sourceRoot: sourceRootSchema,
  entryPoint: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).optional(),
  output: shotOutputSchema,
  visualMode: visualModeSchema.default('html'),
  files: z.array(z.string().min(1)).min(1),
  zIndex: z.number().int(),
  alpha: z.boolean().default(false),
  durationInFrames: z.number().int().positive(),
});

const singleShotImplementationSchema = z.object({
  sourceRoot: sourceRootSchema,
  entryPoint: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).optional(),
  output: shotOutputSchema,
  composition: z.literal('asset').default('asset'),
  visualMode: visualModeSchema.default('html'),
  files: z.array(z.string().min(1)).min(1),
});

const layeredShotImplementationSchema = z.object({
  output: shotOutputSchema,
  composition: z.literal('layered'),
  layers: z.array(shotLayerSchema).min(2),
}).superRefine((implementation, ctx) => {
  const ids = new Set<string>();
  const zIndexes = new Set<number>();
  for (const [index, layer] of implementation.layers.entries()) {
    if (ids.has(layer.id)) ctx.addIssue({code: z.ZodIssueCode.custom, path: ['layers', index, 'id'], message: 'Layer ids must be unique'});
    if (zIndexes.has(layer.zIndex)) ctx.addIssue({code: z.ZodIssueCode.custom, path: ['layers', index, 'zIndex'], message: 'Layer zIndex values must be unique'});
    if (layer.output.width !== implementation.output.width || layer.output.height !== implementation.output.height || layer.output.fps !== implementation.output.fps) {
      ctx.addIssue({code: z.ZodIssueCode.custom, path: ['layers', index, 'output'], message: 'Layer output dimensions and fps must match the shot output'});
    }
    if (layer.alpha && !layer.output.alpha) ctx.addIssue({code: z.ZodIssueCode.custom, path: ['layers', index, 'output', 'alpha'], message: 'Transparent layers must declare output.alpha'});
    if (layer.alpha && layer.output.kind !== 'frame-sequence') ctx.addIssue({code: z.ZodIssueCode.custom, path: ['layers', index, 'output', 'kind'], message: 'Transparent layers must use frame-sequence output'});
    ids.add(layer.id);
    zIndexes.add(layer.zIndex);
  }
  const bottom = implementation.layers.reduce((lowest, layer) => layer.zIndex < lowest.zIndex ? layer : lowest, implementation.layers[0]);
  if (bottom.alpha) ctx.addIssue({code: z.ZodIssueCode.custom, path: ['layers'], message: 'The bottom layer must be opaque'});
  if (!implementation.layers.some((layer) => layer.zIndex === Math.min(...implementation.layers.map((item) => item.zIndex)))) {
    ctx.addIssue({code: z.ZodIssueCode.custom, path: ['layers'], message: 'Layered shots require a bottom layer'});
  }
});

export const shotImplementationSchema = z.union([singleShotImplementationSchema, layeredShotImplementationSchema]);
export type ShotImplementation = z.infer<typeof shotImplementationSchema>;
export type ShotLayer = z.infer<typeof shotLayerSchema>;
export const isLayeredImplementation = (implementation: ShotImplementation): implementation is z.infer<typeof layeredShotImplementationSchema> => implementation.composition === 'layered';
export const implementationFiles = (implementation: ShotImplementation): string[] => isLayeredImplementation(implementation) ? implementation.layers.flatMap((layer) => layer.files) : implementation.files;

