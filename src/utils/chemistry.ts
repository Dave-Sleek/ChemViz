import { type ParsedElement } from '../types';
import { elements } from '../data/elements';

export function calculateMolarMass(parsedElements: ParsedElement[]): number {
  return parsedElements.reduce((total, item) => {
    const el = elements.find(e => e.symbol === item.symbol);
    return total + (el ? el.atomic_mass * item.count : 0);
  }, 0);
}

export function calculatePercentageComposition(parsedElements: ParsedElement[]): { symbol: string, percentage: number }[] {
  const totalMass = calculateMolarMass(parsedElements);
  if (totalMass === 0) return [];
  
  return parsedElements.map(item => {
    const el = elements.find(e => e.symbol === item.symbol);
    const mass = el ? el.atomic_mass * item.count : 0;
    return {
      symbol: item.symbol,
      percentage: (mass / totalMass) * 100
    };
  });
}

export function getElementColor(symbol: string): string {
  const colors: Record<string, string> = {
    H: '#FFFFFF',
    He: '#D9FFFF',
    Li: '#CC80FF',
    Be: '#C2FF00',
    B: '#FFB5B5',
    C: '#909090',
    N: '#3050F8',
    O: '#FF0D0D',
    F: '#90E050',
    Ne: '#B3E3F5',
    Na: '#AB5CF2',
    Mg: '#8AFF00',
    Al: '#BFA6A6',
    Si: '#F0C8A0',
    P: '#FF8000',
    S: '#FFFF30',
    Cl: '#1FF01F',
    Ar: '#80D1E3',
    K: '#8F40AD',
    Ca: '#3DFF00',
    Fe: '#E06633',
    Cu: '#C88033',
    Zn: '#7D80B0',
    Br: '#A62929',
    I: '#940094',
    Au: '#FFD123',
    Hg: '#B8B8D0',
    Pb: '#575961'
  };
  return colors[symbol] || '#CCCCCC';
}
