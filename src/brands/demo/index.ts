// Marque de démonstration : valeurs brutes. Les polices sont déclarées dans brands/demo/fonts.json.
import type { BrandValues } from '../../tokens/types';
import { comfortable, dark, fonts, light, surfaceDark, surfaceDarker } from '../../tokens/generated/demo';

export const demo: BrandValues = { id: 'demo', light, dark, surfaceDark, surfaceDarker, comfortable, fonts };
export default demo;
