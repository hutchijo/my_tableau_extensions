// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

    // Define a constant for the selected worksheet key
    const worksheetsSettingsKey = 'selectedWorksheet';

    // Declare a variable for the selected worksheet value
    let selected_worksheet = '';

    // Handle when the document has been loaded
    $(document).ready(function () {

        // Initialize the popup 
        tableau.extensions.initializeDialogAsync().then(function(){

              // Declare an object for the dashboard object and the worksheets array
              let dashboard = tableau.extensions.dashboardContent.dashboard;
   
              // Call a function to see which worksheet has been selected 
              selected_worksheet = parseSettings();
            
              // Loop through worksheets on the dashboard
              dashboard.worksheets.forEach(function (worksheet) {
                
                    // Call a function to create an option list of worksheet
                    addWorksheetNameToUI(worksheet, selected_worksheet);      
                  
              });
             
              // Set up a click function for the radio options
              $('.radio').click(function () {
                  
                updateSelectedWorksheet($("input[name='optWorksheets']:checked").val());
                  
            });
            
          
            // Call the Close Dialog function to save the worksheet
            $('#saveButton').click(closeDialog);
            
        });
    });
    
  // A function that adds a worksheets for selection in a option box
  function addWorksheetNameToUI(worksheet, selected_worksheet) {
   
    // See if we have a matching worksheet name
    if (selected_worksheet != worksheet.name)
    {
         // Append the worksheets as options for selection by the user
        $("#rowWorksheets").append("<div class='radio row'><label style='control-label'><input type='radio' name='optWorksheets' value='" + worksheet.name + "' style='width:auto;margin-left: 45px;margin-right: 5px;'>"+ worksheet.name +"</label></div>")
    }
    else
    {
         // Append the worksheets as options for selection by the user
        $("#rowWorksheets").append("<div class='radio row'><label style='control-label'><input type='radio' name='optWorksheets' checked='checked' value='" + worksheet.name + "' style='width:auto;margin-left: 45px;margin-right: 5px;'>"+ worksheet.name +"</label></div>")
    }
      
  }
    
  // Parse the settings to find the selected worksheet
  function parseSettings() {
      
    // Define a return variable for the selected worksheet
    let curr_selected_worksheet = '';
      
    // Get all of the existing settings
    let settings = tableau.extensions.settings.getAll();
    
    // Get the value for the selected worksheet
    if (settings.selectedWorksheet) {
      curr_selected_worksheet = JSON.parse(settings.selectedWorksheet);
    }

    // Return the selected worksheet
    return curr_selected_worksheet;
      
  }

  // Function to update the selected worksheet value
  function updateSelectedWorksheet(curr_selected_worksheet) {
    
    // Set the value we will save into the settings
    selected_worksheet = curr_selected_worksheet;
 }
    
  // This function saves the worksheet selected in the settings and closes the dialog
  function closeDialog() {
    
    // See if we have a selected worksheet
    if (selected_worksheet)
    {
        // Get all of the existing settings
        let currentSettings = tableau.extensions.settings.getAll();

        // Set selected worksheet in the extension settings
        tableau.extensions.settings.set(worksheetsSettingsKey, JSON.stringify(selected_worksheet));

        // Save the settings and close the dialog
        tableau.extensions.settings.saveAsync().then((newSavedSettings) => {

          // It looks like a payload is required as of right now as we get an error without a payload
          tableau.extensions.ui.closeDialog(selected_worksheet);

        });
    }
    else
    {
        // Set the error message indicating that the user must select a sheet
        $('#divAlert').show();    
        $('#divAlert').text('You must select the sheet you want to the Product Search to interact with.');
        $('#divAlert').addClass("alert-danger");
        $('#divAlert').removeClass("alert-warning");
        
    }
  }
    
})();