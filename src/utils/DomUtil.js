/**
 * Dom简单操作类
 */
(function(){
    var DomUtil = {
        createDOM:function(type, props){
            var dom = document.createElement(type);
            for(var p in props)
            {
                var val = props[p];
                if(p == "style")
                {
                    for(var s in val) dom.style[s] = val[s];
                }else
                {
                    dom[p] = val;
                }
            }
            return dom;
        },
        query:function(obj){
            return document.querySelector(obj);
        },
        getElementOffset:function(elem){
            var left = elem.offsetLeft, top = elem.offsetTop;
            while((elem = elem.offsetParent) && elem != document.body && elem != document)
            {
                left += elem.offsetLeft;
                top += elem.offsetTop;
            }
            return {left:left, top:top};
        },
        css:function(dom,val){
            for(var s in val) dom.style[s] = val[s];
        }
    };
    window.DomUtil = DomUtil;
})();
