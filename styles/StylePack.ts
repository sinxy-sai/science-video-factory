/** Shared contract for reusable visual language packs. */
export interface StyleTokens {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  line: string;
  primary: string;
  secondary?: string;
  [key: string]: string | undefined;
}

export interface StyleTypography {
  display: string;
  body: string;
  metadata: string;
  weights: Readonly<Record<string, number>>;
  letterSpacing?: Readonly<Record<string, string>>;
}

export interface StyleMotion {
  defaultEasing: string;
  entrance: string[];
  emphasis: string[];
  exit: string[];
  pacing: Readonly<Record<string, number>>;
}

export interface StyleBackgrounds {
  base: string;
  grid?: string;
  gradients?: Readonly<Record<string, string>>;
  textures?: Readonly<Record<string, string>>;
}

export interface StyleTransitions {
  default: string;
  available: string[];
  durationInFrames: Readonly<Record<string, number>>;
}

export interface StylePack {
  id: string;
  name: string;
  version: string;
  description: string;
  designDocument: string;
  tokens: StyleTokens;
  typography: StyleTypography;
  motion: StyleMotion;
  backgrounds: StyleBackgrounds;
  transitions: StyleTransitions;
  antiPatterns: string[];
}

export type StylePackId = string;

