/**
 * SpriteSheet类是一个动画数据容器（非显示对象）
 * 实现了将一张大的PNG图片(或者多个PNG图片资源)用帧数据还原为单个图片的逐帧动画
 * User: Administrator
 * Date: 12-4-27
 * Time: 下午4:39
 * To change this template use File | Settings | File Templates.
 */
(function(){
    /**
     *
     * @param {String} imgLabel 图片资源,如果为多个图片资源,用,号分隔;
     * @param {Object} options 配置数据
     */
    var SpriteSheet = function(imgLabel,options){
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

        var bitmapMap = new Map();
        var imgArr = imgLabel.split(",");
        var bitmapCache;
        for(var i=0; i < imgArr.length; i++){
            bitmapCache = new BitmapCache(imgArr[i]);
            bitmapCache.bitmapMap.each(function(key,value,index){
                bitmapMap.put(key, value);
            });
        }
        this.bitmapMap = bitmapMap;
    }
    /**
     * 设置帧数据并缓存第一帧
     * @param {Array} data 小图逐帧动画数据
     * data数组的每一个Item也是一个数组，每个小图用x,y,alpha,scale等描述小图的显示属性
     * @param {String} label 当前动画数据的标签
     * @param {Boolean} cacheAll 是否立即缓存所有帧动画
     */
    SpriteSheet.prototype.setData = function(data,label,cacheAll){
        this.framesData = data;
        this.totalFrames = data.length;
        this.framesArr = [];
        this.count = 0;
        this.isEnd = false;
        this.label = label;
        if(cacheAll == true){
            for(var i=0; i< this.totalFrames;i++){
                this.createFramebuffer();
            }
        }
    }
    /**
     * 重置动画播放数据
     */
    SpriteSheet.prototype.reset = function(){
        this.count = 0;
        this.isEnd = false;
        this.frameIdx = 1;
    }
    /**
     * 建立一帧图片缓存
     */
    SpriteSheet.prototype.createFramebuffer = function(){
        var index = this.framesArr.length;
        if(index < this.totalFrames){
            var element = this.drawImages(this.framesData[index]);
            this.framesArr.push(element);
            return element;
        }
    }
    /**
     * 是否已经完全Cache
     */
    SpriteSheet.prototype.isCached = function(){
        return this.framesArr.length == this.totalFrames;
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
    SpriteSheet.prototype.getFrame = function(frameIndex) {
        frameIndex = Math.max(1,frameIndex);
        frameIndex = Math.min(this.totalFrames,frameIndex);
        //当前帧还没有被缓存
        if(frameIndex > this.framesArr.length){
            //console.debug("cache frameIndex=",frameIndex-1);
            this.createFramebuffer();
        }
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
        return this.framesArr[frameIndex-1];
    }
    /**
     * 获取下一帧显示对象,并判断是否结束，如果结束，停止在最末一帧，支持反复播放
     */
    SpriteSheet.prototype.getNextFrame = function(){
        if(this.frameIdx == undefined){
            this.frameIdx = 1;
        }
        var frame = this.getFrame(this.frameIdx);
        this.frameIdx++;
        return frame;
    }
    /**
     * 将多个小图元件绘制到临时Canvas上
     * @param {Array} children
     * @return {DisplayObject} 返回缓存Canvas对象的DisplayObject；
     */
    SpriteSheet.prototype.drawImages = function(children){
        //console.log("this.frameIdx="+this.frameIdx+" data="+JSON.stringify(children));
        var i,bitmap,element,bitmapsArr=[];
        //size=显示对象的渲染尺寸（将原图变形后的尺寸）
        var rect;
        //canvas的矩形范围
        var x = 10000,y = 10000,width=0,height=0;
        //canvas的注册点，为资源的最末一层元件的注册点
        var regX,regY;
        //已使用的元件
        var usedBitmaps = {},tempBitmap;
        for(i = 0;i<children.length;i++){
            element = children[i];
            tempBitmap = usedBitmaps[element.label];
            if(tempBitmap){
                bitmap = new Q.Bitmap(tempBitmap.cloneProps());
            }else{
                bitmap = this.bitmapMap.getValue(element.label);
                usedBitmaps[element.label] = bitmap;
            }
            if(bitmap instanceof Q.Bitmap){
                bitmap.matrix = new Matrix2D(element.a, element.b, element.c, element.d, element.tx, element.ty);
                bitmap.matrix.regPoint(bitmap.regX,bitmap.regY);
                rect = Matrix2D.getBoundsAfterTransformation(bitmap.width,bitmap.height,bitmap.matrix);
                x = Math.min(rect[0],x) + 0.5 >> 0;
                y = Math.min(rect[1],y) + 0.5 >> 0;
                width = Math.max(rect[0] +rect[2],width) + 0.5 >> 0;
                height = Math.max(rect[1]+rect[3],height) + 0.5 >> 0;
                bitmapsArr.push(bitmap);
            }
        }
        rect = new Q.Rectangle(x, y,width-x, height-y);
        var canvasContext = new Q.CanvasContext({canvas:document.createElement("canvas")});
        var canvas = canvasContext.canvas;
        canvas.width = rect.width;
        canvas.height = rect.height;
        for(i = 0;i< bitmapsArr.length;i++){
            bitmap = bitmapsArr[i];
            bitmap.matrix.translate(-rect.x,-rect.y);
            bitmap._render(canvasContext);
            if(regX == undefined){
                regX = bitmap.matrix.tx + bitmap.regX * bitmap.matrix.getScaleX();
                regY = bitmap.matrix.ty + bitmap.regY * bitmap.matrix.getScaleY();
            }
        }
        //显示边框和注册点，调试代码
        //var ctx = canvasContext.context;
        //ctx.strokeStyle = "#0000ff";
        //ctx.strokeRect(0,0, rect.width,rect.height);
        //ctx.strokeRect(regX,regY-7,1,7);
        //explicitWidth 显示固定宽度，一般小于实际宽度
        bitmap = new Q.DisplayObject({id:"spriteSheet",regX:regX, regY:regY});
        bitmap.matrix = new Matrix2D();
        /////bitmap.matrix.regPoint(regX,regY);
        bitmap._cache = canvas;
        return bitmap;
    }
    window.SpriteSheet = SpriteSheet;
})();