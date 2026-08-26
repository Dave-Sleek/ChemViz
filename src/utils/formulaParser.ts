// A robust chemical formula parser
// Supports subscripts, parentheses like Al2(SO4)3, (NH4)2SO4

export function parseFormula(formula: string): { symbol: string; count: number }[] {
  if (!formula || typeof formula !== 'string') return [];
  const result: Record<string, number> = {};
  
  function parse(f: string, multiplier: number = 1) {
    if (!f) return;
    let i = 0;
    while (i < f.length) {
      if (f[i] === '(') {
        // Find matching parenthesis
        let bracketCount = 1;
        let j = i + 1;
        while (j < f.length && bracketCount > 0) {
          if (f[j] === '(') bracketCount++;
          if (f[j] === ')') bracketCount--;
          j++;
        }
        const inner = f.substring(i + 1, j - 1);
        // Find multiplier after parenthesis
        let k = j;
        let numStr = "";
        while (k < f.length && /[0-9]/.test(f[k])) {
          numStr += f[k];
          k++;
        }
        const innerMult = numStr ? parseInt(numStr, 10) : 1;
        parse(inner, multiplier * innerMult);
        i = k;
      } else if (/[A-Z]/.test(f[i])) {
        let symbol = f[i];
        let j = i + 1;
        if (j < f.length && /[a-z]/.test(f[j])) {
          symbol += f[j];
          j++;
        }
        let k = j;
        let numStr = "";
        while (k < f.length && /[0-9]/.test(f[k])) {
          numStr += f[k];
          k++;
        }
        const count = numStr ? parseInt(numStr, 10) : 1;
        result[symbol] = (result[symbol] || 0) + count * multiplier;
        i = k;
      } else {
        i++;
      }
    }
  }

  parse(formula);
  return Object.entries(result).map(([symbol, count]) => ({ symbol, count }));
}

export function formatFormula(formula: string): string {
  if (!formula || typeof formula !== 'string') return '';
  // Replace numbers with subscripts
  return formula.replace(/[0-9]+/g, (match) => {
    return match.split('').map(digit => {
      const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
      return subscripts[parseInt(digit, 10)];
    }).join('');
  });
}
