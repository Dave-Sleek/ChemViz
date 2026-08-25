import { type MoleculeData, type ConformerData } from '../types';
import { parseFormula } from '../utils/formulaParser';
import { elements } from '../data/elements';

const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

const cache: Record<string, MoleculeData> = {};

// Local seed database for common molecules to ensure reliability during PubChem downtime
const CORE_MOLECULES: Record<string, MoleculeData> = {
  'ch4': {
    formula: 'CH4',
    name: 'Methane',
    molecularWeight: 16.04,
    elements: [{ symbol: 'C', count: 1 }, { symbol: 'H', count: 4 }],
    properties: { Complexity: 0, Charge: 0, HBondDonorCount: 0, HBondAcceptorCount: 0 },
    description: 'Methane is the simplest alkane and the main component of natural gas. It is a potent greenhouse gas and a fundamental building block in organic chemistry.',
    structure3d: {
      atoms: [
        { element: 'C', x: 0, y: 0, z: 0 },
        { element: 'H', x: 0.629, y: 0.629, z: 0.629 },
        { element: 'H', x: -0.629, y: -0.629, z: 0.629 },
        { element: 'H', x: 0.629, y: -0.629, z: -0.629 },
        { element: 'H', x: -0.629, y: 0.629, z: -0.629 }
      ],
      bonds: [
        { aid1: 1, aid2: 2, order: 1 },
        { aid1: 1, aid2: 3, order: 1 },
        { aid1: 1, aid2: 4, order: 1 },
        { aid1: 1, aid2: 5, order: 1 }
      ]
    }
  },
  'h2o': {
    formula: 'H2O',
    name: 'Water',
    molecularWeight: 18.015,
    elements: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }],
    properties: { Complexity: 0, Charge: 0, HBondDonorCount: 1, HBondAcceptorCount: 1 },
    description: 'Water is a polar inorganic compound that is at room temperature a tasteless and odorless liquid, nearly colorless with a hint of blue.',
    structure3d: {
      atoms: [
        { element: 'O', x: 0, y: 0, z: 0.117 },
        { element: 'H', x: 0, y: 0.757, z: -0.469 },
        { element: 'H', x: 0, y: -0.757, z: -0.469 }
      ],
      bonds: [
        { aid1: 1, aid2: 2, order: 1 },
        { aid1: 1, aid2: 3, order: 1 }
      ]
    }
  },
  'co2': {
    formula: 'CO2',
    name: 'Carbon Dioxide',
    molecularWeight: 44.01,
    elements: [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }],
    properties: { Complexity: 18.9, Charge: 0, HBondDonorCount: 0, HBondAcceptorCount: 2 },
    description: 'Carbon dioxide is a colorless gas with a density about 53% higher than that of dry air. It consists of a carbon atom covalently double bonded to two oxygen atoms.',
    structure3d: {
      atoms: [
        { element: 'C', x: 0, y: 0, z: 0 },
        { element: 'O', x: 0, y: 0, z: 1.16 },
        { element: 'O', x: 0, y: 0, z: -1.16 }
      ],
      bonds: [
        { aid1: 1, aid2: 2, order: 2 },
        { aid1: 1, aid2: 3, order: 2 }
      ]
    }
  },
  'nh3': {
    formula: 'NH3',
    name: 'Ammonia',
    molecularWeight: 17.031,
    elements: [{ symbol: 'N', count: 1 }, { symbol: 'H', count: 3 }],
    properties: { Complexity: 0, Charge: 0, HBondDonorCount: 1, HBondAcceptorCount: 1 },
    description: 'Ammonia is a compound of nitrogen and hydrogen with the formula NH3. A stable binary hydride, and the simplest pnictogen hydride, ammonia is a colorless gas with a characteristic pungent smell.',
    structure3d: {
      atoms: [
        { element: 'N', x: 0, y: 0, z: 0.113 },
        { element: 'H', x: 0, y: 0.941, z: -0.264 },
        { element: 'H', x: 0.815, y: -0.471, z: -0.264 },
        { element: 'H', x: -0.815, y: -0.471, z: -0.264 }
      ],
      bonds: [
        { aid1: 1, aid2: 2, order: 1 },
        { aid1: 1, aid2: 3, order: 1 },
        { aid1: 1, aid2: 4, order: 1 }
      ]
    }
  }
};

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 5, backoff = 1500): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Handle 503 (Server Busy) and 429 (Too Many Requests)
    if ((response.status === 503 || response.status === 429) && retries > 0) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : backoff;
      
      console.warn(`PubChem Busy (${response.status}). Retrying in ${waitTime}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 10000))); // Cap at 10s for UX
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch error. Retrying in ${backoff}ms... (${retries} retries left)`, error);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export async function fetchMoleculeByFormula(input: string): Promise<MoleculeData | null> {
  const originalInput = input.trim();
  if (!originalInput) return null;
  
  const cacheKey = originalInput.toLowerCase();

  // 0. Check local seed database for zero-latency core compounds
  if (CORE_MOLECULES[cacheKey]) {
    console.log(`Returning seed data for core compound: ${cacheKey}`);
    return CORE_MOLECULES[cacheKey];
  }

  if (cache[cacheKey]) {
    console.log(`Returning cached data for: ${cacheKey}`);
    return cache[cacheKey];
  }

  let serverErrorOccurred = false;

  try {
    console.log(`Searching PubChem for: ${originalInput}`);

    // 0. If input is a direct CID (numeric)
    if (/^\d+$/.test(originalInput)) {
      const result = await fetchMoleculeByCID(parseInt(originalInput, 10), originalInput);
      if (result) cache[cacheKey] = result;
      return result;
    }

    // 1. Find CID by name
    const tryLookup = async (query: string, type: 'name' | 'fastformula') => {
      const url = `${PUBCHEM_BASE_URL}/compound/${type}/${encodeURIComponent(query)}/cids/JSON`;
      const response = await fetchWithRetry(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        return data.IdentifierList?.CID?.[0];
      }
      if (response.status >= 500) serverErrorOccurred = true;
      return null;
    };

    let cid = await tryLookup(originalInput, 'name');
    if (!cid && !serverErrorOccurred && originalInput !== originalInput.toLowerCase()) {
      cid = await tryLookup(originalInput.toLowerCase(), 'name');
    }

    if (cid) {
      const result = await fetchMoleculeByCID(cid, originalInput);
      if (result) cache[cacheKey] = result;
      return result;
    }

    // 2. Try by formula
    if (!serverErrorOccurred) {
      console.warn(`CID by name failed for ${originalInput}, trying fastformula lookup...`);
      cid = await tryLookup(originalInput, 'fastformula');
      
      if (!cid && originalInput !== originalInput.toUpperCase()) {
        cid = await tryLookup(originalInput.toUpperCase(), 'fastformula');
      }
    }

    if (cid) {
      const result = await fetchMoleculeByCID(cid, originalInput);
      if (result) cache[cacheKey] = result;
      return result;
    }
    
    console.error(`All PubChem lookups failed for: ${originalInput}. Server error: ${serverErrorOccurred}`);
    const result = fallbackMolecule(originalInput, serverErrorOccurred);
    if (result) cache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error('Network or Parse error in fetchMoleculeByFormula:', error);
    const result = fallbackMolecule(originalInput, true);
    if (result) cache[cacheKey] = result;
    return result;
  }
}

