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
// Run our righelli generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    chrome.devtools.panels.create(chrome.i18n.getMessage("application_title"), null /*icon*/, "righelli-panel.html",
    function(panel) {
         // code invoked on panel creation
         panel.onShown.addListener(function () {
            chrome.runtime.sendMessage({cmd: "init", opt: "ignore_settings", tabId: chrome.devtools.inspectedWindow.tabId});
         })
         //panel.createStatusBarButton("icon128.png", "tittòl", false);
    });
    chrome.runtime.connect({name: "devtools-righelli"}); //used to count the number of open open tabs to generate the exit event.
    chrome.runtime.sendMessage({cmd: "init", tabId: chrome.devtools.inspectedWindow.tabId});
});