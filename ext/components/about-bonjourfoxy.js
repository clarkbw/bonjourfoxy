Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function BonjourFoxyAboutHandler() { }

BonjourFoxyAboutHandler.prototype = {
    newChannel : function(aURI) {
        if (aURI.spec != "about:bonjourfoxy") return null;
        var channel = Components.classes["@mozilla.org/network/io-service;1"]
                                .getService(Components.interfaces.nsIIOService)
                                .newChannel("chrome://bonjourfoxy/content/welcome.html", null, null);
        channel.originalURI = aURI;
        return channel;
    },
    getURIFlags: function(aURI) {
        return Components.interfaces.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT;
    },

    classDescription: "BonjourFox About Handler",
    classID: Components.ID("{5af05bff-fb13-4fe7-b995-9e15fe1db813}"),
    contractID: "@mozilla.org/network/protocol/about;1?what=bonjourfoxy",
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIAboutModule]),
}

function NSGetModule(aCompMgr, aFileSpec) {
  return XPCOMUtils.generateModule([BonjourFoxyAboutHandler]);
}
