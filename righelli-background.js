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
// Background page -- righelli-background.js
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "devtools-righelli") {
        port.onDisconnect.addListener(function(port) {
            //if (openCount == 0) {
              chrome.tabs.query({active: true, currentWindow: true},
              function(tabs) {
                  chrome.tabs.sendMessage(tabs[0].id, {cmd: "exit"});
              });
        });
    }
});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if (message.cmd == "init") {
        chrome.tabs.query({active: true, currentWindow: true},
        function(tabs) {
            console.log("tabs", tabs)
            chrome.tabs.sendMessage(tabs[0].id, {cmd: "init"},
            function (response) {
                if (!response) { //the script hasn't been previously loaded, let's do it now
                    chrome.tabs.insertCSS(message.tabId, {file: "righelli.css"});
                    chrome.tabs.executeScript(message.tabId, {file: "jquery.min.js"});
                    chrome.tabs.executeScript(message.tabId, {file: "righelli.js" });
                    return;
                }
            });
        });
    }
});