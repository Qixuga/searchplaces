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
 * The Original Code is the SearchPlaces extension.
 *
 * The Initial Developer of the Original Code is Andy Halford.
 * Portions created by the Initial Developer are Copyright (C) 2009-2011
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

try {
	Components.utils.import("resource://gre/modules/PlacesUtils.jsm");
} catch(ex) {
	Components.utils.import("resource://gre/modules/utils.js");
}

SearchPlaces.Editor = {
	prefs: Components.classes["@mozilla.org/preferences-service;1"]
									 .getService(Components.interfaces.nsIPrefService)
									 .getBranch("extensions.searchplaces."),
	amp: false,
	copyOrNew: false,
	orginalURI: null,
	DATE_ADDED_ANNO: "syncplaces/dateAdded",

	// When the dialog is first displayed initialise it
	onDialogLoad: function() {
		var itemId = this.prefs.getIntPref("searchID");
		var bm = PlacesUtils.bookmarks;

		//Are we creating a new one?
		if (!itemId) {
			this.originalURI = "place:";
			document.getElementById("place_uri").value = this.originalURI;
			this.copyOrNew = true;	//ie we're adding something new
		}
		else {
			//Are we copying or just editing?
			this.copyOrNew = this.prefs.getBoolPref("copy");

			//Name and uri and time
			if (!this.copyOrNew) document.getElementById("query_name").value = bm.getItemTitle(itemId);
			var location = decodeURIComponent(bm.getBookmarkURI(itemId).spec);
			this.originalURI = location;
			document.getElementById("place_uri").value = location;
			document.getElementById("current_time").value = parseInt(new Date().getTime()/1000);

			//Parse the uri
			location = location.slice(6);
			var params = location.split("&");
			for (var i=0; i<params.length; i++) {
				var nv = params[i].split("=");
				switch (nv[0]) {
					case "beginTime":
						document.getElementById("begin_time").value = parseInt(nv[1]/1000000);
					break;
					case "beginTimeRef":
						document.getElementById("begin_time_ref").value = nv[1];
					break;
					case "endTime":
						document.getElementById("end_time").value = parseInt(nv[1]/1000000);
					break;
					case "endTimeRef":
						document.getElementById("end_time_ref").value = nv[1];
					break;
					case "terms":
						document.getElementById("terms").value = nv[1];
					break;
					case "tag":
						document.getElementById("terms").value = nv[1];
						document.getElementById("tag").checked = true;
					break;
					case "!tags":
						document.getElementById("not_tag").checked = true;
					break;
					case "tags":
						document.getElementById("not_tag").checked = false;
					break;
					case "minVisits":
						document.getElementById("min_visits").value = nv[1];
					break;
					case "maxVisits":
						document.getElementById("max_visits").value = nv[1];
					break;
					case "onlyBookmarked":
						document.getElementById("only_bookmarked").checked = true;
					break;
					case "domain":
						document.getElementById("domain").value = nv[1];
					break;
					case "domainIsHost":
						document.getElementById("domain_host").checked = true;
					break;
					case "folder":
						try{
							document.getElementById(nv[1]).checked = true;
					 }catch(e) {}
					break;
					case "annotation":
						document.getElementById("annotation").value = nv[1];
					break;
					case "!annotation":
						document.getElementById("reject_annotation").checked = true;
					break;
					case "uri":
						document.getElementById("uri").value = nv[1];
					break;
					case "uriIsPrefix":
						document.getElementById("uri_prefix").checked = true;
					break;
					case "sort":
						var value = nv[1]/2;
						var remainder = nv[1] % 2;
						var order = document.getElementById("sort_order");
						if (remainder == 1) {
							value = value + 1;
							var asc = document.getElementById("asc");
							order.selectedItem = asc;
							asc.selected;
						}
						else {
							var desc = document.getElementById("desc");
							order.selectedItem = desc;
							desc.selected;
						}
						document.getElementById("sort_by").value = value;
					break;
					case "sortingAnnotation":
						document.getElementById("sorting_annotation").value = nv[1];
					break;
					case "type":
						document.getElementById("type").value = nv[1];
					break;
					case "excludeItems":
						document.getElementById("exclude_items").checked = true;
					break;
					case "excludeQueries":
						document.getElementById("exclude_queries").checked = true;
					break;
					case "excludeReadOnlyFolders":
						document.getElementById("exclude_folders").checked = true;
					break;
					case "excludeItemIfParentHasAnnotation":
						document.getElementById("exclude_annotation").value = nv[1];
					break;
					case "expandQueries":
						document.getElementById("expand_queries").checked = true;
					break;
					case "originalTitle":
						document.getElementById("original_title").value = nv[1];
					break;
					case "showSessions":
						document.getElementById("show_sessions").checked = true;
					break;
					case "resolveNullBookmarkTitles":
						document.getElementById("resolve_titles").checked = true;
					break;
					case "includeHidden":
						document.getElementById("include_hidden").checked = true;
					break;
					case "applyOptionsToContainers":
						document.getElementById("apply_containers").checked = true;
					break;
					case "maxResults":
						document.getElementById("max_results").value = nv[1];
					break;
					case "queryType":
						document.getElementById("query_type").value = nv[1];
					break;
					case "redirectsMode":
						document.getElementById("redirects_mode").value = nv[1];
					break;
				}
			}
		}
	},

	//If sorting by annotation you must set this as well
	toggleSortingAnnotation: function() {
		var sortingByAnnotation = document.getElementById("sort_by").value == "10";
//		document.getElementById("sorting_annotation_label").disabled = !sortingByAnnotation;
		document.getElementById("sorting_annotation").disabled = !sortingByAnnotation;
	},

	//Check the search makes sense
	onDialogApply: function() {
		//Create the uri from the settings
		var uri = "place:";
		this.amp = false;

		var value = document.getElementById("begin_time").value * 1000000;
		if (value > -1) {
			uri = this.add("beginTime=" + value, uri);
			value = document.getElementById("begin_time_ref").value;
			uri = this.add("beginTimeRef=" + value, uri);
		}
		value = document.getElementById("end_time").value * 1000000;
		if (value > -1) {
			uri = this.add("endTime=" + value, uri);
			value = document.getElementById("end_time_ref").value;
			uri = this.add("endTimeRef=" + value, uri);
		}

		value = this.trim(document.getElementById("terms").value);
		if (value) {
			if (document.getElementById("tag").checked) {
				uri = this.add("tag=" + value, uri);
				var not_tag = document.getElementById("not_tag").checked;
				if (not_tag)
						uri = this.add("!tags=1", uri);
				else
						uri = this.add("tags=1", uri);
			}
			else
				uri = this.add("terms=" + value, uri);
		}

		value = document.getElementById("min_visits").value;
		if (value && value > -1) uri = this.add("minVisits=" + value, uri);
		value = document.getElementById("max_visits").value;
		if (value && value > -1) uri = this.add("maxVisits=" + value, uri);

		var checked = document.getElementById("only_bookmarked").checked;
		if (checked) uri = this.add("onlyBookmarked=true", uri);

		value = this.trim(document.getElementById("domain").value);
		if (value) {
			uri = this.add("domain=" + value, uri);
			var checked = document.getElementById("domain_host").checked;
			if (checked) uri = this.add("domainIsHost=true", uri);
		}

		checked = document.getElementById("PLACES_ROOT").checked;
		if (checked) uri = this.add("folder=PLACES_ROOT", uri);
		checked = document.getElementById("BOOKMARKS_MENU").checked;
		if (checked) uri = this.add("folder=BOOKMARKS_MENU", uri);
		checked = document.getElementById("UNFILED_BOOKMARKS").checked;
		if (checked) uri = this.add("folder=UNFILED_BOOKMARKS", uri);
		checked = document.getElementById("TOOLBAR").checked;
		if (checked) uri = this.add("folder=TOOLBAR", uri);
		checked = document.getElementById("TAGS").checked;
		if (checked) uri = this.add("folder=TAGS", uri);

		value = this.trim(document.getElementById("annotation").value);
		if (value) {
			uri = this.add("annotation=" + value, uri);
			checked = document.getElementById("reject_annotation").checked;
			if (checked) uri = this.add("!annotation=true", uri);
		}

		value = this.trim(document.getElementById("uri").value);
		if (value) {
			uri = this.add("uri=" + value, uri);
			checked = document.getElementById("uri_prefix").checked;
			if (checked) uri = this.add("uriIsPrefix=true", uri);
		}

		value = document.getElementById("sort_by").value;
		if (value == "0")
			uri = this.add("sort=0", uri);
		else if (value) {
			if (value == 10) {
				var anno = this.trim(document.getElementById("sorting_annotation").value);
				if (anno) uri = this.add("sortingAnnotation=" + anno, uri);
			}
			value = value * 2;
			if (document.getElementById("sort_order").selectedItem.id == "asc") value--;
			uri = this.add("sort=" + value, uri);
		}

		value = document.getElementById("type").value;
		if (value) uri = this.add("type=" + value, uri);

		checked = document.getElementById("exclude_items").checked;
		if (checked) uri = this.add("excludeItems=true", uri);
		checked = document.getElementById("exclude_queries").checked;
		if (checked) uri = this.add("excludeQueries=true", uri);
		checked = document.getElementById("exclude_folders").checked;
		if (checked) uri = this.add("excludeReadOnlyFolders=true", uri);
		checked = document.getElementById("expand_queries").checked;
		if (checked) uri = this.add("expandQueries=true", uri);
		checked = document.getElementById("show_sessions").checked;
		if (checked) uri = this.add("showSessions=true", uri);
		checked = document.getElementById("resolve_titles").checked;
		if (checked) uri = this.add("resolveNullBookmarkTitles=true", uri);
		checked = document.getElementById("include_hidden").checked;
		if (checked) uri = this.add("includeHidden=true", uri);
		checked = document.getElementById("apply_containers").checked;
		if (checked) uri = this.add("applyOptionsToContainers=true", uri);

		value = this.trim(document.getElementById("exclude_annotation").value);
		if (value) uri = this.add("excludeItemIfParentHasAnnotation=" + value, uri);

		value = this.trim(document.getElementById("original_title").value);
		if (value) uri = this.add("originalTitle=" + value, uri);

		value = document.getElementById("max_results").value;
		if (value && value > 0) uri = this.add("maxResults=" + value, uri);

		value = document.getElementById("query_type").value;
		if (value) uri = this.add("queryType=" + value, uri);

		value = document.getElementById("redirects_mode").value;
		if (value) uri = this.add("redirectsMode=" + value, uri);

		//Display it
		document.getElementById("place_uri").value = uri;
		this.originalURI = uri;

		//Run it to check it works? (may need to encode it first)
	},

	add: function(value, uri) {
		if (this.amp)
			uri += "&";
		else
			this.amp = true;

		uri += value;
		return uri;
	},

	trim: function(theString) {
		theString = theString.replace( /^\s+/g, "" );
		return theString.replace( /\s+$/g, "" );
	},

	//When the OK button is pressed, save the changes to the search
	onDialogAccept: function() {
		var bm = PlacesUtils.bookmarks;
		var title = this.trim(document.getElementById("query_name").value);
		if (!title) {
			this.alert('no_title');
			return false;
		}

		//Has it been changed manually, if so then preserve it, otherwise 'apply' and gui changes
		var location = document.getElementById("place_uri").value;
		if (location == this.originalURI) {
			this.onDialogApply();
			location = document.getElementById("place_uri").value;
		}

		if (!location.substr(0, 6) == "place:") {
			this.alert('invalid_uri');
			return false;
		}

		//Encode the URI (no way of doing this easily cos encode URI doesn't seem to work)
		location = location.slice(6);
		var params = location.split("&");
		location = "place:";
		this.amp = false;
		for (var i=0; i<params.length; i++) {
			var nv = params[i].split("=");
			location = this.add(nv[0] + "=" + encodeURIComponent(nv[1]), location);
		}

		var uri = null;
		try {
			uri = PlacesUtils._uri(location);
		} catch(e) {
			this.alert('invalid_uri');
			throw e;
			return false;
		}
		if (this.copyOrNew) {
			try {
				itemId = bm.insertBookmark(PlacesUtils.unfiledBookmarksFolderId, uri, bm.DEFAULT_INDEX, title);

				//Make it syncplaces friendly
				PlacesUtils.annotations.setItemAnnotation(itemId, this.DATE_ADDED_ANNO, new Date().getTime() * 1000, 0, PlacesUtils.annotations.EXPIRE_NEVER);

			} catch(e) {
				this.alert('failed_to_add');
				throw e;
				return false;
			}
		}
		else {
			try {
				var itemId = this.prefs.getIntPref("searchID");
				bm.changeBookmarkURI(itemId, uri);
				bm.setItemTitle(itemId, title);
			} catch(e) {
				this.alert('failed_to_change');
				throw e;
				return false;
			}
			//Make it syncplaces friendly
			try {
				PlacesUtils.annotations.getItemAnnotation(itemId, this.DATE_ADDED_ANNO);
			} catch (e) {
				PlacesUtils.annotations.setItemAnnotation(itemId, this.DATE_ADDED_ANNO, new Date().getTime() * 1000, 0, PlacesUtils.annotations.EXPIRE_NEVER);
			}
		}
		return true;
	},

	//Display my own style alert
	alert: function(key) {
		var bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
										.getService(Components.interfaces.nsIStringBundleService)
										.createBundle("chrome://searchplaces/locale/searchplaces.properties");
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
														.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null,bundle.GetStringFromName('dialog_title'), bundle.GetStringFromName(key));
	}
};

