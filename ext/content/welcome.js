bonjourfoxy.welcome = {
    initialize: function() {
        var getEl = bonjourfoxy.welcome.getElement;
        //switch(bonjourfoxy.lib.platform()) {
        //    case 'mac':
        //        getEl('toolbarImageWinNix').style.display = "none";
        //        getEl('settingsTxtWin').style.display = "none";
        //    break;
        //    case 'win':
        //        getEl('toolbarImageMac').style.display = "none";
        //        getEl('settingsTxtNixMac').style.display = "none";
        //    break;
        //    case 'nix':
        //        getEl('toolbarImageMac').style.display = "none";
        //        getEl('settingsTxtWin').style.display = "none";
        //    break;
        //}
        //getEl("bfversion").innerHTML = " " + bonjourfoxy.lib.version();
        getEl("name").value = bonjourfoxy.welcome.getName();
        getEl("btnSetName").addEventListener("click", bonjourfoxy.welcome.setName, false);
        return;
        getEl("btnAlertExample").addEventListener("click", bonjourfoxy.welcome.exampleAlert, false);
        getEl("btnCustToolbar").addEventListener("click", bonjourfoxy.welcome.custToolbar, false);
        getEl("btnTbExample").addEventListener("click", bonjourfoxy.welcome.toggleSidebar, false);
        getEl("btnToggleStatusIcon").addEventListener("click", function() {
            bonjourfoxy.welcome.toggleBoolPref("statusbaricon");
        }, false);
        getEl("btnToggleAlerts").addEventListener("click", function() {
            bonjourfoxy.welcome.toggleBoolPref("alerts");
        }, false);
        bonjourfoxy.lib.addUserPrefsObserver(bonjourfoxy.welcome);
        bonjourfoxy.welcome.updateButtonsFromPrefs();
    },
    shutdown: function() {
        bonjourfoxy.lib.rmvUserPrefsObserver(bonjourfoxy.welcome);
    },
    toggleBoolPref: function (name) {
        var prefs = bonjourfoxy.lib.userPrefs();
        var prefTrue = prefs.getBoolPref(name);
        prefs.setBoolPref(name, prefTrue ? false : true);
    },
    updateButtonsFromPrefs: function()    {
        var getEl = bonjourfoxy.welcome.getElement;
        var prefs = bonjourfoxy.lib.userPrefs();
        var sbEnabled = prefs.getBoolPref("statusbaricon");
        var sbAlerts = prefs.getBoolPref("alerts");
        getEl("btnToggleStatusIcon").innerHTML = sbEnabled ? "Disable Status Icon" : "Enable Status Icon";
        getEl("btnToggleAlerts").innerHTML = sbAlerts ? "Disable Alerts" : "Enable Alerts";
    },
    observe: function(subject, topic, data) {
        if (topic == "nsPref:changed")  {
            if (data == "statusbaricon" || data =="alerts" ) {
                bonjourfoxy.welcome.updateButtonsFromPrefs();
            }
        }
    },
    _elements: Object(),
    getElement: function(element) {
        if (!bonjourfoxy.welcome._elements[element])    {
            bonjourfoxy.welcome._elements[element] = document.getElementById(element);
        }
        return bonjourfoxy.welcome._elements[element];
    },
    setName : function () {
      try {
        var name = bonjourfoxy.welcome.getElement("name").value;
        bonjourfoxy.lib.userPrefs().setCharPref("user.name", name);
        bonjourfoxy.lib.resetSelfService(name);
      } catch (e) {
        bonjourfoxy.lib.log("error setting name: " + e);
      }
    },
    getName: function() {
      return bonjourfoxy.lib.userPrefs().getCharPref("user.name");
    },
    custToolbar: function()    {
        bonjourfoxy.lib.windowMediator().getMostRecentWindow("navigator:browser").BrowserCustomizeToolbar();
    },
    toggleSidebar: function()   {
        bonjourfoxy.lib.windowMediator().getMostRecentWindow("navigator:browser").toggleSidebar('viewBonjourServices');
    },
    exampleAlert: function() {
        bonjourfoxy.lib.alert("Service Discovered", "Example Service");
    },
}
window.addEventListener("load", bonjourfoxy.welcome.initialize, false);
window.addEventListener("unload", bonjourfoxy.welcome.shutdown, false);
