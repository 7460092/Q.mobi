(function(){

    /**
     * Constructor.
     * @name Group
     * @augments DisplayObject
     */
    var Group = Quark.Group = function(props)
    {
        this.children = [];
        props = props || {};
        Group.superClass.constructor.call(this, props);
        this.id = props.id || Quark.UIDUtil.createUID("Group");
    };
    Quark.inherit(Group, Quark.DisplayObject);

    /**
     * 将一个DisplayObject子实例添加到该DisplayObjectContainer实例的子级列表中的指定位置。
     * @param {DisplayObject} child 要添加的显示对象。
     * @param {Integer} index 指定显示对象要被添加到的索引位置。
     * @return {DisplayObjectContainer} 返回显示容器本身。
     */
    Group.prototype.addChildAt = function(child, index)
    {
        if(index < 0) index = 0;
        else if(index > this.children.length) index = this.children.length;

        var childIndex = this.children.indexOf(child);
        if(childIndex != -1)
        {
            if(childIndex == index) return this;
            this.children.splice(childIndex, 1);
        }
        this.children.splice(index, 0, child);
        child.parent = this;
        return this;
    };

    /**
     * 将一个DisplayObject子实例添加到该DisplayObjectContainer实例的子级列表中。
     * @param {DisplayObject} child 要添加的显示对象。
     * @return {DisplayObjectContainer} 返回显示容器本身。
     */
    Group.prototype.addChild = function(child)
    {
        var start = this.children.length;
        for(var i = 0; i < arguments.length; i++)
        {
            var child = arguments[i];
            this.addChildAt(child, start + i);
        }
        return this;
    };
    /**
     * 覆盖父类DisplayObject的_update方法，更新所有子显示对象的深度。
     */
    Group.prototype._update = function(timeInfo)
    {
        var copy = this.children.slice(0);
        for(var i = 0, len = copy.length; i < len; i++)
        {
            var child = copy[i];
            child._depth = i + 1;
            child._update(timeInfo);
        }
    };

    /**
     * 渲染DisplayObjectContainer本身及其所有子显示对象。
     */
    Group.prototype.render = function(context)
    {
        for(var i = 0, len = this.children.length; i < len; i++)
        {
            var child = this.children[i];
            //最后更新matrix
            var childMtx = child.getMatrix(); //原始的Matrix
            child.matrix = childMtx.concat(this.getMatrix()); //连接后新的Matrix
            child._render(context); //用新的matrix渲染
            child.matrix = childMtx; //还原到连接前的原始值
        }
    };
})();