async function fetchMoleculeByCID(cid: number, originalInput: string): Promise<MoleculeData | null> {
  try {
    console.log(`Fetching data for CID: ${cid}`);
    // 2. Get properties
    const propsUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,Complexity,Charge,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,ExactMass/JSON`;
    const propsResponse = await fetchWithRetry(propsUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    let props;
    if (propsResponse.ok) {
      const propsData = await propsResponse.json();
      props = propsData.PropertyTable.Properties[0];
    } else {
      console.warn(`Complex properties fetch failed for CID ${cid}, trying basic info...`);
      const basicUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight/JSON`;
      const basicResponse = await fetchWithRetry(basicUrl, { headers: { 'Accept': 'application/json' } });
      if (!basicResponse.ok) throw new Error("Could not retrieve even basic molecular properties.");
      const basicData = await basicResponse.json();
      props = basicData.PropertyTable.Properties[0];
    }

    // 3. Get Description
    let description = '';
    try {
      const descResponse = await fetchWithRetry(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/description/JSON`, {
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
    structure3d = await fetch3DConformer(cid);

    // If 3D data is missing, try parent compound (Salts etc.)
    if (!structure3d) {
      console.log(`Checking for parent compound 3D data for CID: ${cid}`);
      try {
        const parentResponse = await fetchWithRetry(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/cids/JSON?cids_type=parent`, {
          headers: { 'Accept': 'application/json' }
        });
        if (parentResponse.ok) {
          const parentData = await parentResponse.json();
          const parentCid = parentData.IdentifierList?.CID?.[0];
          if (parentCid && parentCid !== cid) {
            console.log(`Found parent CID: ${parentCid}, attempting 3D retrieval...`);
            structure3d = await fetch3DConformer(parentCid);
            if (structure3d) {
              description += ` [3D structure visualized from parent compound CID: ${parentCid}]`;
            }
          }
        }
      } catch (e) {
        console.warn('Parent CID lookup failed:', e);
      }
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

async function fetch3DConformer(cid: number): Promise<ConformerData | undefined> {
  try {
    const conformerResponse = await fetchWithRetry(`${PUBCHEM_BASE_URL}/compound/cid/${cid}/JSON?record_type=3d`, {
      headers: { 'Accept': 'application/json' }
    });
    if (conformerResponse.ok) {
      const conformerData = await conformerResponse.json();
      if (conformerData.PC_Compounds?.[0]) {
        const comp = conformerData.PC_Compounds[0];
        const coords = comp.coords?.[0];
        const conformerAtoms = comp.atoms;
        
        if (coords && conformerAtoms && coords.conformers?.[0]) {
          return {
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
    console.warn(`3D Structure fetch failed for CID ${cid}:`, e);
  }
  return undefined;
}

function fallbackMolecule(input: string, serverBusy = false): MoleculeData | null {
  if (!input.trim()) return null;

  // Check if input looks like a formula
  const parsed = parseFormula(input);
  
  const serverMsg = serverBusy ? " The scientific database is currently under high load and could not be reached after multiple attempts." : " The requested compound could not be located in the scientific database.";

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
        description: `This structure was locally synthesized based on the provided chemical formula.${serverMsg}`
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
    description: `${serverMsg} Please verify the formula (e.g., C6H12O6) or try again in a few moments.`
  };
}
