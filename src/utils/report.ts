import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type MoleculeData } from '../types';
import { formatFormula } from './formulaParser';
import { getElement } from '../data/elements';

export const generateMoleculeReport = (molecule: MoleculeData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(22, 27, 34); // Match the app's dark theme (for header bar)
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(molecule.name === 'Unknown Compound' ? molecule.formula : molecule.name, 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('MOLECUFY SCIENTIFIC REPORT', 15, 33);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - 15, 33, { align: 'right' });

  // Formula & Basic Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(molecule.formula, 15, 55);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Molecular Formula', 15, 62);

  // Metrics Table
  const metrics = [
    ['Property', 'Value'],
    ['Molecular Weight', `${molecule.molecularWeight.toFixed(4)} g/mol`],
    ['Exact Mass', `${molecule.properties.ExactMass?.toFixed(4) || 'N/A'}`],
    ['Charge', `${molecule.properties.Charge ?? 0}`],
    ['H-Bond Donors', `${molecule.properties.HBondDonorCount || 0}`],
    ['H-Bond Acceptors', `${molecule.properties.HBondAcceptorCount || 0}`],
    ['Complexity', `${molecule.properties.Complexity || 0}`],
    ['Rotatable Bonds', `${molecule.properties.RotatableBondCount || 0}`]
  ];

  autoTable(doc, {
    startY: 70,
    head: [metrics[0]],
    body: metrics.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // Blue-500
    styles: { fontSize: 10 }
  });

  // Composition Section
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Elemental Composition', 15, finalY + 15);

  const compositionData = molecule.elements.map(el => {
    const element = getElement(el.symbol);
    const weight = element?.atomic_mass || 0;
    const percentage = ((el.count * weight) / molecule.molecularWeight) * 100;
    return [
      el.symbol,
      element?.name || el.symbol,
      el.count.toString(),
      `${percentage.toFixed(2)}%`
    ];
  });

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Symbol', 'Element', 'Atoms', 'Mass %']],
    body: compositionData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] }, // Slate-900
    styles: { fontSize: 10 }
  });

  // Description
  const finalY2 = (doc as any).lastAutoTable.finalY;
  if (molecule.description) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Scientific Description', 15, finalY2 + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitDesc = doc.splitTextToSize(molecule.description, pageWidth - 30);
    doc.text(splitDesc, 15, finalY2 + 22);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Molecufy Molecular Data Engine v4.2.1 — Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`${molecule.formula}_Report.pdf`);
};
