bonjourfoxy.lib = {
    version: function() {
        var extensionid = bonjourfoxy.lib.userPrefs().getCharPref("extensionid");
        return Components.classes["@mozilla.org/extensions/manager;1"]
                .getService(Components.interfaces.nsIExtensionManager)
                .getItemForID(extensionid)
                .version;
    },
    uistring: function(string) {
        return document.getElementById("string-bundle").getString(string);
    },
    _ServiceTracker: null,
    ServiceTracker: function() {
        if (!this._ServiceTracker)  {
            this._ServiceTracker = Components.classes["@bonjourfoxy.net/BFServiceTracker;1"]
                                   .getService(Components.interfaces.IBFServiceTracker);
        }
        return this._ServiceTracker;
    },
    _DNSSDService: null,
    DNSSDService: function() {
        if (!this._DNSSDService)    {
            this._DNSSDService = Components.classes["@bonjourfoxy.net/BFDNSSDService;1"]
                                 .createInstance(Components.interfaces.IBFDNSSDService);
         }
         return this._DNSSDService;
    },
    _windowMediator: null,
    windowMediator: function() {
        if (!this._windowMediator)  {
            this._windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                                   .getService(Components.interfaces.nsIWindowMediator);
       }
       return this._windowMediator;
    },
    _observerService: null,
    observerService: function() {
        if (!this._observerService) {
            this._observerService = Components.classes["@mozilla.org/observer-service;1"]
                .getService(Components.interfaces.nsIObserverService);
        }
        return this._observerService;
    },
    _promptsService: null,
    promptsService: function() {
        if (!this._promptsService)  {
            this._promptsService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                   .getService(Components.interfaces.nsIPromptService);
        }
        return this._promptsService;
    },
    _consoleService: null,
    consoleService: function()  {
        if (!this._consoleService)  {
            this._consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                               .getService(Components.interfaces.nsIConsoleService);
        }
        return this._consoleService;
    },
    _alertsService: null,
    alertsService: function() {
        if (!this._alertsService)   {
            this._alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                              .getService(Components.interfaces.nsIAlertsService);
        }
        return this._alertsService;
    },
    alert: function(title, body) {
        this.alertsService().showAlertNotification(null, title, body, null, null, null);
    },
    log: function(text) {
        this.consoleService().logStringMessage(text);
    },
    dialog: function(title, body) {
        this.promptsService().alert(window, title, body);
    },
    userPrefs: function() {
        return Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.bonjourfriends@momo.");
    },
    addUserPrefsObserver: function(fn) {
        bonjourfoxy.lib.userPrefs()
            .QueryInterface(Components.interfaces.nsIPrefBranch2)
            .addObserver("", fn, false);
    },
    rmvUserPrefsObserver: function(fn) {
        bonjourfoxy.lib.userPrefs()
            .QueryInterface(Components.interfaces.nsIPrefBranch2)
            .removeObserver("", fn);
    },
    callInContext: function(fn) {
        var context = this;
        return function() { fn.apply(context, arguments); }
    },
    openPrefs: function() {
        var paneID = "bonjourfoxy-prefpane";
        var features = "chrome,titlebar,toolbar,centerscreen,true,dialog=no";
        var win = bonjourfoxy.lib.windowMediator()
                    .getMostRecentWindow("Browser:Preferences");
        if (win) {
            win.focus();
            if (paneID) {
                var pane = win.document.getElementById(paneID);
                win.document.documentElement.showPane(pane);
            }
        } else {
            openDialog("chrome://bonjourfoxy/content/options.xul", "Preferences", features, paneID);
        }
    },
    userPrefLinkTarget: function()  {
        return this.userPrefs().getCharPref("target");
    },
    openLink: function(url, target) {
        target = typeof(target) != "undefined" ? target : "user";
        switch (target) {
            case "current":     //  current tab
            case "tab":         //  new tab
            case "tabshifted":  //  new tab (background)
            case "window":      //  new window
            break;
            default:            // otherwise, user preference
            target = this.userPrefLinkTarget();
        }
        bonjourfoxy.lib.windowMediator()
            .getMostRecentWindow('navigator:browser')
            .openUILinkIn(url, target);
    },
    epochTime: function() {
        return new Date().getTime();
    },
    _platform: null,
    platform: function()    {
        if (!this._platform) {
            var platform = navigator.platform;
            this._platform = platform.match(/Mac/) ? 'mac': platform.match(/Win/) ? 'win': 'nix';
        }
        return this._platform;
    }
};