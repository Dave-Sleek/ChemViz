import { type MoleculeData, type ConformerData } from '../types';
import { parseFormula } from '../utils/formulaParser';
import { elements } from '../data/elements';

const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

export async function fetchMoleculeByFormula(input: string): Promise<MoleculeData | null> {
  if (!input.trim()) return null;
  
  try {
    console.log(`Searching PubChem for: ${input}`);
    // 1. Find CID by formula or name
    const cidUrl = `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(input)}/cids/JSON`;
    const cidResponse = await fetch(cidUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!cidResponse.ok) {
      console.warn(`CID by name failed for ${input}: ${cidResponse.status} ${cidResponse.statusText}`);
      // Try by formula if name fails
      const formulaUrl = `${PUBCHEM_BASE_URL}/compound/fastformula/${encodeURIComponent(input)}/cids/JSON`;
      const cidByFormulaResponse = await fetch(formulaUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!cidByFormulaResponse.ok) {
        console.warn(`CID by formula failed for ${input}: ${cidByFormulaResponse.status} ${cidByFormulaResponse.statusText}`);
        return fallbackMolecule(input);
      }
      
      const cidByFormulaData = await cidByFormulaResponse.json();
      if (!cidByFormulaData.IdentifierList?.CID?.[0]) {
        return fallbackMolecule(input);
      }
      return fetchMoleculeByCID(cidByFormulaData.IdentifierList.CID[0], input);
    }

    const cidData = await cidResponse.json();
    if (!cidData.IdentifierList?.CID?.[0]) {
      return fallbackMolecule(input);
    }

    return fetchMoleculeByCID(cidData.IdentifierList.CID[0], input);
  } catch (error) {
    console.error('Network or Parse error in fetchMoleculeByFormula:', error);
    return fallbackMolecule(input);
  }
}

async function fetchMoleculeByCID(cid: number, originalInput: string): Promise<MoleculeData | null> {
  try {
    console.log(`Fetching data for CID: ${cid}`);
    // 2. Get properties
    const propsUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,Complexity,Charge,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,ExactMass/JSON`;
    const propsResponse = await fetch(propsUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!propsResponse.ok) {
      throw new Error(`Properties fetch failed: ${propsResponse.status}`);
    }
    
    const propsData = await propsResponse.json();
    const props = propsData.PropertyTable.Properties[0];

    // 3. Get Description
    let description = '';
    try {
      const descResponse = await fetch(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/description/JSON`, {
        headers: { 'Accept': 'application/json' }
      });
      if (descResponse.ok) {
        const descData = await descResponse.json();
        description = descData.InformationList?.Information?.[0]?.Description || 
                      descData.InformationList?.Information?.[1]?.Description || '';
      }
    } catch (e) { 
      console.warn('Description fetch failed (non-critical):', e);
    }

    // 4. Get 3D Conformer
    let structure3d: ConformerData | undefined;
    try {
      const conformerResponse = await fetch(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/JSON?record_type=3d`, {
        headers: { 'Accept': 'application/json' }
      });
      if (conformerResponse.ok) {
        const conformerData = await conformerResponse.json();
        if (conformerData.PC_Compounds?.[0]) {
          const comp = conformerData.PC_Compounds[0];
          const coords = comp.coords?.[0];
          const conformerAtoms = comp.atoms;
          
          if (coords && conformerAtoms && coords.conformers?.[0]) {
            structure3d = {
              atoms: conformerAtoms.element.map((el: number, idx: number) => {
                const elementInfo = elements.find(e => e.number === el);
                return {
                  element: elementInfo?.symbol || '?',
                  x: coords.conformers[0].x[idx],
                  y: coords.conformers[0].y[idx],
                  z: coords.conformers[0].z[idx]
                };
              }),
              bonds: comp.bonds ? comp.bonds.aid1.map((aid1: number, idx: number) => ({
                aid1,
                aid2: comp.bonds.aid2[idx],
                order: comp.bonds.order[idx]
              })) : []
            };
          }
        }
      }
    } catch (e) {
      console.warn('3D Structure fetch failed (non-critical):', e);
    }

    const formula = props.MolecularFormula;
    const parsedElements = parseFormula(formula);

    return {
      cid,
      name: props.IUPACName || originalInput,
      formula,
      molecularWeight: props.MolecularWeight,
      elements: parsedElements,
      properties: props,
      description,
      smiles: props.CanonicalSMILES,
      structure3d
    };
  } catch (error) {
    console.error('Error in fetchMoleculeByCID:', error);
    return fallbackMolecule(originalInput);
  }
}

function fallbackMolecule(input: string): MoleculeData | null {
  // Check if input looks like a formula
  const parsed = parseFormula(input);
  if (parsed.length === 0) return null;

  let totalWeight = 0;
  for (const item of parsed) {
    const el = elements.find(e => e.symbol === item.symbol);
    if (el) {
      totalWeight += el.atomic_mass * item.count;
    } else {
      return null; // Unknown element
    }
  }

  return {
    formula: input,
    name: 'Unknown Compound',
    molecularWeight: totalWeight,
    elements: parsed,
    properties: {},
  };
}
