/*
    PaperCut Printer Script: Show Shared Account Selection Popup (ADVANCED)
*/
function printJobHook(inputs, actions) {
    // Set the group to apply the script to.
    // NOTE: The group name is case-sensitive.
    // Leave blank to apply to ALL groups.
    var ACCOUNT_SELECTION_GROUP = '';

    // Set the shared accounts list array. (used for popup selection; unfortunately this cannot be dynamic from the PaperCut server)
    var SHARED_ACCOUNTS = [
        'Administration',
        'Business',
        'Teachers'
    ];

    /*
        DO NOT MODIFY BELOW THIS LINE
    */

    // Test if a user is not in group and, if so, end the script. (if one is specified)
    if (!(inputs.user.isInGroup(ACCOUNT_SELECTION_GROUP)) && (ACCOUNT_SELECTION_GROUP != '')) {
        return;
    }

    // Set the default shared account name to the user's default shared account. (if exists)
    // Overwrites with the name of the auto-charge account. (if exists)
    // Default to 'Not Set' if neither exist.
    if (inputs.user.defaultSharedAccountName) {
        var DEFAULT_SHARED_ACCOUNT_NAME = inputs.user.defaultSharedAccountName;
    }
    if (inputs.user.autoChargeToSharedAccountName) {
        var DEFAULT_SHARED_ACCOUNT_NAME = inputs.user.autoChargeToSharedAccountName;
    }
    if (!DEFAULT_SHARED_ACCOUNT_NAME) {
        var DEFAULT_SHARED_ACCOUNT_NAME = 'Not Set'
    }

    // Popup Title
    var TITLE = "Select Shared Account";

    // Popup Message
    var MESSAGE = "Please select a shared account to charge the print job to.";

    // Account Selection Dropdown HTML
    var SELECT_ACCOUNT = ''
    for (var i = 0; i < SHARED_ACCOUNTS.length; i++) {
        var opt = SHARED_ACCOUNTS[i];
        if (i != 0) {
            SELECT_ACCOUNT = SELECT_ACCOUNT.concat('\n');
        } else {
            SELECT_ACCOUNT = SELECT_ACCOUNT.concat('<option disabled selected value="' + DEFAULT_SHARED_ACCOUNT_NAME + '">-- {Default: ' + DEFAULT_SHARED_ACCOUNT_NAME + '} --</option>' + '\n')
        }
        SELECT_ACCOUNT = SELECT_ACCOUNT.concat('<option value="', opt, '">', opt, '</option>');
    }

    // Popup Options
    var OPTIONS = { 'dialogTitle': TITLE, 'hideJobDetails': false };

    // Popup Form
    var htmlForm = '<html><body>'
        + '<h2 style="color:006400;text-align:center;">' + MESSAGE + '</h2>'
        + '  <table align="center" border="1">'
        + '    <tr><th align="left">Request ID</th>'
        + '      <td><input type="text" size="12" name="request-id" /></td>'
        + '    </tr>'
        + '    <tr><th align="left">Account</th>'
        + '      <td>'
        + '        <select name="selectAccount" required="true">'
        + '          ' + SELECT_ACCOUNT
        + '        </select>'
        + '      </td>'
        + '    </tr>'
        + '    <tr><th align="left">Comments</th>'
        + '      <td><textarea name="comments" rows="4" cols="37" /></td>'
        + '    </tr>'
        + '  </table>'
        + '</body></html>';

    /*
        Return here unless job analysis is complete.
    */
    if (!inputs.job.isAnalysisComplete) {
        // No job details yet so return.
        return;
    }

    // Get the response from the prompt and set the default value to none
    // var response = actions.client.promptForChoice(MESSAGE, SHARED_ACCOUNTS, OPTIONS);
    var response = actions.client.promptForForm(htmlForm, { 'dialogTitle': TITLE, 'hideJobDetails': false });

    // If the dialog is not canceled or timed out, set the selected shared account.
    if (response == 'CANCEL' || response == 'TIMEOUT') {
        actions.job.cancel();
        return;
    } else {
        // Change the shared account to the selected account.
        if (response['selectAccount'] == 'Not Set') {
            actions.client.promptOK('Job has been canceled. Please reprint your job and try again.', {
                'dialogTitle': 'Error: No Account Selected',
                'dialogDesc': 'This print job requires a budget account to be selected.', 'hideJobDetails': true
            });
            actions.job.cancel();
            return;
        } else {
            // Set to the selected shared account.
            actions.job.chargeToSharedAccount(response['selectAccount']);
        }

        // Add request ID and comment to job if not empty.
        var COMMENTS = ''
        if (response['request-id']) {
            COMMENTS = COMMENTS.concat('[Request ID: ' + (response['request-id']) + '] ');
        }

        if (response['comments']) {
            COMMENTS = COMMENTS.concat((response['comments']));
        }

        if (COMMENTS) {
            actions.job.addComment(COMMENTS);
        }
    }
}
