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

var righelliBackground = {};

righelliBackground.connectListener = function (port) {
    if (port.name == "devtools-righelli") {
        port.onDisconnect.addListener(righelliBackground.disconnectListener);
    }
};

righelliBackground.disconnectListener = function(port) {
    righelliBackground.sendCmdToContentScript("exit");
};

righelliBackground.loadRighelli = function(iTabId) {
    righelliBackground.sendCmdToContentScript("init", function (response) {
        if (!response) { //the script hasn't been previously loaded, let's do it now
            chrome.tabs.insertCSS(iTabId, {file: "righelli.css"});
            chrome.tabs.executeScript(iTabId, {file: "jquery.min.js"});
            chrome.tabs.executeScript(iTabId, {file: "righelli.js" });
        }
    });
};

righelliBackground.messageListener = function(message,sender,sendResponse){
    if (message.cmd == "init") {
        if (message.cmd == "init" && message.opt == "ignore_settings") {
            righelliBackground.loadRighelli(message.tabId);
        } else {
            chrome.storage.sync.get({
                showAtStartup: false
            }, function(oSettings) {
                if (oSettings.showAtStartup) {
                    righelliBackground.loadRighelli(message.tabId);
                }
            });
        }
    }
};

righelliBackground.sendMessageToContentScript = function (oMsg, fnCallback) {
    chrome.tabs.query({active: true, currentWindow: true},
        function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, oMsg, fnCallback);
    });
};

righelliBackground.sendCmdToContentScript = function (sCmd, fnCallback) {
    righelliBackground.sendMessageToContentScript({cmd: sCmd}, fnCallback);
};

//Setup listeners
chrome.runtime.onConnect.addListener(righelliBackground.connectListener);
chrome.runtime.onMessage.addListener(righelliBackground.messageListener);