/**
* jqMobi ajax
*/
(function(window) {
        var $ = {};
        var undefined;
        /* AJAX functions */
        window.jsessionId = null;
        function empty() {
        }
        var ajaxSettings = {
            type: 'GET',
            beforeSend: empty,
            success: empty,
            error: empty,
            complete: empty,
            context: undefined,
            timeout: 0,
            crossDomain:false
        };
        $.ajax = function(opts) {
            var xhr;
            try {
                xhr = new XMLHttpRequest();
                var settings = opts || {};
                for (var key in ajaxSettings) {
                    if (!settings[key])
                        settings[key] = ajaxSettings[key];
                }
                if (!settings.contentType)
                    settings.contentType = "application/x-www-form-urlencoded";
                if (!settings.headers)
                    settings.headers = {};
                if(jsessionId){
                    settings.headers["Cookie"] = jsessionId;
                }
                if (!settings.dataType)
                    settings.dataType = "text/html";
                else {
                    switch (settings.dataType) {
                        case "script":
                            settings.dataType = 'text/javascript, application/javascript';
                            break;
                        case "json":
                            settings.dataType = 'application/json';
                            break;
                        case "xml":
                            settings.dataType = 'application/xml, text/xml';
                            break;
                        case "html":
                            settings.dataType = 'text/html';
                            break;
                        case "text":
                            settings.dataType = 'text/plain';
                            break;
                        default:
                            settings.dataType = "text/html";
                            break;
                    }
                }
                if (typeof (settings.data) === "object")
                    settings.data = $.param(settings.data);
                if (settings.type.toLowerCase() === "get" && settings.data) {
                    console.log("settings.data= "+settings.data);
                    if (settings.url.indexOf("?") === -1)
                        settings.url += "?" + settings.data;
                    else
                        settings.url += "&" + settings.data;
                }
                console.log("settings.url2= "+settings.url+"jsessionId="+jsessionId);
                if(!settings.crossDomain)
                    settings.headers["X-Requested-With"] = "XMLHttpRequest";
                var abortTimeout;
                var context = settings.context;
                xhr.onreadystatechange = function() {
                    var mime = settings.dataType;
                    if (xhr.readyState === 4) {
                        clearTimeout(abortTimeout);
                        var result, error = false;
                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                            if(jsessionId == null) jsessionId = xhr.getResponseHeader("Set-Cookie");
                            if (mime === 'application/json' && !(/^\s*$/.test(xhr.responseText))) {
                                try {
                                    result = JSON.parse(xhr.responseText);
                                } catch (e) {
                                    error = e;
                                }
                            } else
                                result = xhr.responseText;
                            //If we're looking at a local file, we assume that no response sent back means there was an error
                            if(xhr.status===0&&result.length===0)
                                error=true;
                            if (error)
                                settings.error.call(context, xhr, 'parsererror', error);
                            else {
                                settings.success.call(context, result, 'success', xhr);
                            }
                        } else {
                            error = true;
                            settings.error.call(context, xhr, 'error');
                        }
                        settings.complete.call(context, xhr, error ? 'error' : 'success');
                    }
                };
                xhr.open(settings.type, settings.url, true);
                
                if (settings.contentType)
                    settings.headers['Content-Type'] = settings.contentType;
                for (var name in settings.headers)
                    xhr.setRequestHeader(name, settings.headers[name]);
                if (settings.beforeSend.call(context, xhr, settings) === false) {
                    xhr.abort();
                    return false;
                }
                
                if (settings.timeout > 0)
                    abortTimeout = setTimeout(function() {
                        xhr.onreadystatechange = empty;
                        xhr.abort();
                        settings.error.call(context, xhr, 'timeout');
                    }, settings.timeout);
                xhr.send(settings.data);
            } catch (e) {
                console.log(e);
            }
            return xhr;
        };
        

        $.get = function(url, success) {
            return this.ajax({
                url: url,
                success: success
            });
        };
        /**
        * Shorthand call to an Ajax POST request
            ```
            $.post("mypage.php",{bar:'bar'},function(data){});
            ```

        * @param {String} url to hit
        * @param {Object} [data] to pass in
        * @param {Function} success
        * @param {String} [dataType]
        * @title $.post(url,[data],success,[dataType])
        */
        $.post = function(url, data, success, dataType) {
            if (typeof (data) === "function") {
                success = data;
                data = {};
            }
            if (dataType === undefined)
                dataType = "html";
            return this.ajax({
                url: url,
                type: "POST",
                data: data,
                dataType: dataType,
                success: success
            });
        };
        /**
        * Shorthand call to an Ajax request that expects a JSON response
            ```
            $.getJSON("mypage.php",{bar:'bar'},function(data){});
            ```

        * @param {String} url to hit
        * @param {Object} [data]
        * @param {Function} [success]
        * @title $.getJSON(url,data,success)
        */
        $.getJSON = function(url, data, success) {
            if (typeof (data) === "function") {
                success = data;
                data = {};
            }
            return this.ajax({
                url: url,
                data: data,
                success: success,
                dataType: "json"
            });
        };

        /**
        * Converts an object into a key/value par with an optional prefix.  Used for converting objects to a query string
            ```
            var obj={
            foo:'foo',
            bar:'bar'
            }
            var kvp=$.param(obj,'data');
            ```

        * @param {Object} object
        * @param {String} [prefix]
        * @return {String} Key/value pair representation
        * @title $.param(object,[prefix];
        */
        $.param = function(obj, prefix) {
            var str = [];
            for (var p in obj) {
                var k = prefix ? prefix + "[" + p + "]" : p,
                    v = obj[p];
                str.push(typeof (v) === "object" ? $.param(v, k) : (k) + "=" + encodeURIComponent(v));
            }
            return str.join("&");
        };
        /**
        * Used for backwards compatibility.  Uses native JSON.parse function
            ```
            var obj=$.parseJSON("{\"bar\":\"bar\"}");
            ```

        * @params {String} string
        * @return {Object}
        * @title $.parseJSON(string)
        */
        $.parseJSON = function(string) {
            return JSON.parse(string);
        };
        window.$ = $;
})(window);