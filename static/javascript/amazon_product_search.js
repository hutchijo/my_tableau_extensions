
// Look to see when the document is done loading
$(document).ready(function () {

    // Log a message to the console 
    console.log('Document Ready...proceeding to Initialize Tableau Extensions');

    // Define variables
    let unregisterEventHandlerFunction;

    // Instantiate a dashboard extension
    tableau.extensions.initializeAsync().then(function () {

        // Attempt to get set up the selected marks handler 
        try
        {
            // Get the current dashboard name 
            dashboardName = tableau.extensions.dashboardContent.dashboard.name;

            // Get the worksheets
            worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

            // Get the worksheet
            worksheet = getSelectedSheet('Current Inventory');

            // Add a listener for marks selection on the worksheet
            unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
                getSelectedMarks('Current Inventory');
            });

        }
        catch (err)
        {
            // Log the error to the console
            console.log(err);
        }
    });

    // Handle the search button click for the product search
    $('#searchButton').click(function () {

        // Check for a product
        if ($("#curr_product").val() != '') {

            // Set the label for the current date
            curr_product = $('#curr_product').val();

            // Call the function that runs the product search
            runAjaxProductSearch(curr_product, 'multi_search');
        }
        else {

            // Alert the user they need to provide a product
            $('#divAlert').text('Please provide a product before searching');

        }
    });

});

// Function to get the selected sheet
function getSelectedSheet(worksheetName) {

    // Go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });

}

// Function to refresh \ reload a worksheet after a database update
function refreshWorksheet()
{
    
    // Log a message to the console
    console.log('Attempting to refresh the worksheet');
    
    // Instantiate a dashboard extension
    tableau.extensions.initializeAsync().then(function () {
        
        // Get the worksheet
        worksheet = getSelectedSheet('Current Inventory');

        // Call the function which will get the datasources for this worksheet
        refreshDataSource(worksheet);
        
     });
}

// Function to refresh the datasource
function refreshDataSource(worksheet)
{
        // Get the datasources attached to the worksheet
        worksheet.getDataSourcesAsync().then(data => {         

            // Find the datasource in the data object
            curr_datasource = data.find(curr_datasource => curr_datasource.name);

            // Find the fields in the data source
            fields = curr_datasource.fields;

            // DEBUG ONLY
            console.log(fields);
            
            //Refresh the datasource
            curr_datasource.refreshAsync().then(function () {
              console.log(curr_datasource.name + ': Refreshed Successfully');
            });
        
        }).catch(error => console.log(error));
}
// Function to get the selected marks
function getSelectedMarks(worksheetName){

    // Attempt to get the selected mark
    try
    {
        // Log a message to the console
        console.log('Attmepting to get the selected marks.');

        // Get the worksheet
        worksheet = getSelectedSheet(worksheetName);

        // Get all of the selected marks
        worksheet.getSelectedMarksAsync().then(function (marks) {

            // Get the first data table for our selected marks 
            worksheetData = marks.data[0];

            // See if we have any selected items
            if (worksheetData.totalRowCount == 0)
            {
                 // Log a message to the console
                console.log('There are no selected marks.');
                
                 // Set the current product to be empty
                $("#curr_product").val('');    
            }
            else
            {
                // Get the first product selected
                var curr_product = worksheetData.data[0][0].formattedValue;
                
                // Log a message to the console
                console.log('Setting the product to search for to be ' + curr_product);
                
                // Set the current product for the input value
                $("#curr_product").val(curr_product);    
            }
        });
    }
    catch (err)
    {
       // Log the error to the console
       console.log(err);
    }
}

// Function to buy a product - note this doesn't really buy the product 
function productDetails(product_asin)
{
    // Perform the Search again with just the ASIN
    runAjaxProductSearch(product_asin, 'single_search');

    // Hide the Product Search Capabilities                
    $('#rowProduct').hide();
    $('#rowProductLabel').hide();        
    $('#rowSearchButton').hide();

}

// Function to writeback to the database the details of the purchased product
function buyNow(curr_product)
{
    // Get the values we will use in the database writeback 
    product_quantity = $("#qtySelect").val()

    // Create a variable for the product info
    product_to_buy = JSON.stringify({curr_product, product_quantity});

      // Perform the AJAX post to writeback to our database
      $.ajax({
            type: 'POST'
            , url: '/writeback_to_db'
            , data: product_to_buy
            , contentType: 'application/json'
            , beforeSend: function () {

                // Show the loading image 
                $('#loader').show();
            }
            , complete: function () {

                // Hide the loading image
                $('#loader').hide();
            }
            , success: function (response) {

                 // Add the response into the divAlert and set the appropriate class
                $('#divSuccess').show();    
                $('#divSuccess').text('Product successfully purchased!');
                $('#divSuccess').slideUp(500).delay(5000);

                 // Show the Product Search Capabilities                
                $('#rowProduct').show();
                $('#rowProductLabel').show();        
                $('#rowSearchButton').show();

                // Clear out the existing search results as we completed the purchase
                $('#div_search_results').empty();
                $('#curr_product').val(''); 

                $('#divAlert').text('Please provide a product to search for on Amazon.');
                $('#divAlert').addClass("alert-warning");
                $('#divAlert').removeClass("alert-success");
                $('#divAlert').removeClass("alert-danger");

                // Call the function to refresh the worksheet
                refreshWorksheet();
                
                return false;
            }
        });
}

