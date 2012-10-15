/**
 * BitmapCache类，将一张PNG大图数据，按需求切割小图生成Bitmap对象并缓存
 * User: Administrator
 * Date: 12-4-23
 * Time: 上午11:06
 * To change this template use File | Settings | File Templates.
 */
(function(){
    /**
     * BitmapCache类构造函数
     * @param {String} imgSrc 图片资源名称
     * @param {Array} _labels 需要cache的小图名称集合，如果为空，默认为所有小图
     */
    var BitmapCache = function(imgSrc,_labels){
        //基础图片Image对象(一般为一张大图)和切割图片数据
        this.imageSrc = imgSrc;
        this.labels = _labels || "all";
        this.bitmapMap = null;
        this.init();
    }
    /**
     * 初始化图片资源，并还原缓存小图
     */
    BitmapCache.prototype.init = function(){
        this.bitmapMap = new Q.Map();
        var image = Q.BitmapFactory.getImage(this.imageSrc);
        var framesData = Q.BitmapFactory.imgMap.getValue(this.imageSrc);
        var bitmapProps,item,rect,regX,regY;
        for(var i = 0; i < framesData.length; i++){
            item = framesData[i];
            if(this.labels == "all" || ArrayUtil.indexOf(this.labels,item[0]) != -1){
                rect = [item[1],item[2],item[3],item[4]];
                regX = item[5];
                regY = item[6];
                bitmapProps = {id:item[0],image:image, rect:rect,regX:regX,regY:regY};
                //this.bitmapMap.put(item[0],bitmapProps);
                this.bitmapMap.put(item[0],new Q.Bitmap(bitmapProps));
            }
        }
    }
    /**
     * 根据名称从缓存中获得Bitmap对象
     * @param {String} label 获取资源名称
     */
    BitmapCache.prototype.getBitmap = function(label){
        /*var props = this.bitmapMap.getValue(label);
         if(props == null){
         return null;
         }
         return new Q.Bitmap(props);*/
        return this.bitmapMap.getValue(label);
    }
    Quark.BitmapCache = BitmapCache;
})();