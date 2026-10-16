import type {StylePack, StylePackId} from './StylePack';
import {backgrounds} from './information-grid/backgrounds';
import {motion} from './information-grid/motion';
import {tokens} from './information-grid/tokens';
import {transitions} from './information-grid/transitions';
import {typography} from './information-grid/typography';

export const informationGridStylePack: StylePack = {
  id: 'information-grid',
  name: 'Information Grid',
  version: '1.0.0',
  description: 'A cool laboratory grid language for information diagrams and measured data.',
  designDocument: 'styles/information-grid/DESIGN.md',
  tokens,
  typography,
  motion,
  backgrounds,
  transitions,
  antiPatterns: [
    'poster typography',
    'generic title-card layouts',
    'vermilion accents',
    'decorative texture that obscures diagrams',
  ],
};

const stylePacks: Readonly<Record<StylePackId, StylePack>> = {
  [informationGridStylePack.id]: informationGridStylePack,
};

export const stylePackRegistry = stylePacks;
export const STYLE_PACKS = stylePacks;
export const registeredStylePacks = Object.freeze(Object.keys(stylePacks));

export function hasStylePack(id: string): boolean {
  return id in stylePacks;
}

export function loadStylePack(id: string): StylePack {
  const pack = stylePacks[id];
  if (!pack) {
    throw new Error(`Unknown style pack: ${id}. Available style packs: ${registeredStylePacks.join(', ') || '(none)'}`);
  }
  return pack;
}

/** Alias used by consumers that treat registry access as a lookup. */
export const getStylePack = loadStylePack;
export const isStylePackRegistered = hasStylePack;

export default stylePackRegistry;

