export interface SuggestionMolecule {
  formula: string;
  name: string;
  category: string;
}

export const COMMON_MOLECULES: SuggestionMolecule[] = [
  { formula: 'H2O', name: 'Water', category: 'Inorganic' },
  { formula: 'CO2', name: 'Carbon Dioxide', category: 'Inorganic' },
  { formula: 'NaCl', name: 'Sodium Chloride (Salt)', category: 'Inorganic' },
  { formula: 'C6H12O6', name: 'Glucose (Sugar)', category: 'Organic' },
  { formula: 'CH4', name: 'Methane', category: 'Organic' },
  { formula: 'NH3', name: 'Ammonia', category: 'Inorganic' },
  { formula: 'C2H5OH', name: 'Ethanol (Alcohol)', category: 'Organic' },
  { formula: 'C8H10N4O2', name: 'Caffeine', category: 'Organic' },
  { formula: 'C9H8O4', name: 'Aspirin', category: 'Organic' },
  { formula: 'HCl', name: 'Hydrochloric Acid', category: 'Inorganic' },
  { formula: 'H2SO4', name: 'Sulfuric Acid', category: 'Inorganic' },
  { formula: 'NaHCO3', name: 'Sodium Bicarbonate', category: 'Inorganic' },
  { formula: 'C3H8', name: 'Propane', category: 'Organic' },
  { formula: 'C12H22O11', name: 'Sucrose', category: 'Organic' },
  { formula: 'O3', name: 'Ozone', category: 'Inorganic' },
  { formula: 'C6H6', name: 'Benzene', category: 'Organic' },
  { formula: 'N2O', name: 'Nitrous Oxide', category: 'Inorganic' },
  { formula: 'C10H14N2', name: 'Nicotine', category: 'Organic' },
  { formula: 'C20H25N3O', name: 'LSD', category: 'Organic' },
  { formula: 'C17H21NO4', name: 'Cocaine', category: 'Organic' },
  { formula: 'CaCO3', name: 'Calcium Carbonate', category: 'Inorganic' },
  { formula: 'O2', name: 'Oxygen', category: 'Inorganic' },
  { formula: 'N2', name: 'Nitrogen', category: 'Inorganic' },
  { formula: 'KNO3', name: 'Potassium Nitrate', category: 'Inorganic' },
  { formula: 'CH3COOH', name: 'Acetic Acid (Vinegar)', category: 'Organic' },
  { formula: 'NaOH', name: 'Sodium Hydroxide', category: 'Inorganic' },
  { formula: 'KOH', name: 'Potassium Hydroxide', category: 'Inorganic' },
  { formula: 'CH3OH', name: 'Methanol', category: 'Organic' },
  { formula: 'MgSO4', name: 'Magnesium Sulfate', category: 'Inorganic' }
];
