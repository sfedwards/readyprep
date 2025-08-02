import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RecipesPdfDTO } from '@modules/v1/recipes/interface/recipe-pdf';
import { expose } from 'threads/worker';

expose({
  async generate(data: RecipesPdfDTO) {
    const pdf = new jsPDF();

    if (data.recipes.length === 0) {
      pdf.setFontSize(18);
      pdf.text('No Recipes Selected', 14, 18);
      return pdf.output(undefined, {
        filename: `ReadyPrep Recipes - ${data.date}.pdf`,
      });
    }

    //const image = await datauri(__dirname + '/../../../assets/ReadyPrep.png');

    data.recipes.forEach(async (recipe) => {
      const pageSize = pdf.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

      let lineHeight;
      let y = 18;

      /*pdf.addImage( image, 'PNG', 14, y );
      y += 80/8;
      y += 2;*/

      const title = `${recipe.name} (${recipe.batches} batches)`;

      pdf.setFontSize(18);
      lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
      const splitTitle = pdf.splitTextToSize(title, pageWidth - 35, {});
      pdf.text(splitTitle, 14, y);
      y += splitTitle.length * lineHeight - 3;

      pdf.setFontSize(10);
      pdf.text(
        `Makes ${+(recipe.batchSize * recipe.batches).toFixed(2)} ${
          recipe.batchUnit
        }`,
        14,
        y,
      );
      lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
      y += lineHeight;

      pdf.setFontSize(11);
      lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;

      if (recipe.instructions) {
        y += 4;

        pdf.setFontSize(18);
        lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
        pdf.text('Instructions: ', 14, y);
        y += lineHeight;

        pdf.setFontSize(11);
        lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
        const splitInstructions = pdf.splitTextToSize(
          recipe.instructions,
          pageWidth - 35,
          {},
        );
        pdf.text(splitInstructions, 14, y);
        y += splitInstructions.length * lineHeight;
      }

      pdf.setFontSize(11);
      lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;

      const head = [['Ingredient', 'Amount']];
      const body = recipe.ingredients.map((ingredient) => [
        ingredient.name,
        `${+(ingredient.amount * recipe.batches).toFixed(2)} ${
          ingredient.unit
        }`,
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
        head,
        body,
      });

      pdf.addPage();
    });

    if (pdf.internal.pages.length > 1)
      pdf.deletePage(pdf.internal.pages.length - 1);

    return pdf.output(undefined, {
      filename: `ReadyPrep Recipes - ${data.date}.pdf`,
    });
  },
});