// Function to run the Ajax Product Search
function runAjaxProductSearch(curr_product, search_type)
{
      // Create a variable for the search criteria
      search_criteria = JSON.stringify({
          curr_product
      });

        // Using AJAX post to Search
        $.ajax({
            type: 'POST'
            , url: '/amazon_product_search'
            , data: search_criteria
            , contentType: 'application/json'
            , beforeSend: function () {

                // Show the loading image 
                $('#loader').show();
            }
            , complete: function () {

                // Hide the loading image
                $('#loader').hide();
            }
            , success: function (response) {

                // Clear out the value for the curr_product
                $('#search_criteria').val('');

                // See if we have a single product or multiple products
                if (search_type == 'single_search')
                {
                     // Add the response into the divAlert and set the appropriate class
                    $('#divAlert').text('Specify the quantity you would like to purchase');
                    $('#divAlert').addClass("alert-warning");
                    $('#divAlert').removeClass("alert-success");
                    $('#divAlert').removeClass("alert-danger");
                }
                else
                {
                    // Add the response into the divAlert 
                    $('#divAlert').text(response[0]);

                    // Set the style for the alert div based on the return status
                    switch(response[1]) {
                        case "Success":
                            $('#divAlert').addClass("alert-success");
                            $('#divAlert').removeClass("alert-danger");
                            $('#divAlert').removeClass("alert-warning");
                            break;
                        case "Error":
                            $('#divAlert').addClass("alert-danger");
                            $('#divAlert').removeClass("alert-success");
                            $('#divAlert').removeClass("alert-warning");
                            break;
                        default:
                            $('#divAlert').addClass("alert-warning");
                            $('#divAlert').removeClass("alert-success");
                            $('#divAlert').removeClass("alert-danger");
                    }

                }

                // Slowly reveal the results
                $('#div_search_results').slideDown("slow");

                // Loop through the returned JSON and display the results 
                loop_json(response[2], 'div_search_results', search_type);                    
                return false;
            }
        });
}

 // Function to loop through the returned JSON and display the results
function loop_json(my_json, target_table, search_type) {

    // See if our query returned data
    if (my_json.length > 0) {

        // Clear the table we will be populating
        $('#' + target_table).empty();

        // Loop through the returned products
        for (var i = 0; i < my_json.length; i++) {

            // Get the current product
            var curr_product = my_json[i];

                // Log the product details to the console - USED FOR DEBUGGING
                // console.log(curr_product);

                // Get the image for the current product and the product title
                var curr_product_url = curr_product.product_image.substr(2).slice(0, -1)
                var curr_product_title = curr_product.product_title.substr(1).slice(0, -1)

                if (search_type == 'single_search')
                {

                    var quantity_select = '<select class="form-control" id="qtySelect" style="margin-left:10px;width:60px;"><option value="1" selected="selected">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>'

                    // Append the data to the table
                    $('#' + target_table).append('<div class="row" style="margin-bottom:20px;"><div style="width:70px;margin-left:35px;"><img width="60px" src=' + curr_product_url + '></img></div><div style="margin-right:10px;width:200px;overflow:auto;"><h6><a href="https://www.amazon.com/dp/' + curr_product.product_asin + '/?th="1 target=_blank>' + curr_product_title + '</a></h6><h5 style="font-weight:bold;">$' + curr_product.product_price + '</h5></div></div><div class="row" style="margin-left:90px;margin-bottom:10px;"><h5 class="control-label">Quantity:</h5>' + quantity_select + '</div><div class="row" style="margin-left:75px;"><button onclick="buyNow(\'' + curr_product.product_asin + '\')" type="button" class="btn btn-login_small btn-sm" style="margin-left:15px;">Buy Now<i class="fa fa-shopping-cart" style="display:inline;font-size:15px; color:white;padding-left:2px;"></i></button><button onclick="cancelPurchase()" type="button" class="btn btn-login_small btn-sm" style="margin-left:10px;">Cancel&nbsp;<i class="fa fa-times" style="display:inline;font-size:15px; color:white;padding-left:2px;"></i></button></div>');
                }
                else
                {

                // Append the data to the table
                $('#' + target_table).append('<div class="row" style="margin-bottom:20px;"><div style="width:70px;margin-left:35px;"><img width="60px" src=' + curr_product_url + '></img></div><div style="margin-right:10px;width:200px;overflow:auto;"><h6><a href="https://www.amazon.com/dp/' + curr_product.product_asin + '/?th="1 target=_blank>' + curr_product_title + '</a></h6><h5 style="font-weight:bold;">$' + curr_product.product_price + '<button onclick="productDetails(\'' + curr_product.product_asin + '\')" type="button" class="btn btn-login_small btn-sm" style="margin-left:15px; float: right;">Buy<i class="fa fa-shopping-cart" style="display:inline;font-size:15px; color:white;padding-left:2px;"></i></button></h5></div></div>');
                }
        }

    }

}

// Function to cancel the purchase and reload the page
function cancelPurchase()
{
    // Reload the page
    window.location.reload();
}    