(function(win){
    var Quark = win.Quark = win.Quark ||
    {
        global : win,
        mode : 1,
        scale : 1
    };
    /**
     * Quark框架的继承方法。
     * @param {Function} childClass 子类。
     * @param {Function} parentClass 父类。
     */
    var emptyConstructor = function() {};
    Quark.inherit = function(childClass, parentClass)
    {
        emptyConstructor.prototype = parentClass.prototype;
        childClass.superClass = parentClass.prototype;
        childClass.prototype = new emptyConstructor();
        childClass.prototype.constructor = childClass;
    };

    /**
     * 把props参数指定的属性或方法复制到obj对象上。
     * @param {Object} obj Object对象。
     * @param {Object} props 包含要复制到obj对象上的属性或方法的对象。
     * @param {Boolean} strict 指定是否采用严格模式复制。默认为false。
     * @return {Object} 复制后的obj对象。
     */
    Quark.merge = function(obj, props, strict)
    {
        for(var key in props)
        {
            if(!strict || obj.hasOwnProperty(key) || obj[key] !== undefined) obj[key] = props[key];
        }
        return obj;
    };

    /**
     * 改变func函数的作用域scope，即this的指向。
     * @param {Function} func 要改变函数作用域的函数。
     * @param {Object} self 指定func函数的作用对象。
     * @return {Function} 一个作用域为参数self的功能与func相同的新函数。
     */
    Quark.delegate = function(func, self)
    {
        var context = self || win;
        if (arguments.length > 2)
        {
            var args = Array.prototype.slice.call(arguments, 2);
            return function()
            {
                var newArgs = Array.prototype.concat.apply(args, arguments);
                return func.apply(context, newArgs);
            };
        }else
        {
            return function() {return func.apply(context, arguments);};
        }
    };

    /**
     * 根据限定名称返回一个命名空间（从global开始）。如：Quark.use('Quark.test')。
     * @param {String} 指定新的命名空间的名称。如Quark.test等。
     * @return {Object} 参数name指定的命名空间对象。
     */
    Quark.use = function(name)
    {
        var parts = name.split("."), obj = win;
        for(var i = 0; i < parts.length; i++)
        {
            var p = parts[i];
            obj = obj[p] || (obj[p] = {});
        }
        return obj;
    };

    /**
     * 角度转弧度常量。
     */
    Quark.DEG_TO_RAD = Math.PI / 180;

    /**
     * 弧度转角度常量。
     */
    Quark.RAD_TO_DEG = 180 / Math.PI;

    /**
     * 检测显示对象obj是否与点x，y发生了碰撞。
     * @param {DisplayObject} obj 要检测的显示对象。
     * @param {Number} x 指定碰撞点的x坐标。
     * @param {Number} y 指定碰撞点的y坐标。
     * @return {Number} 如果点x，y在对象obj内为1，在外为-1。
     */
    Quark.hitTestPoint = function(obj, x, y)
    {
        var b = obj.getBounds();
        var hit = x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
        return hit ? 1 : -1;
    };

    /**
     * 检测显示对象obj1和obj2是否发生了碰撞。
     * @param {DisplayObject} obj1 要检测的显示对象。
     * @param {DisplayObject} obj2 要检测的显示对象。
     * @return {Boolean} 发生碰撞为true，否则为false。
     */
    Quark.hitTestObject = function(obj1, obj2)
    {
        var b1 = obj1.getBounds(), b2 = obj2.getBounds();
        var hit = b1.x <= b2.x + b2.width && b2.x <= b1.x + b1.width &&
            b1.y <= b2.y + b2.height && b2.y <= b1.y + b1.height;
        return hit;
    };

    /**
     * 返回Quark的字符串表示形式。
     */
    Quark.toString = function()
    {
        return "Quark";
    };

    /**
     * 简单的log方法，同console.log作用相同。
     */
    Quark.trace = function()
    {
        var logs = Array.prototype.slice.call(arguments);
        if(typeof(console) != "undefined" && typeof(console.log) != "undefined") console.log(logs.join(" "));
    };

    if(win.Q == undefined) win.Q = Quark;
    if(win.trace == undefined) win.trace = Quark.trace;
})(window);
