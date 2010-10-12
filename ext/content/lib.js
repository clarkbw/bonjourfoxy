bonjourfoxy.lib = {
    httpd : {},
    dnsd: {},
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
    _SelfService : null,
    SelfService: function() {
        if (!this._SelfService)  {
            this._SelfService = new this.dnsd.bonjourSelfService(name);
       }
       return this._SelfService;
    },
    selfServer: null,
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
    alert: function(title, body, img) {
        this.alertsService().showAlertNotification(img, title, body, null, null, null);
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
    resetSelfService : function(name) {
      try {
        this.SelfService().getService().reset(name);
      } catch (e) {
        bonjourfoxy.lib.log("error reseting self service: " + e);
      }
    },
    registerSelfService : function(name) {
      var n = name || bonjourfoxy.lib.userPrefs().getCharPref("user.name");
      this.SelfService().getService(n).start(this.startSelfServer);
      bonjourfoxy.lib.log("registeredSelfService : " + n);
    },
    unRegisterService: function() {
      // Don't shutdown our service unless this is the last window closing
      if (! bonjourfoxy.lib.windowMediator().getEnumerator('navigator:browser').hasMoreElements())
        this.SelfService().getService().stop();
    },
    startSelfServer: function(hostname) {
        try {
          function DefaultHandler() {
            this.handle = function(request, response) {
              try {
              var responseBody = "<html>" +
                                 "<head>" +
                                 "<script type='text/javascript' src='http://code.jquery.com/jquery-1.4.2.js'></script>\n" +
                                 "<script type='text/javascript'>\n" +
                                 "$(document).ready(function() { \n"+
                                    "$('#sendMessage').submit(function() { \n" +
                                      "$.ajax( { type : 'POST', url : '/message', processData : false, data : JSON.stringify({ 'sender' : $('#sender').val(), 'message' : $('#message').val() }) , success : function() {  $('#message').val('').focus(); alert('Message Sent!'); } }); \n" +
                                      "return false; \n" +
                                    "}); \n" +
                                 "}); \n" +
                                 "</script>\n" +
                                 "<style>\n" +
                                 "form { display: inline-block; } \n" +
                                 "input[type='text'],textarea { border: 1px solid #999; min-width: 400px; padding: 4px; margin: 4px; font-size: large; -moz-border-radius: 2px; } \n" +
                                 "label { display: inline-block; min-width: 100px; color: #666; vertical-align: top; font-variant:small-caps; padding: 6px; } \n" +
                                 "* { font-family: sans-serif; } \n" +
                                 "</style>\n" +
                                 "</head>" +
                                 "<body>" +
                                 "<h1>The Firefox of " + bonjourfoxy.lib.userPrefs().getCharPref("user.name") + "</h1>" +
                                 "<form id='sendMessage'>" +
                                 "<div><label for='sender'>Your Name: </label><input type='text' name='sender' id='sender'/></div>" +
                                 "<div><label for='message'>Message: </label><textarea name='message' id='message'></textarea></div>" +
                                 "<div style='text-align: right;'><input type='submit' value='Send'/></div>" +
                                 "</form>" +
                                 "</body></html>";
              response.setStatusLine(request.httpVersion, 200, "OK");
              response.setHeader("Content-Type", "text/html", false);
              response.setHeader("Content-Length", responseBody.length.toString(),
                                 false);
              response.setHeader("Access-Control-Allow-Origin", "*", false);
              response.bodyOutputStream.write(responseBody, responseBody.length);
              } catch (e) {
                Components.classes["@mozilla.org/consoleservice;1"]
                          .getService(Components.interfaces.nsIConsoleService)
                          .logStringMessage("request.body.error: " + e);
              }
            };
          }
          function MessageHandler() {
            this.handle = function(request, response) {
              try {
              var readBody = request.readBody();
              var body = JSON.parse(readBody);
              //Components.classes["@mozilla.org/consoleservice;1"]
              //          .getService(Components.interfaces.nsIConsoleService)
              //          .logStringMessage("MessageHandler.request.body: " + body + "\n" + readBody);
              bonjourfoxy.lib.alert(body.sender, body.message);
              var responseBody = "OK";
              response.setStatusLine(request.httpVersion, 200, "OK");
              response.setHeader("Content-Type", "text/html", false);
              response.setHeader("Content-Length", responseBody.length.toString(),
                                 false);
              response.setHeader("Access-Control-Allow-Origin", "*", false);
              response.bodyOutputStream.write(responseBody, responseBody.length);
              } catch (e) {
                Components.classes["@mozilla.org/consoleservice;1"]
                          .getService(Components.interfaces.nsIConsoleService)
                          .logStringMessage("MessageHandler.error: " + e + "\n" + readBody);
              }
            };
          }

          var Server = function Server(port, host) {
            var server = new bonjourfoxy.lib.httpd.nsHttpServer();
            server.start(port, host);
            var path = Components.classes["@mozilla.org/file/directory_service;1"]
                                    .getService(Components.interfaces.nsIProperties)
                                    .get("Desk", Components.interfaces.nsILocalFile);
            server.registerDirectory("/", path);
            server.registerPathHandler("/", new DefaultHandler());
            server.registerPathHandler("/message", new MessageHandler());
            return server;
          };

          if (this.selfServer == null) {
            this.selfServer = Server(8777, hostname || this.SelfService().serviceHostName);
          }

        } catch (e) {
          bonjourfoxy.lib.log("registerService: error creating web service " + e);
        }
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

try {
  Components.utils.import("resource://bonjourfoxy/modules/httpd.js", bonjourfoxy.lib.httpd);
} catch (e) {
  Components.classes["@mozilla.org/consoleservice;1"]
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage("Error importing HTTPD: " + e);
}

try {
  Components.utils.import("resource://bonjourfoxy/modules/self-service.js", bonjourfoxy.lib.dnsd);
} catch (e) {
  Components.classes["@mozilla.org/consoleservice;1"]
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage("Error importing SelfService: " + e);
}