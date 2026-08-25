import { type MoleculeData, type ConformerData } from '../types';
import { parseFormula } from '../utils/formulaParser';
import { elements } from '../data/elements';

const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

export async function fetchMoleculeByFormula(input: string): Promise<MoleculeData | null> {
  if (!input.trim()) return null;
  
  const trimmedInput = input.trim();

  try {
    console.log(`Searching PubChem for: ${trimmedInput}`);

    // 0. If input is a direct CID (numeric)
    if (/^\d+$/.test(trimmedInput)) {
      return fetchMoleculeByCID(parseInt(trimmedInput, 10), trimmedInput);
    }

    // 1. Find CID by name
    const cidUrl = `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(trimmedInput)}/cids/JSON`;
    const cidResponse = await fetch(cidUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (cidResponse.ok) {
      const cidData = await cidResponse.json();
      if (cidData.IdentifierList?.CID?.[0]) {
        return fetchMoleculeByCID(cidData.IdentifierList.CID[0], trimmedInput);
      }
    }

    // 2. Try by formula if name fails
    console.warn(`CID by name failed for ${trimmedInput}, trying fastformula lookup...`);
    const formulaUrl = `${PUBCHEM_BASE_URL}/compound/fastformula/${encodeURIComponent(trimmedInput)}/cids/JSON`;
    const cidByFormulaResponse = await fetch(formulaUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (cidByFormulaResponse.ok) {
      const cidByFormulaData = await cidByFormulaResponse.json();
      if (cidByFormulaData.IdentifierList?.CID?.[0]) {
        return fetchMoleculeByCID(cidByFormulaData.IdentifierList.CID[0], trimmedInput);
      }
    }
    
    console.error(`All PubChem lookups failed for: ${trimmedInput}`);
    return fallbackMolecule(trimmedInput);
  } catch (error) {
    console.error('Network or Parse error in fetchMoleculeByFormula:', error);
    return fallbackMolecule(trimmedInput);
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
    
    let props;
    if (propsResponse.ok) {
      const propsData = await propsResponse.json();
      props = propsData.PropertyTable.Properties[0];
    } else {
      console.warn(`Complex properties fetch failed for CID ${cid}, trying basic info...`);
      const basicUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight/JSON`;
      const basicResponse = await fetch(basicUrl, { headers: { 'Accept': 'application/json' } });
      if (!basicResponse.ok) throw new Error("Could not retrieve even basic molecular properties.");
      const basicData = await basicResponse.json();
      props = basicData.PropertyTable.Properties[0];
    }

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
  if (!input.trim()) return null;

  // Check if input looks like a formula
  const parsed = parseFormula(input);
  
  if (parsed.length > 0) {
    let totalWeight = 0;
    let hasUnknownElement = false;
    
    for (const item of parsed) {
      const el = elements.find(e => e.symbol === item.symbol);
      if (el) {
        totalWeight += el.atomic_mass * item.count;
      } else {
        hasUnknownElement = true;
        break;
      }
    }

    if (!hasUnknownElement) {
      return {
        formula: input,
        name: `Calculated: ${input}`,
        molecularWeight: totalWeight,
        elements: parsed,
        properties: {},
        description: "This structure was locally synthesized based on the provided chemical formula as the external scientific record was not found."
      };
    }
  }

  // Final fallback for names that don't match or failed formulas
  return {
    formula: '?',
    name: input,
    molecularWeight: 0,
    elements: [],
    properties: {},
    description: "The requested compound could not be located in the scientific database. Please verify the formula (e.g., C6H12O6) or name (e.g., Ethanol)."
  };
}
