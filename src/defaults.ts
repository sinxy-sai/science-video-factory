export const DEFAULT_COMPOSITION_METADATA = {
  durationInFrames: 1,
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

export function getDefaultCompositionMetadata(): typeof DEFAULT_COMPOSITION_METADATA {
  return {...DEFAULT_COMPOSITION_METADATA};
}
