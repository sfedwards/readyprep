import { Box, Container, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

import { Footer } from '../../UI/Footer';

const useStyles = makeStyles( {
  root: {
    '& h2, & h3, & p': {
      color: '#111',
    },
  },
} );

export const FaqPage = ( ): ReactElement => {
  const classes = useStyles();

  return (
    <Box className={ classes.root } display="flex" flexDirection="column">
      <Box flex={'0 1 88vh'} pb={2}>

        <Container maxWidth="lg" style={{ paddingTop: 8 }}>

          <h2>ReadyPrep FAQ</h2>

          <h4>What does ReadyPrep do?</h4>
          <p>ReadyPrep is a simple system designed to help restaurant operators gain better insight into food cost and usage requirements.</p>

          <h4>How is the information grouped in the application?</h4>
          <p>The data is structured in four categories: Pantry, Prep, Menu Items and Menus.  Pantry consists of the raw ingredients you buy and use in your recipes.  Prep is the batch recipes you create as intermediate goods for menu items.  Prep can be used in other Prep recipes or in Menu Items.  Menu items are the final plating recipes for items sold to customers.  They can be comprised of Pantry items and Prep items.  The Menu tab allows users to group of individual Menu items into separate menus (Breakfast, Dinner, Brunch) and sections (Appetizers, Drinks, Desserts).  The created Menus provide users with a compete perspective of pricing and cost.</p>

          <h4>What is the best way to begin working with ReadyPrep?</h4>
          <p>There are two ways to begin working with the application.  You can manually create individual items in any of the categories or you can upload data from a spreadsheet template.  Using the spreadsheet requires a bit of advance work to assemble the data, but overall is the quickest way to get to fully-costed menu items.</p>

          <h4>How do I manually add individual items?</h4>
          <p>The system is designed to allow you to start in any of the three categories (Pantry, Prep or Menu Items) and backfill the required information, as necessary.  For instance, you can create a Menu Item and add each item and quantity used in the recipe.  If the item added is not currently in your Pantry or Prep list, the system will prompt you to create the item and categorize it as new Pantry or Prep.  Best practice would be to continue adding and, if necessary, creating items, together with required units until you complete and save the recipe.  Any recipe item that returns a cost of $0 is missing necessary data in the underlying ingredient.  Click on the recipe item to add the required information in the underlying item.  Once complete, you can save the item and return to the recipe using the back arrow on your browser.  Continue this process for each recipe item returning a price of $0.  Alternatively, you can work systematically through the creation of Pantry items followed by Prep recipes and Menu items.</p>

          <h4>How do I upload information in bulk?</h4>
          <p>There is an Import button in the upper right corner above each table.  Selecting this button will give the opportunity to download a template or import data.  First time users should download the template, fill in the required data, and save the spreadsheet on your local device.  Make sure you notice where you save the file locally.  Back on the website, click on the import button and select Import from the dropdown.  From the file finder, select the completed spreadsheet to complete the upload process.   Please note the spreadsheet template contains three worksheets that allow you to upload information for Pantry items, Prep recipes, and Menu items.</p>

          <h4>Can I add or change data in bulk after the initial upload?</h4>
          <p>Yes. If you have saved a clean template, you can add new items to the clean template and upload them just as before.  If you did not, the exported spreadsheet will include the list of all existing items in the database.  You can use this spreadsheet to make changes to any item already in the system (such as price updates) or add new items.  Simply save and reupload the edited spreadsheet to complete the changes.</p>

          <h4>What is waste?  How is it used?</h4>
          <p>You have the option to add a waste factor for all Panty and Prep items on a global and line item basis.  Where you apply the waste factor will affect your cost and utilization rates in different ways.  Waste applied in the Pantry item detail will affect the item globally and result in a higher price per unit for the item when used versus the price per unit paid.  A good example is cauliflower, which typically has an initial waste (based on weight) of 45% prior to initial use.  Line item waste of a recipe is waste that is specific to a recipe and not global.  An example might be parsley, where some recipes require a cook to remove stems and others do not.  Waste at the Prep recipe level is often due to loss from portioning.</p>

          <h4>How do you calculate estimated Par Levels?</h4>
          <p>The system calculates an estimated Par Level based on the user’s weekly sales estimate for Menu items.  Using recipes, stated shelf life for Prep, and order frequency for Pantry items, the systems uses an algorithm to determine an estimated Par for both Pantry items (based on pack size) and Prep items (based on batch size).  Operators can use these estimates to supplement their judgement and experience when placing orders or building daily prep sheets.  Sales estimates can be updated for changes in menu mix and Menu items can be added or removed, resulting in a new Par estimates.</p>

        </Container>
      </Box>
      <Box flex={'1 0 12vh'} display="flex"><Footer /></Box>
    </Box>
  );
};
