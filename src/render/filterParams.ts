import type { Material } from '../materials/types';
import { AMBIENT, DIFFUSE, LIGHT, SHININESS, SPEC } from './lighting';
import { colorString, specularTint, surfaceContrast, surfaceMaterial } from './shade';

export function filterParams(material: Material) {
  const m = surfaceMaterial(material);
  const norm = AMBIENT + DIFFUSE * LIGHT.z;
  const c = surfaceContrast(m);
  return {
    diffuseConstant: Math.max(0, c * DIFFUSE / norm),
    ambientConstant: Math.max(0, (1 - c) + c * AMBIENT / norm),
    specularConstant: SPEC * m.specular,
    specularExponent: SHININESS * m.shininess,
    specularColor: colorString(specularTint(m)),
  };
}
