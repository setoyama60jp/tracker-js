(function (window, namespace, undefined) {
    var $ns = window[namespace];
    if (!$ns) {
        $ns = {};
        window[namespace] = $ns;
    }
    var $doc = window.document;
    var isSecure = $doc.location.protocol === 'https:';

    var defaultServer = "tracker.slash-7.com";

    var encodeObj = function (dataObj) {
        return $ns.Base64.encodeURI($ns.json.stringify(dataObj));
    };


    function Network(code, server) {
        this.code = code;
        this.baseUrl = (isSecure ? "https://" : "http://") + (server || defaultServer);
    }

    // prototype alias to define methods
    var $m = Network.prototype;

    $m.trackEndpoint = function () {
        return "/track/" + this.code;
    };

    $m.trackImageUrl = function () {
        return this.baseUrl + "/track.gif";
    };

    $m.trackUrl = function () {
        return this.baseUrl + this.trackEndpoint();
    };

    $m.getImage = function (dataObj) {
        var img = new Image(1, 1);
        img.onload = function () {
        };
        var queryString = "code=" + this.code + "&data=" + encodeObj(dataObj);
        img.src = this.trackImageUrl() + "?" + queryString;
    };

    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch (e) {
        }
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
        }
    }

    $m.xhr = window.ActiveXObject ?
        function () {
            return createStandardXHR() || createActiveXHR();
        } : createStandardXHR;

    /**
     * Send an object to SLASH-7.
     */
    $m.send = function (dataObj) {
        var self = this;
        var xhr = this.xhr();
        var supportCors = !!xhr && ("withCredentials" in xhr);
        try {
            if (xhr && supportCors) {
                xhr.open("POST", this.trackUrl(), true);
                xhr.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status !== 200) {
                        self.getImage(dataObj);
                    }
                };
                xhr.setRequestHeader(
                    "Content-Type",
                    'application/x-www-form-urlencoded; charset=UTF-8'
                );
                xhr.send("data=" + encodeObj(dataObj));
            } else {
                this.getImage(dataObj);
            }
        } catch (e) {
            this.getImage(dataObj);
        }
    };
    $ns.Network = Network;
}(this, "slash7"));
