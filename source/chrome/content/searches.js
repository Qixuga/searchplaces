/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the SortPlaces extension.
 *
 * The Initial Developer of the Original Code is Andy Halford.
 * Portions created by the Initial Developer are Copyright (C) 2008-2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * SearchPlaces namespace
 */
if ("undefined" == typeof(SearchPlaces)) {
	var SearchPlaces = {};
};

SearchPlaces.Searches = {
	prefs: Components.classes["@mozilla.org/preferences-service;1"]
									 .getService(Components.interfaces.nsIPrefService)
									 .getBranch("extensions.searchplaces."),
	defaults: Components.classes["@mozilla.org/preferences-service;1"]
										  .getService(Components.interfaces.nsIPrefService)
									 		.getDefaultBranch("extensions.searchplaces."),
	firefoxID: "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}",
	seamonkeyID: "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}",

	//Hide/show icons/buttons
	init: function() {
		//Vain attempt to stop new windows calling this more than once
		window.removeEventListener("load", SearchPlaces.Searches.init, false);

		//Initialise as per the recommendations
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
													.getService(Components.interfaces.nsIPrefService)
													.getBranch("extensions.searchplaces.");

		//Add to add-on bar (or nav bar for older browsers) with first install
		var firstrun = prefs.getBoolPref('firstrun');
		if (firstrun) {
			prefs.setBoolPref('firstrun', false);
			var myId = "searchplaces-button";
			var bar = document.getElementById("addon-bar");
			if (bar) {
				if (!document.getElementById(myId)) {
					bar.insertItem(myId);
					bar.collapsed = false;	//Show the addon bar if it is hidden
						
					//Remember these changes
					bar.setAttribute("currentset", bar.currentSet);  
					document.persist(bar.id, "currentset");
					document.persist(bar.id, "collapsed");
				}
			}

			//Use nav-bar instead for older browsers
			else {
				var bar = document.getElementById("nav-bar");
				var curSet = bar.currentSet.split(",");

				if (curSet.indexOf(myId) == -1) {
					var pos = curSet.indexOf("search-container") + 1 || curSet.length;
					var set = curSet.slice(0, pos).concat(myId).concat(curSet.slice(pos));

					bar.setAttribute("currentset", set.join(","));
					bar.currentSet = set.join(",");
					document.persist(bar.id, "currentset");
					try {
						BrowserToolboxCustomizeDone(true);
					} catch (e) {}
				}
			}
		}

		//Bookmarks menu
		var bmMenu = document.getElementById("searchplaces-bmenu");
		if (bmMenu) bmMenu.hidden = !prefs.getBoolPref("bookmarks_menu");
		var apMenu = document.getElementById("searchplaces-amenu");
		if (apMenu) apMenu.hidden = !prefs.getBoolPref("bookmarks_menu");

		//Tools menu
		var toolsMenu = document.getElementById("searchplaces-tmenu");
		if (toolsMenu) toolsMenu.hidden = !prefs.getBoolPref("tools_menu");

		//Bookmarks organiser
		var orgMenu = document.getElementById("searchplaces-orgmenu");
		if (orgMenu) orgMenu.hidden = !prefs.getBoolPref("org_menu");

		//Manage Bookmarks Tool menu for SeaMonkey)
		var manageMenu = document.getElementById("searchplaces-managemenu");
		if (manageMenu) manageMenu.hidden = !prefs.getBoolPref("manage_menu");
	},

	onDialogLoad: function() {
		//Iterate over the defaults setting each UI item to the pref
		var prefList = this.defaults.getChildList("", {});
		for (var i = 0 ; i < prefList.length ; i++) {
			var id = prefList[i];
			switch (this.defaults.getPrefType(id)) {
				case this.defaults.PREF_BOOL:
					var checkbox = document.getElementById(id);
					if (checkbox) checkbox.checked = this.prefs.getBoolPref(id);
				break;

				case this.defaults.PREF_STRING:
					var item = document.getElementById(id);
					if (item) item.value = this.prefs.getCharPref(id);
				break;
			}
		}

		//SeaMonkey/Firefox specific preferences
		var id = this.firefoxID;
		try {
			var info = Components.classes["@mozilla.org/xre/app-info;1"]
													 .getService(Components.interfaces.nsIXULAppInfo);
			id = info.ID;
		} catch(e) {
		}
		document.getElementById('org_menu').hidden = (id == this.seamonkeyID);
		document.getElementById('manage_menu').hidden = (id != this.seamonkeyID);

		//Display a list of all searches
		var options = PlacesUtils.history.getNewQueryOptions();
		options.excludeItems = true;
		options.expandQueries = false;
		options.excludeReadOnlyFolders = true;
		var query = PlacesUtils.history.getNewQuery();
		query.setFolders([PlacesUtils.placesRootId], 1);

		//Populate the tree
		var tree = document.getElementById("searches");
		tree.place = PlacesUtils.history.queriesToQueryString([query], 1, options);
	},

	onDialogClose: function() {
		var prefList = this.defaults.getChildList("", {});
		for (var i = 0 ; i < prefList.length ; i++) {
			var id = prefList[i];
			switch (this.defaults.getPrefType(id)) {
				case this.defaults.PREF_BOOL:
					var checkbox = document.getElementById(id);
					if (checkbox) this.prefs.setBoolPref(id, checkbox.checked);
				break;

				case this.defaults.PREF_STRING:
					var item = document.getElementById(id);
					if (item) this.prefs.setCharPref(id, item.value);
				break;
			}
		}

		//Statusbar icon
		//Get a list of all open windows
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
											 .getService(Components.interfaces.nsIWindowMediator);
		var enumerator = wm.getEnumerator('navigator:browser');

		//Now hide/show on each window
		while(enumerator.hasMoreElements()) {
			var currentWindow = enumerator.getNext();

			//Turn things on/off as appropriate
			try {
				var bmMenu = document.getElementById("bookmarks_menu").checked;
				currentWindow.document.getElementById("searchplaces-bmenu").hidden = !bmMenu;
		  } catch (exception) {}
			try {
				var bmMenu = document.getElementById("bookmarks_menu").checked;
				currentWindow.document.getElementById("searchplaces-amenu").hidden = !bmMenu;
		  } catch (exception) {}
			try {
				var toolsMenu = document.getElementById("tools_menu").checked;
				currentWindow.document.getElementById("searchplaces-tmenu").hidden = !toolsMenu;
		  } catch (exception) {}
		}

		//Bookmarks Organiser menu
		var enumerator = wm.getEnumerator('Places:Organizer');
		while(enumerator.hasMoreElements()) {
			var currentWindow = enumerator.getNext();
			try {
				var orgMenuitem = document.getElementById("org_menu").checked;
				currentWindow.document.getElementById("searchplaces-orgmenu").hidden = !orgMenuitem;
		  } catch (exception) {}
		}

		//Manage Bookmarks menu (SeaMonkey)
		var enumerator = wm.getEnumerator('bookmarks:manager');
		while(enumerator.hasMoreElements()) {
			var currentWindow = enumerator.getNext();
			try {
				var manageMenuitem = document.getElementById("manage_menu").checked;
				currentWindow.document.getElementById("searchplaces-managemenu").hidden = !manageMenuitem;
		  } catch (exception) {}
		}
	},

	//Return the Search selected
	editSearch: function(action) {
		if (action == "new") {
			SearchPlaces.Editor.prefs.setIntPref("searchID", 0);
			window.openDialog('chrome://searchplaces/content/editor.xul', null, 'chrome,modal,centerscreen');
		}
		else {
			var selectedNode = document.getElementById("searches").selectedNode;

			//If it's a search or a special folder, then edit it
			if (selectedNode) {
				try {
					PlacesUtils.bookmarks.getBookmarkURI(selectedNode.itemId)
				} catch (e) {
					SearchPlaces.Editor.alert("not_a_search");
					return false;
				}

				//Save the searches' ID in a temporary preference
				SearchPlaces.Editor.prefs.setIntPref("searchID", selectedNode.itemId);
				//Are we copying or editing?
				SearchPlaces.Editor.prefs.setBoolPref("copy", action == "copy");

				//Display the search editor
				window.openDialog('chrome://searchplaces/content/editor.xul', null, 'chrome,modal,centerscreen');
			}
			else
				SearchPlaces.Editor.alert("not_a_search");
		}

		return false;	//So that the dialog remains open for another selection
	}
};

//Hide/Show the icons/buttons
window.addEventListener("load", SearchPlaces.Searches.init, false);
