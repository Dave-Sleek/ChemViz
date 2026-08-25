/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomic_mass: number;
  category: string;
  group: number;
  period: number;
  electron_configuration: string;
  electronegativity?: number;
  melting_point?: number;
  boiling_point?: number;
  summary: string;
}

export interface ParsedElement {
  symbol: string;
  count: number;
}

export interface MoleculeData {
  cid?: number;
  name?: string;
  formula: string;
  molecularWeight: number;
  elements: ParsedElement[];
  properties: Record<string, any>;
  description?: string;
  smiles?: string;
  inchi?: string;
  structure3d?: ConformerData;
}

export interface ConformerData {
  atoms: {
    element: string;
    x: number;
    y: number;
    z: number;
  }[];
  bonds: {
    aid1: number;
    aid2: number;
    order: number;
  }[];
}

export type ViewType = 'home' | 'explorer' | 'table' | 'quiz' | 'favorites' | 'help' | 'about';
