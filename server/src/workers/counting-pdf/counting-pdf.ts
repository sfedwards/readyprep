import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { expose } from 'threads/worker';
import { CountingSheet } from '@modules/app/counts/interface/counting-sheet.interface';

expose({
  async generate(data: CountingSheet) {
    const pdf = new jsPDF();

    const y = 18;
    pdf.setFontSize(11);

    const head = [['Pantry Item', 'Amount']];
    const body = data.ingredients.map((ingredient) => [
      ingredient.name,
      `${ingredient.unit}`,
    ]);

    autoTable(pdf, {
      startY: y,
      headStyles: {
        fillColor: '#5C325C',
        textColor: '#FFFFFF',
      },
      bodyStyles: {
        fontSize: 15,
      },
      columnStyles: { 1: { halign: 'right' } },
      head,
      body,
    });

    pdf.addPage();

    if (pdf.internal.pages.length > 1)
      pdf.deletePage(pdf.internal.pages.length - 1);

    return pdf.output(undefined, {
      filename: `ReadyPrep Counting Sheet - ${data.date}.pdf`,
    });
  },
});
