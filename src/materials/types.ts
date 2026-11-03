export interface Material {
  id: string;
  label: string;
  color: string;
  opacity: number;
  specular: number;
  shininess: number;
  metallic: number;
  contrast: number;
  glow?: { color: string; radius: number; strength: number };
  texture?: { type: 'speckle' | 'brushed'; amount: number };
}

export interface InlineMaterial {
  base: string;
  color: string;
  id: string;
}
export type MaterialRef = string | InlineMaterial;
