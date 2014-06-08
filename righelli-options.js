/*
    This file is part of Righelli.

    Righelli is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Righelli is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Righelli.  If not, see <http://www.gnu.org/licenses/>.
*/


var righelliOptions = {};

// Saves options to chrome.storage
righelliOptions.saveOptions = function () {
    var bShowAtStartup = $("#startup").prop("checked");
    
    chrome.storage.sync.set({
        showAtStartup: bShowAtStartup,
    }, function() {
        // Update status to let user know options were saved.
        $("#status").text(chrome.i18n.getMessage("settings_saved_message"));
        setTimeout(function() {
            $("#status").text("");
        }, 750);
    });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
righelliOptions.loadOptions = function () {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        showAtStartup: false
    }, function(oSettings) {
        $("#startup").prop("checked", oSettings.showAtStartup);
    });
}
document.addEventListener('DOMContentLoaded', function () {
    $("title").text(chrome.i18n.getMessage("settings_page_title"));
    $("#startup-label").text(chrome.i18n.getMessage("settings_startup_option"));
    $("#save").text(chrome.i18n.getMessage("settings_save_button"));

    $("#save").unbind("click", righelliOptions.saveOptions);
    $("#save").bind("click", righelliOptions.saveOptions);
    righelliOptions.loadOptions();
});