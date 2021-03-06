/**
 * Request.js
 * Copyright (c) 2012 Tomasz Krzyszczyk
 *
 * https://github.com/mekto/Request.js
 *
 * Request.js is freely distributable under the MIT license.
 */

(function(exports) {

  var extend = function(obj) {
    var extensions = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < extensions.length; ++i) {
      for (var property in extensions[i])
        obj[property] = extensions[i][property];
    }
    return obj;
  };

  var Request = function(options) {
    this.options = extend({
      url: null,
      method: 'GET',
      data: '',
      success: null,
      error: null,
      complete: ''
    }, options || {});

    this.xhr = this.getBrowserXHR();
    this.headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'text/javascript, text/html, application/json, application/xml, text/xml, */*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    };
  };

  Request.prototype = {
    constructor: Request,

    getBrowserXHR: function() {
      return (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : (XMLHttpRequest && new XMLHttpRequest()) || null;
    },

    onStateChange: function(success, error, complete) {
      if (this.xhr.readyState === 4) {
        var isSuccess = (this.xhr.status >= 200 && this.xhr.status < 300 || this.xhr.status === 304 || this.xhr.status === 1223);
        if (isSuccess) {
          var response = {
            xhr: this.xhr,
            contentType: this.xhr.getResponseHeader('Content-Type'),
            text: this.xhr.responseText
          };
          if (response.contentType === 'application/json')
            response.json = JSON.parse(response.text, true);
          if (success)
            success.call(this, response);
        } else {
          if (error)
            error.call(this);
        }
        if (complete)
          complete.call(this);
      }
    },

    send: function(options) {
      var config = extend({}, this.options, options || {});

      this.xhr.onreadystatechange = this.onStateChange.bind(this, config.success, config.error, config.complete);

      this.xhr.open(config.method.toUpperCase(), config.url, true);
      for (var key in this.headers)
        this.xhr.setRequestHeader(key, this.headers[key]);

      var data = config.data;
      if (data === Object(data))
        data = Request.toQueryString(data);
      this.xhr.send(data);

      return this;
    }
  };

  Request.toQueryString = function(object, base) {
    var result, queryString = [];

    Object.keys(object).forEach(function(key) {
      var value = object[key];
      if (base)
        key = base + '[' + key + ']';

      if (value === Object(value)) {
        result = toQueryString(value, key);
      } else if (Array.isArray(object)) {
        var qs = {};
        for (var j = 0; j < object.length; j++)
          qs[j] = object[j];
        result = toQueryString(qs, key);
      } else {
        result = key + '=' + encodeURIComponent(value);
      }
      if (result !== null)
        queryString.push(result);
    });
    return queryString.join('&');
  };

  exports.Request = Request;

})(typeof exports !== 'undefined' ? exports : this);
