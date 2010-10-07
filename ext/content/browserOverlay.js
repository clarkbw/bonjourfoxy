bonjourfoxy.overlay = {
    initialize: function() {
        bonjourfoxy.lib.addUserPrefsObserver(bonjourfoxy.overlay);
        bonjourfoxy.lib.observerService().addObserver(bonjourfoxy.overlay, "BFServiceTracker_Change", false);
        bonjourfoxy.lib.registerService("Bryan Clark", "_http._tcp,_firefox", "", "mozillamessaging.com", 80, "/", []);
        bonjourfoxy.overlay.displayStatusBarIcon();
        bonjourfoxy.overlay.setStatusBarIcon();
        bonjourfoxy.overlay.displayWelcome();
        document.getElementById("mnuItemBonjourBrowser").addEventListener("command", function() {
            window.open('chrome://bonjourfoxy/content/browser.xul',
                        'bonjourfoxyBrowser',
                        'chrome,resizable=yes,width=600,height=600'
                        );
        }, false);
    },
    shutdown: function() {
        bonjourfoxy.lib.rmvUserPrefsObserver(bonjourfoxy.overlay);
        bonjourfoxy.lib.observerService().removeObserver(bonjourfoxy.overlay, "BFServiceTracker_Change");
        bonjourfoxy.lib.unRegisterService();
    },
    setlabel: function(elid, label) {
        document.getElementById(elid).setAttribute('label', label);
    },
    observe: function(subject, topic, data) {
        if (topic == "nsPref:changed")  {
            if (data == "statusbaricon") {
                bonjourfoxy.overlay.displayStatusBarIcon();
            }
        }
        if (topic == "BFServiceTracker_Change")  {
            bonjourfoxy.overlay.setStatusBarIcon();
        }
    },
    displayWelcome: function()  {
        var bfVer = bonjourfoxy.lib.version();
        if (bonjourfoxy.lib.userPrefs().getCharPref("rev") != bfVer)   {
            bonjourfoxy.lib.openLink("about:bonjourfoxy", "window");
            bonjourfoxy.lib.userPrefs().setCharPref("rev", bfVer);
        }
    },
    displayStatusBarIcon: function() {
        var showstatusbar = bonjourfoxy.lib.userPrefs().getBoolPref("statusbaricon");
        var display = showstatusbar ? "display:block;" : "display:none;";
        document.getElementById('bonjourStatusIcon').setAttribute("style", display);
    },
    setStatusBarIcon: function() {
        var statusIcon = document.getElementById('bonjourStatusIcon');
        var serviceCount = bonjourfoxy.lib.ServiceTracker().countServices("__ALL__");
        var uistring = bonjourfoxy.lib.uistring;
        if (serviceCount == 0) {
            statusIcon.setAttribute("image", "chrome://bonjourfoxy/content/status_bw.png");
            statusIcon.setAttribute("tooltiptext", uistring("statusbarServices_none"));
        } else {
            statusIcon.setAttribute("image", "chrome://bonjourfoxy/content/status_color.png");
            if (serviceCount == 1) {
                statusIcon.setAttribute("tooltiptext", uistring("statusbarServices_one"));
            } else {
                statusIcon.setAttribute("tooltiptext", serviceCount + uistring("statusbarServices_many"));
            }
        }
    }
}
window.addEventListener("load", bonjourfoxy.overlay.initialize, false);
window.addEventListener("unload", bonjourfoxy.overlay.shutdown, false);
