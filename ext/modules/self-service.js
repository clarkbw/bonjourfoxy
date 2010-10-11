/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et: */
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
 * The Original Code is self-service.js.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
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

const EXPORTED_SYMBOLS = ['bonjourSelfService'];

const ALL_INTERFACES = 0;

var gGlobalObject = null;

var bonjourSelfService = function bonjourSelfService(name) {
  this._name = name;
  this._service = "_http._tcp,_firefox";
  this._domain = "";
  this._host = "";
  this._port = 8777;
  this._path = "/";
  this._pathArgs = [];
  this._mozPathArgs = Components.classes["@mozilla.org/array;1"]
                                .createInstance(Components.interfaces.nsIMutableArray);
  this._interfaces = ALL_INTERFACES;

  this._instance = null;
  this._DNSSDService = null;
  this._log = null;
}

bonjourSelfService.prototype =  {
  getService: function(name) {
    if (gGlobalObject == null) {
      gGlobalObject = new bonjourSelfService(name);
    }
    return gGlobalObject;
  },
  get instance() {
    return this._instance;
  },
  set instance(value) {
    this._instance = value;
  },
  setName: function (name) {
    this._name = name;
  },
  setPathArgs: function(pathArgs) {
    this._pathArgs = pathArgs;
  },
  start : function () {
    try {
      if (this.instance == null) {

        var kvPairPath = this.mozVar(this._path);
        this._mozPathArgs.appendElement(kvPairPath, 0);

        for (var i in this._pathArgs) {
          var kvPair = this.mozVar(pathArgs[i]);
          this._mozPathArgs.appendElement(kvPair, 0);
        }

        this.instance = this._register();
      }

    } catch (e) {
      this.log("start error: " + e);
    }
  },
  reset : function (name) {
    try {
      this.stop();
      if (name)
        this.setName(name);
      this.start();
    } catch (e) {
      this.log("error resetting service: " + e);
    }
  },
  stop : function () {
    try {
      this.instance.stop();
      this.instance = null;
    } catch (e) {
      this.log("error stopping service: " + e);
    }
  },
  get DNSSDService() {
    if (!this._DNSSDService)    {
      this._DNSSDService = Components.classes["@bonjourfoxy.net/BFDNSSDService;1"]
                                     .createInstance(Components.interfaces.IBFDNSSDService);
     }
     return this._DNSSDService;
  },
  _register: function() {
    return this.DNSSDService.register(ALL_INTERFACES, this._name, this._service,
                                      this._domain, this._host, this._port,
                                      this._mozPathArgs,
                                      function(svc, add, error, sName, rType, rDomain) {
                                        if (!error) {
                                            selfService.log("registerService " + ["callback -", sName,
                                                                (add ? "advertising in" : "removed from"),
                                                                "registration domain", rDomain].join(" "));
                                        } else {
                                            selfService.log("registerService call back fired - error #" + error);
                                        }
                                       });
  },
  log: function(msg)  {
    if (!this._log)  {
      this._log = Components.classes["@mozilla.org/consoleservice;1"]
                            .getService(Components.interfaces.nsIConsoleService);
    }
    this._log.logStringMessage(msg);
  },
  mozVar: function(v) {
    var mv = this._mozVar();
    mv.setFromVariant(v);
    return mv;
  },
  _mozArray: function() {
    return Components.classes["@mozilla.org/array;1"]
                     .createInstance(Components.interfaces.nsIMutableArray);
  },
  _mozVar: function() {
    return Components.classes["@mozilla.org/variant;1"]
                     .createInstance(Components.interfaces.nsIWritableVariant);
  }
};
