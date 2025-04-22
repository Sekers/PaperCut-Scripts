/*
    PaperCut Printer Script: Show Shared Account Selection Popup (BASIC)
*/
function printJobHook(inputs, actions) {
    // Set the shared accounts list array. (used for popup selection; unfortunately this cannot be dynamic from the PaperCut server)
    var SHARED_ACCOUNTS = [
        'Administration',
        'Business',
        'Teachers'
    ];

    // Popup Title
    var TITLE = "Select Shared Account";

    // Message to show in the popup
    var MESSAGE = "Please select a shared account to charge the print job to.";

    // Popup options
    var OPTIONS = { 'dialogTitle': TITLE, 'defaultChoice': '', 'fieldLabel': 'Accounts', 'hideJobDetails': false };

    /*
    * Return here unless job analysis is complete.
    */
    if (!inputs.job.isAnalysisComplete) {
        // No job details yet so return.
        return;
    }

    // Get the response from the prompt and set the default value to none
    var response = actions.client.promptForChoice(MESSAGE, SHARED_ACCOUNTS, OPTIONS);

    // If the dialog is not canceled or timed out, set the selected shared account.
    if (response == 'CANCEL' || response == 'TIMEOUT') {
        actions.job.cancel();
    } else {
        // Change the shared account
        actions.job.chargeToSharedAccount(response);
    }
}
