var langGlobal = null;
var langFlavorGlobal = null;
var hcbLang = null;

if (typeof(jQuery.hcb) == 'undefined')
	jQuery.hcb = {};

jQuery.hcb.locale = null;

// for IE, emulate console object + functions:
if (typeof(console) == 'undefined')
	console = {};
if (typeof(console.log) == 'undefined')
	console.log = function(){};
if (typeof(console.debug) == 'undefined')
	console.debug = function(){};

if (jQuery.browser.msie)
{
	console.debug("We're running IE "+jQuery.browser.version+", setting default AJAX option cache=false");
	jQuery.ajaxSetup({
		cache: false
	});
}

if (!jQuery.hcb.proxy)
{
	jQuery.hcb.proxy = {
		supported: false,
		forwarderPrefix: '/mobileForwarder/servlet/forwarder'
	};
}

jQuery.hcb.proxy.init = function()
{
	var curloc = document.location.href;
	
	// re-fetch curloc and inspect its headers
	jQuery.ajax({
		async: false,
		url: curloc, 
		complete: function(xhr, textStatus) {
			//console.log(xhr.getAllResponseHeaders().toLowerCase());
			var svr = (xhr.getResponseHeader('Server') || 'unknown').toLowerCase();
			jQuery.hcb.proxy.server = svr;
			if (svr != 'unknown')
			{
				//var isLocal = ((svr.indexOf('lighttpd') == 0) || (svr.indexOf('hcb_web') == 0));
				var isRemote = ((svr.indexOf('apache') == 0) || (svr.indexOf('glass') != -1));
				jQuery.hcb.proxy.supported = isRemote;
				console.log('Server string: "'+jQuery.hcb.proxy.server+'"  Proxy: '+jQuery.hcb.proxy.supported);
			}
			else // Plan B
			{
				var hostname = document.location.hostname;

				// portal used for proxying only have tlds :.nl,com,int in url
				if (hostname.indexOf(".nl")>0 || hostname.indexOf(".com")>0 || hostname.indexOf(".int")>0)
				{
					jQuery.hcb.proxy.supported = true;
				}
				console.log('Location hostname: "'+hostname+'"  Proxy: '+jQuery.hcb.proxy.supported);
			}
    	}
    });
}

jQuery.hcb.proxy.rewriteUrl = function(url)
{
	if (!jQuery.hcb.proxy.supported)
		return url;
	
	// only proxy absolute requests
	if (url && (url[0] == '/'))
	{
		return jQuery.hcb.proxy.forwarderPrefix + url;
	}

	return url;
}

jQuery.get_ORIG = jQuery.get;
jQuery.get = function()
{
	arguments[0] = jQuery.hcb.proxy.rewriteUrl(arguments[0]);
	return jQuery.get_ORIG.apply(this, arguments);
}

jQuery.hcb.getSyncJSON = function(url, params)
{
	var response = null;
	
	jQuery.ajax({
		type: 'get',
		async: false,
		url: jQuery.hcb.proxy.rewriteUrl(url), 
		data: params,
		dataType: 'json',
		success: function(data, textStatus, jqXHR) {
			response = data;
    	},
    	error: function(jqXHR, textStatus, errorThrown) {
	        console.log("getSyncJSON error: " + textStatus + " incomingText: " + jqXHR.responseText);
    	}
    });
    
    return response;
}

function ts(s, args)
{
	var t = null;
	//if(!t && hcb.langFlavor) t = hcb.langFlavor[s];
	if(!t && langFlavorGlobal) t = langFlavorGlobal[s];
	if(!t && hcbLang) t = hcbLang[s];
	if(!t && langGlobal) t = langGlobal[s];
	if(!t) 
	{
		if(!args)
			return s;
		else
		{
			if(typeof(args) == "array")
			{
				var t = "-"+s;
				for(var arg in args)
				{
					t += "-" + ts(args[arg]);
				}
			}
			else if(typeof(args) == "object")
			{
				var t = "-"+s;
				for(var arg in args)
				{
					t += "-" + arg + ":" + ts(args[arg]);
				}
			}
			else
				return "-" + s + "-" + ts(args);
		}
	}
	if(!args)
		return t;
	else
		return jQuery.vsprintf(t, args);
}

