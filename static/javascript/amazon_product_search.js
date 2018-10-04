
// Look to see when the document is done loading
$(document).ready(function () {

    // Log a message to the console 
    console.log('Document Ready...proceeding to Initialize Tableau Extensions');
  
    // Allow for the extension to be configured by the end user
    tableau.extensions.initializeAsync({'configure': configure}).then(function() {
      tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        updateExtensionBasedOnSettings(settingsEvent.newSettings)
      });
    });
    
    // Instantiate a dashboard extension
    tableau.extensions.initializeAsync().then(function () {

        // Attempt to get set up the selected marks handler 
        try
        {  
            
            // Get the worksheet name 
            curr_worksheet_name = getSelectedSheetName();    

            // See if we have a saved worksheet name
            if (typeof curr_worksheet_name === 'undefined' || !curr_worksheet_name)
            {

                // Change the alert text to make it clear that the user must select a sheet first
                $('#divAlert').text('Configure the extension by selecting the sheet you want to the Product Search to interact with.');
                $('#divAlert').addClass("alert-warning");
                $('#divAlert').removeClass("alert-success");
                $('#divAlert').removeClass("alert-danger");

                // Hide the Product Search Capabilities                
                $('#rowProduct').hide();
                $('#rowProductLabel').hide();        
                $('#rowSearchButton').hide();

                // Launch the configure popup if necessary
                configure(curr_worksheet_name);      
            }
            else
            {
                
               // Change the alert text to make it clear that the user must select a sheet first
               $('#divAlert').text('Please provide a product to search for on Amazon.');
               $('#divAlert').addClass("alert-warning");
               $('#divAlert').removeClass("alert-success");
               $('#divAlert').removeClass("alert-danger");

                // Show the Product Search Capabilities                
                $('#rowProduct').show();
                $('#rowProductLabel').show();        
                $('#rowSearchButton').show();

                // Add in the handler for marks selection
                registerMarkSelectionHandler(curr_worksheet_name);
            }
            
        }
        catch (err)
        {
            // DEBUG - Show the error to the user
            $('#divInfo').show();    
            $('#divInfo').text('initializeAsync - ' + err);
            
        }
    });

    // Handle the search button click for the product search
    $('#searchButton').click(function () {

        // Check for a product
        if ($("#curr_product").val() != '') {

            // Get the value for the current product
            curr_product = $('#curr_product').val();
            curr_product_asin = $('#curr_product_asin').val();
            curr_product_last_order_date = $('#curr_product_last_order_date').val();
            curr_product_avg_price = $('#curr_product_avg_price').val();
            
            // Call the function that runs the product search
            runAjaxProductSearch(curr_product, curr_product_asin, curr_product_last_order_date, curr_product_avg_price, 'multi_search');
        }
        else 
        {

            // Alert the user they need to provide a product
            $('#divAlert').text('Please provide a product before searching');

        }
        
    });
    
    // Handle the clearing of the search criteria
    $('#clearSearchButton').click(function () {

       // Check for a product
       $("#curr_product").val('');    
       $("#curr_product_asin").val('');    
       $("#curr_product_last_order_date").val('');
       $("#curr_product_avg_price").val('');
       $('#div_search_results').empty();
       $('#divAlert').text('Please provide a product to search for on Amazon.');
       $('#divAlert').addClass("alert-warning");
       $('#divAlert').removeClass("alert-success");
       $('#divAlert').removeClass("alert-danger");
        
    });

});

let unregisterEventHandlerFunction;

// Function to refresh \ reload a worksheet after a database update
function configure(curr_worksheet_name)
{
    
    // Set the URL for the popup with will allow us to configure the extension
    const popupUrl = window.location.origin + '/amazon_configure';
    
    // Open the modal popup for configuring this extension
    tableau.extensions.ui.displayDialogAsync(popupUrl, null, { height: 367, width: 300 });
    
}

