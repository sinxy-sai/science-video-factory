import {z} from 'zod';

export const formatSchema = z.enum(['landscape', 'portrait']);
export type VideoFormat = z.infer<typeof formatSchema>;

export const visualTypeSchema = z.string().min(1);
export type VisualType = z.infer<typeof visualTypeSchema>;

const audioSchema = z
  .object({
    src: z.string().min(1),
    startFromFrame: z.number().int().nonnegative().default(0),
  })
  .optional();

export const sceneSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  claim: z.string().min(1),
  visual: visualTypeSchema,
  durationInFrames: z.number().int().positive(),
  supportingText: z.string().min(1).optional(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  audio: audioSchema,
});

export type SceneManifest = z.infer<typeof sceneSchema>;

export const episodeManifestSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    language: z.string().min(2),
    format: formatSchema,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    fps: z.number().int().positive().max(120),
    theme: z.string().min(1),
    scenes: z.array(sceneSchema).min(1),
    audio: audioSchema,
  })
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    for (const [index, scene] of value.scenes.entries()) {
      if (ids.has(scene.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['scenes', index, 'id'],
          message: `Duplicate scene id: ${scene.id}`,
        });
      }
      ids.add(scene.id);
    }

    const expectedPortrait = value.format === 'portrait';
    const isPortrait = value.height > value.width;
    if (expectedPortrait !== isPortrait) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['format'],
        message: 'format must match width and height orientation',
      });
    }
  });

export type EpisodeManifest = z.infer<typeof episodeManifestSchema>;

export function totalDurationInFrames(manifest: EpisodeManifest): number {
  return manifest.scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
}
