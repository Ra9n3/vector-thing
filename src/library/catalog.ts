import buttons from './templates/buttons.json';
import knobs from './templates/knobs.json';
import faders from './templates/faders.json';
import toggles from './templates/toggles.json';
import cards from './templates/cards.json';
import badges from './templates/badges.json';
import parts from './templates/parts.json';
import type { ComponentTemplate } from './types';
export const BUILTIN_TEMPLATES = [...buttons,...knobs,...faders,...toggles,...cards,...badges,...parts] as ComponentTemplate[];