// Function to update the extension when the settings are changed
function updateExtensionBasedOnSettings(settings) {
   
    try
    {
        // Get selected worksheet in the extension settings
        curr_worksheet_name = JSON.parse(tableau.extensions.settings.get('selectedWorksheet'))

         // See if we have a saved worksheet name
          if (typeof curr_worksheet_name !== 'undefined')
          {
               // Change the alert text to make it clear that the user must select a sheet first
               $('#divAlert').text('Please provide a product to search for on Amazon.');
               $('#divAlert').addClass("alert-warning");
               $('#divAlert').removeClass("alert-success");
               $('#divAlert').removeClass("alert-danger");
              
                // Show the Product Search Capabilities                
                $('#rowProduct').show();
                $('#rowProductLabel').show();        
                $('#rowSearchButton').show();
          }
        
        // Add in the handler for marks selection
       registerMarkSelectionHandler(curr_worksheet_name);
        
    }
    catch (err)
    {
        // DEBUG - Show the error to the user
        $('#divInfo').show();    
        $('#divInfo').text('updateExtensionBasedOnSettings - ' + err);
    }
    
}

// Function to handle when marks are selected
function registerMarkSelectionHandler(curr_worksheet_name)
{
     // Remove any existing event listeners
        if (unregisterEventHandlerFunction) {
            unregisterEventHandlerFunction();
        }
    
        // Get the worksheet
        worksheet = getSelectedSheet(curr_worksheet_name);

        // Add a listener for marks selection on the worksheet
        unregisterEventHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
            getSelectedMarks(curr_worksheet_name);
        });
}

// Function to get the selected worksheet name from the extension settings
function getSelectedSheetName() {

    // Initialize a return variable for the worksheet name
    curr_worksheet_name = '';
    
    try
    {
          // Get selected worksheet in the extension settings
         curr_worksheet_name = tableau.extensions.settings.get('selectedWorksheet');         
    }
   catch (err)
    {
        // DEBUG - Show the error to the user
        $('#divInfo').show();    
        $('#divInfo').text('getSelectedSheetName - ' + err);
    }    
    finally 
    {
        // See if we got a worksheet name back from the settings
        if (typeof curr_worksheet_name !== 'undefined')
        {            
            curr_worksheet_name = JSON.parse(curr_worksheet_name);
        }
        
        // Return the worksheet name
        return curr_worksheet_name;
    }
    
}

// Function to get the selected worksheet object
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
        
        // Get the worksheet name 
        curr_worksheet_name = getSelectedSheetName();    
        
        // Get the worksheet
        worksheet = getSelectedSheet(curr_worksheet_name);

        // Call the function which will get the datasources for this worksheet
        refreshDataSource(worksheet);
        
     });
}

