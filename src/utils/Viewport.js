/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-8-6
 * Time: 上午11:49
 * To change this template use File | Settings | File Templates.
 */
(function(){
    var contentArr = [];
    contentArr.push("user-scalable = no");
    var ua = navigator.userAgent;
    var ver = "";
    if (ua.match(/iPhone/i)) {
        contentArr.push("target-densitydpi=high-dpi");
        contentArr.push("width=780");
        ver = "iPhone Safari";
    }else if (ua.match(/Android/i)) {
        if(ua.match(/UC/i)){
            contentArr.push("initial-scale=1.0");
            contentArr.push("target-densityDpi=device-dpi");
            ver = "Android UC ";
        }
        else{
            contentArr.push("width = device-width");
            contentArr.push("target-densityDpi=device-dpi");
            ver = "Android WebKit";
        }
    }else if (ua.match(/IUC/i)) {
        contentArr.push("width = 780");
        ver = "iOS UC";
    }else{
        contentArr.push("width = 780");
        ver = "Other";
    }
    document.title += " " + ver;
    var viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute('content',contentArr.join(", "));
    window.scrollTo(0, 1);
})();