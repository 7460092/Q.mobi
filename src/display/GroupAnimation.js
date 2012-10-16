(function(){

    /**
     * 骨骼动画类
     * @name Group
     * @augments DisplayObject
     */
    var GroupAnimation = Quark.GroupAnimation = function(imgLabel,options)
    {
        this.children = [];
        GroupAnimation.superClass.constructor.call(this, {});
        this.id = Quark.UIDUtil.createUID("GroupAnimation");
        //帧动画数据
        this.framesData = null;
        this.totalFrames = 0;
        //重复次数
        this.repeat = 1;
        if(options && options.frequency != undefined){
            this.repeat = Number(options.frequency);
        }
        this.options = options;
        //已经运行的次数
        this.count = 0;
        //是否完成
        this.isEnd = false;
        this._bitmapInit(imgLabel);
    };
    Quark.inherit(GroupAnimation, Quark.DisplayObject);
    var p = GroupAnimation.prototype;
    /**
     * 将一个DisplayObject子实例添加到该DisplayObjectContainer实例的子级列表中的指定位置。
     * @param {DisplayObject} child 要添加的显示对象。
     * @param {Integer} index 指定显示对象要被添加到的索引位置。
     * @return {DisplayObjectContainer} 返回显示容器本身。
     */
    p.addChildAt = function(child, index)
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
    p.addChild = function(child)
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
    p._update = function(timeInfo)
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
    p.render = function(context)
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
    ////////////////////////////////////////////
    //////////// 动画逻辑 //////////////////////
    ///////////////////////////////////////////
    /**
     * 缓存所有资源
     * @param imgLabel 资源列表
     */
    p._bitmapInit = function(imgLabel){
        var bitmapMap = new Q.Map();
        var imgArr = imgLabel.split(",");
        var bitmapCache;
        for(var i=0; i < imgArr.length; i++){
            bitmapCache = new Q.BitmapCache(imgArr[i]);
            bitmapCache.bitmapMap.each(function(key,value,index){
                bitmapMap.put(key, value);
            });
        }
        this.bitmapMap = bitmapMap;
    }

    /**
     * 设置帧数据并缓存第一帧
     * @param {Object} data 小图逐帧动画数据,支持String和Array两种类型
     * data数组的每一个Item也是一个数组，每个小图用x,y,alpha,scale等描述小图的显示属性
     * @param {String} label 当前动画数据的标签
     * @param {Boolean} cacheAll 是否立即缓存所有帧动画
     */
    p.setData = function(data,label){
        this.framesData = typeof(data) == "string" ? this.parseData(data) : data;
        this.totalFrames = this.framesData.length;
        this.label = label;
        this.reset();
    }

    /**
     * 重置动画播放数据
     */
    p.reset = function(){
        this.count = 0;
        this.isEnd = false;
        this.frameIdx = 1;
    }

    /**
     * 取得指定帧数的显示对象
     * @param {Number} frameIndex
     * @return {DisplayObject} 返回缓存Canvas对象的DisplayObject，该DisplayObject的_cache属性为图片数据，regX和regY为注册点数据
     * 使用例子：
     * var drawable = ....getNextFrame();
     * drawable.matrix.identity();
     * drawable.matrix.regPoint(drawable.regX,drawable.regY);
     */
    p.toFrame = function(frameIndex) {
        frameIndex = Math.max(1,frameIndex);
        frameIndex = Math.min(this.totalFrames,frameIndex);

        //重复播放和播放完毕逻辑
        if(this.frameIdx >= this.totalFrames){
            this.frameIdx = 1;
            if(this.repeat > 0){
                this.count++;
                if(this.count >= this.repeat){
                    this.isEnd = true;
                    this.frameIdx = this.totalFrames;
                }
            }else{
                //this.isEnd = true;
                //this.frameIdx = this.totalFrames;
            }
        }
        this.drawImages(this.framesData[frameIndex-1]);
    }

    /**
     * 获取下一帧显示对象,并判断是否结束，如果结束，停止在最末一帧，支持反复播放
     */
    p.nextFrame = function(){
        if(this.frameIdx == undefined){
            this.frameIdx = 1;
        }
        this.toFrame(this.frameIdx);
        this.frameIdx++;
    }

    p.drawImages = function(children){
        var i,bitmap,element,bitmapsArr=[];
        //size=显示对象的渲染尺寸（将原图变形后的尺寸）
        var rect;
        //canvas的矩形范围
        var x = 10000,y = 10000,width=0,height=0;
        //canvas的注册点，为资源的最末一层元件的注册点
        var regX,regY;
        //已使用的元件
        var usedBitmaps = {},tempBitmap;
        for(i = 0; i < children.length; i++){
            element = children[i];
            tempBitmap = usedBitmaps[element.label];
            if(tempBitmap){
                bitmap = new Q.Bitmap(tempBitmap.cloneProps());
            }else{
                bitmap = this.bitmapMap.getValue(element.label);
                usedBitmaps[element.label] = bitmap;
            }
            if(bitmap instanceof Q.Bitmap){
                bitmap.matrix = new Q.Matrix2D(element.a, element.b, element.c, element.d, element.tx, element.ty);
                bitmap.matrix.regPoint(bitmap.regX,bitmap.regY);
                rect = Q.Matrix2D.getBoundsAfterTransformation(bitmap.width,bitmap.height,bitmap.matrix);
                x = Math.min(rect[0],x) + 0.5 >> 0;
                y = Math.min(rect[1],y) + 0.5 >> 0;
                width = Math.max(rect[0] +rect[2],width) + 0.5 >> 0;
                height = Math.max(rect[1]+rect[3],height) + 0.5 >> 0;
                bitmapsArr.push(bitmap);
            }
        }
        rect = new Q.Rectangle(x, y,width-x, height-y);
        this.width = rect.width;
        this.height = rect.height;
        this.children = [];
        for(i = 0;i< bitmapsArr.length;i++){
            bitmap = bitmapsArr[i];
            bitmap.matrix.translate(-rect.x,-rect.y);
            this.addChild(bitmap);
            if(regX == undefined){
                regX = bitmap.matrix.tx + bitmap.regX * bitmap.matrix.getScaleX();
                regY = bitmap.matrix.ty + bitmap.regY * bitmap.matrix.getScaleY();
            }
        }
        this.regX = regX;
        this.regY = regY;
        this.matrix = null;
    }

    /**
     * 转换动画字符串数据
     * @param aniStr
     */
    p.parseData = function(aniStr){
        var names = ["label","alpha","a","b","c","d","tx","ty"];
        var frames  = aniStr.split(":");
        var allFrames = [];
        for(var i = 0 ; i < frames.length ; i ++){
            var frame = [];
            var tiles = frames[i].split("|");
            for(var j = 0 ; j <tiles.length ; j++ ){
                var tiles_ = tiles[j].split(",");
                var symbol = {};
                for(var k = 0; k < tiles_.length; k++){
                    symbol[names[k]] = Number(tiles_[k]);
                }
                frame.push(symbol);
            }
            allFrames.push(frame);
        }
        return allFrames;
    }
})();