// Function to refresh the datasource - this allows us to see updated data after we insert into the database
function refreshDataSource(worksheet)
{
        // Get the datasources attached to the worksheet
        worksheet.getDataSourcesAsync().then(data => {         

            // Find the datasource in the data object
            curr_datasource = data.find(curr_datasource => curr_datasource.name);

            // Find the fields in the data source
            fields = curr_datasource.fields;

            // Refresh the datasource
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
        console.log('Attempting to get the selected marks.');

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
                $("#curr_product_asin").val('');
                $("#curr_product_last_order_date").val('');
                $("#curr_product_avg_price").val('');
            }
            else
            {
                var curr_product = ''
                var curr_product_asin = ''
                var curr_product_last_order_date = ''
                var curr_product_avg_price = 0
                var curr_product_qty = 0
                
                // Loop through the columns and find the Product ASIN field as we will pass this to Amazon
                for (var i = 0; i < worksheetData.columns.length; i++) {
                    
                    // Use the column fieldname to find the Product ASIN
                    if (worksheetData.columns[i].fieldName == 'Product ASIN')
                    {
                        // Now that we found the Product ASIN in our two-dimensional data array 
                        // The first dimension is the row index and the second dimension is the column index   
                        curr_product_asin = worksheetData.data[0][i].formattedValue; 
                    }                    
                    else if (worksheetData.columns[i].fieldName == 'ATTR(LastOrderDate)')
                    {
                        // Get the last order date for this product
                        curr_product_last_order_date = worksheetData.data[0][i].formattedValue;
                    } 
                    else if (worksheetData.columns[i].fieldName == 'Product Title')
                    {
                        // Get the product title
                        curr_product = worksheetData.data[0][i].formattedValue;
                    }
                    else if (worksheetData.columns[i].fieldName == 'AVG(Product Price)')
                    {
                        // Get the average product price
                        curr_product_avg_price = worksheetData.data[0][i].formattedValue;
                        
                        // Convert to a number then round to two decimals 
                        curr_product_avg_price = parseFloat(curr_product_avg_price).toFixed(2);
                    }
                }
                
                // Log a message to the console
                console.log('Setting the product to search for to be ' + curr_product);
                
                // Set the current product for the input value
                $("#curr_product").val(curr_product);    
                $("#curr_product_asin").val(curr_product_asin);   
                $("#curr_product_last_order_date").val(curr_product_last_order_date);
                $("#curr_product_avg_price").val(curr_product_avg_price);
                
                // Hide the Product Search Capabilities                
                $('#rowProduct').hide();
                $('#rowProductLabel').hide();        
                $('#rowSearchButton').hide();
                
                // Automatically perform the search
                runAjaxProductSearch(curr_product, curr_product_asin, curr_product_last_order_date, curr_product_avg_price, 'single_search');
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
function productDetails(curr_product_asin)
{
    // Perform the Search again with the ASIN instead of the product name
    runAjaxProductSearch(curr_product_asin, curr_product_asin, curr_product_last_order_date, curr_product_avg_price, 'single_search');

    // Hide the Product Search Capabilities                
    $('#rowProduct').hide();
    $('#rowProductLabel').hide();        
    $('#rowSearchButton').hide();

}

// Function to writeback to the database the details of the purchased product
function buyNow(curr_product_asin)
{
    // Get the values we will use in the database writeback 
    curr_product_quantity = $("#curr_product_qty").val()

    // Check if the quantity is numeric
    if (!isNumeric(curr_product_quantity)) {

        // Set the style for the error
        $('#divAlert').text('Please provide a numeric value for the quantity.');
        $('#divAlert').addClass("alert-danger");
        $('#divAlert').removeClass("alert-success");
        $('#divAlert').removeClass("alert-warning");

    }
    else
    {
        // Create a variable for data we want to pass to the writeback function
        product_to_buy = JSON.stringify({curr_product_asin, curr_product_quantity});

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
            $('#divSuccess').slideUp(500).delay(10000);

             // Show the Product Search Capabilities                
            $('#rowProduct').show();
            $('#rowProductLabel').show();        
            $('#rowSearchButton').show();

            // Clear out the existing search results as we completed the purchase
            $('#div_search_results').empty();
            $('#curr_product').val(''); 
            $('#curr_product_asin').val(''); 
            $('#curr_product_last_order_date').val(''); 
            $('#curr_product_avg_price').val(''); 

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
    
}

// Function to run the Ajax Product Search
function runAjaxProductSearch(curr_product, curr_product_asin, curr_product_last_order_date, curr_product_avg_price, search_type)
{
      // Create a variable for the search criteria
      search_criteria = JSON.stringify({
          curr_product, curr_product_asin, curr_product_last_order_date, curr_product_avg_price
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

                // Get the image for the current product and the product title
                var curr_product_url = curr_product.product_image.substr(2).slice(0, -1)
                var curr_product_title = curr_product.product_title.substr(1).slice(0, -1)
                var curr_product_avg_price = $('#curr_product_avg_price').val();
                var curr_product_price = curr_product.product_price;
                var price_difference = 0
                var historical_price_text = 'This product has an average product price of $' + curr_product_avg_price + '.  ';
                var potential_savings_text = 'At the current price this purchase would be '
                var arrow_down = '<i class="fa fa-arrow-down" style="display:inline;font-size:15px;padding-left:2px;"></i>'
                var arrow_up = '<i class="fa fa-arrow-up" style="display:inline;font-size:15px;padding-left:2px;"></i>'
                
                if (search_type == 'single_search')
                {

                    // HTML to define the input for quantity 
                    var curr_product_qty = '<input name="curr_product_qty" id="curr_product_qty" class="form-control" placeholder="" autofocus="" autocomplete="off" style="background-position: 98% 50%; cursor: pointer;width:90px;margin-left:13px;">'
                    
                    // Calculate the potential savings
                    if (curr_product_avg_price > curr_product_price)
                    {
                        // Get the potential savings and round to two decimal places
                        price_difference = (curr_product_avg_price - curr_product_price).toFixed(2);
                        
                        // Update our text to reflect the total savings
                        potential_savings_text =  potential_savings_text + '<font style=font-weight:bold;color:green;">$'  + price_difference + '</font> less than the average purchase price.';
                    }
                    else if  (curr_product_avg_price == curr_product_price)
                    {
                        // Update our text to reflect the total savings
                        potential_savings_text = potential_savings_text +  '<font style=font-weight:bold;">equal </font> to the average purchase price.';                    
                    }
                    else
                    {
                        
                        // Get the potential loss and round to two decimal places
                        price_difference = (curr_product_price - curr_product_avg_price).toFixed(2);
                        
                        // Update our text to reflect the total savings
                        potential_savings_text =  potential_savings_text + '<font style=font-weight:bold;color:red;">$'  + price_difference +'</font> more than the average purchase price.';
                    }
                    
                    // Append the data to the table
                    $('#' + target_table).append('<div id="divPurchaseInfo" class="alert alert-info" style="width:auto;margin-left: 25px;margin-right: 25px;margin-top:5px;">' + potential_savings_text + '</div><div class="row" style="margin-bottom:20px;"><div style="width:70px;margin-left:40px;"><img width="60px" src=' + curr_product_url + '></img></div><div style="margin-right:10px;width:200px;overflow:auto;"><h6><a href="https://www.amazon.com/dp/' + curr_product.product_asin + '/?th="1 target=_blank>' + curr_product_title + '</a></h6><h5 style="font-weight:bold;">$' + curr_product.product_price + '</h5></div></div><div class="row" style="margin-left:90px;margin-bottom:10px;"><h5 class="control-label">Quantity:</h5>' + curr_product_qty + '</div><div class="row" style="margin-left:75px;"><button onclick="buyNow(\'' + curr_product.product_asin + '\')" type="button" class="btn btn-login_small btn-sm" style="margin-left:15px;">Buy Now<i class="fa fa-shopping-cart" style="display:inline;font-size:15px; color:white;padding-left:2px;"></i></button><button onclick="cancelPurchase()" type="button" class="btn btn-login_small btn-sm" style="margin-left:10px;">Cancel&nbsp;<i class="fa fa-times" style="display:inline;font-size:15px; color:white;padding-left:2px;"></i></button></div>');
                }
                else
                {

                // Append the data to the table
                $('#' + target_table).append('<div class="row" style="margin-bottom:20px;padding-top:20px;"><div style="width:70px;margin-left:40px;"><img width="60px" src=' + curr_product_url + '></img></div><div style="margin-right:10px;width:200px;overflow:auto;"><h6><a href="https://www.amazon.com/dp/' + curr_product.product_asin + '/?th="1 target=_blank>' + curr_product_title + '</a></h6><h5 style="font-weight:bold;">$' + curr_product.product_price + '<button onclick="productDetails(\'' + curr_product.product_asin + '\')" type="button" class="btn btn-login_small btn-sm" style="margin-left:15px; float: right;">Buy<i class="fa fa-shopping-cart" style="display:inline;font-size:15px; color:white;padding-left:2px;"></i></button></h5></div></div>');
                }
        }

    }

}

// Function to clear out the product asin when the product title changes
$("#curr_product").change(function(){
    $("#curr_product_asin").val('');
    $("#curr_product_last_order_date").val('');
    $("#curr_product_avg_price").val('');
});

// Check if the field is numeric
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// Function to cancel the purchase and reload the page
function cancelPurchase()
{
    // Reload the page
    window.location.reload();
}    