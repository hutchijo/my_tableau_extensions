# My Tableau Extensions 

This is repository is a Python Flask project which leverages the [Tableau Extensions API](https://tableau.github.io/extensions-api/).

The project contains the two of the sample extensions delivered by Tableau (DataSources and Filtering).

The third extension is an extension of my own creation and it is an Amazon Product Search.  

## Amazon Product Search Extension

The idea for an Amazon Product Search extension came from talking with a person who worked in the Procurement Department of their organization.  They wanted the ability to look at the products they typically procured and compare them with what Amazon is currently selling the same product for.  To do this they had planned to use the Amazon [Product Advertising API](https://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html) in an external application to achieve this goal.  With the advent of Tableau Extensions the user can now simply look up the current products directly from within a Tableau Dashboard.   

![Image of Amazon Product Search Extension](https://raw.githubusercontent.com/hutchijo/my_tableau_extensions/master/static/images/readme1.png)

This extension has *two* elements of integration:  

*The first element of integration allows you to click on a selected mark and the selection will be added to the search input.  This is taking a selected mark out of Tableau and passing it over to the extension code which is external to Tableau.  

*The second element of integration allows you to refresh the Tableau worksheet with the products after a purchase.  In this step when a user selects *"Buy Now"* there is writeback logic which inserts the purchase into a MySQL database table.  When the writeback has been completed the extension code triggers a refresh of the underlying datasource for the Worksheet. 