jQuery.hcb.translateElemAttr = function(node, attr)
{
	if(!node || !node.getAttribute)
	{
	}
	var tsVal = node.getAttribute(attr);
	if(tsVal)
	{
		node.setAttribute(attr, ts(tsVal));
	}
}

jQuery.hcb.translateNode = function(/*domNode*/node)
{
	//Tagnames never to translate
	var nonos = {"style": 1, "script": 1};
	// Directly translate textNodes
	// Test for only-whitespace nodes?
	if(node && (node.nodeType == 3 /*textNode*/) /*&& (node.nodeValue.replace(/\s|\r|\n/g, '').length)*/)
	{
		//console.debug("translated '"+node.nodeValue+"' to '"+ts(node.nodeValue)+"'");
		node.nodeValue = ts(node.nodeValue);
	}
	//Recursively translate child elements
	else if (node && node.nodeType == 1 /*element*/)
	{
		if(nonos[node.tagName.toLowerCase()])
			return;
		//Allways translate 'label' and 'title' attribute
		jQuery.hcb.translateElemAttr(node, "label");
		jQuery.hcb.translateElemAttr(node, "title");
		//See if there is a custom attribute specified to get translated
		var tsAttr  = node.getAttribute("tsAttr");
		if(tsAttr) hcb.translateElemAttr(node, tsAttr);
		for(var currChild in node.childNodes)
		{
			jQuery.hcb.translateNode(node.childNodes[currChild]);
		}
	}
}

/**
 * hcb.translatePage: Translate an HTML page.
 * automatically translates label arguments and 
 * textnodes, can be instructed to translate a given argument
 * in a tagusing 'tsAttr="attribute-to-be-translated"'
**/
jQuery.hcb.translatePage = function()
{
	//Walk the entire dom tree
	jQuery.hcb.translateNode(document.documentElement);
}

jQuery.hcb.getLocale = function()
{
	var localeInfo = jQuery.hcb.getSyncJSON("/hcb_config?action=getLocale");
	if(localeInfo)
		jQuery.hcb.locale = localeInfo.locale;
}

//Load translation files
jQuery.hcb.initTranslation  = function()
{
	if(!jQuery.hcb.locale) 
	{
		var l_lang;
	  if (navigator.userLanguage) // Explorer
	    l_lang = navigator.userLanguage;
	  else if (navigator.language) // FF
	    l_lang = navigator.language;
	  else
	  {
	    l_lang = "en_GB";
	  }

		//Locale might be in the en-GB format. Reformat to en_GB
		l_lang = l_lang.split('-').join('_');
		console.log("No hcb locale yet, browser local used: "+l_lang);
		jQuery.hcb.locale = l_lang
	}
	
	//Lang files are in the format _en.js need to shorten en_GB to en
	var shortLocale = jQuery.hcb.locale.split("_")[0];

	//Disabled Global/Flavor for now!
	//langGlobal = jQuery.hcb.getSyncJSON("/lang_" + suffix + ".js");
	//langFlavorGlobal = jQuery.hcb.getSyncJSON("/lang_flavor_" + suffix + ".js");
	hcbLang = jQuery.hcb.getSyncJSON("lang_" + shortLocale + ".js");
}

//Recheck locale and retranslate if neeed
jQuery.hcb.reinitTranslation = function()
{
	var oldLocale = jQuery.hcb.locale;
	jQuery.hcb.getLocale();
	if(jQuery.hcb.locale && (jQuery.hcb.locale != oldLocale))
	{
		jQuery.hcb.initTranslation();
		jQuery.hcb.translatePage();
	}
}

// do this right away!
jQuery.hcb.proxy.init();
jQuery.hcb.getLocale();
jQuery.hcb.initTranslation();
