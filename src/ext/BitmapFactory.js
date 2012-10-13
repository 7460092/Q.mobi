(function() {
    /**
     * 位图构建工厂类
     */
    var BitmapFactory = function(){
        throw("BitmapFactory是一个单例");
    };
    /**
     * 创建图片显示对象Bitmap
     * @param {JSON} props 配置参数，支持一下几种方式
     * 方式一：props.src {String} 资源名称（非图片文件名） props.rect {Array}  显示区域[x,y,width,height]
     * 方式二: props.src {String} 资源名称（非图片文件名） props.label{String} 资源编号
     * 方式三: props.imageData {JSON} 资源数据 {image:Image,rect:[x,y,width,height]} 需要特殊处理的图形资源数据（比如rect是动态数据）
     * @param {Boolean} props.eventEnabled 是否启用按钮模式，默认为false
     * @return {Q.Bitmap} 返回Q.Bitmap显示对象
     */
    BitmapFactory.createBitmap = function(props){
        props = props || {};
        props.eventEnabled = props.eventEnabled || false;
        var imageData = null;
        if(props.rect != undefined){
            imageData = {image:this.getImage(props.src),rect:props.rect};
        }else{
            imageData = props.imageData || this.getImageData(props.src,props.label);
        }
        if(props.center === true){
            props.regX  = Math.floor(imageData.rect[2]/2);
            props.regY  = Math.floor(imageData.rect[3]/2);
        }
        props = Q.merge(props,imageData,false);
        //调试代码，验证配置数据合法
        validateImageRect(props);
        return new Q.Bitmap(props);
    };
    /**
     * 创建按钮(支持事件交互)
     * @param props 同createBitmap
     */
    BitmapFactory.createButton = function(props){
        props = props || {};
        props.eventEnabled = true;
        return this.createBitmap(props);
    };

    BitmapFactory.createMovieClip = function(props){

    };
    BitmapFactory.putImages = function(images){
        if(BitmapFactory.images == null)
        {
            BitmapFactory.images = {};
        }
        Q.merge(BitmapFactory.images,images,false);
    }
    BitmapFactory.images = null;
    BitmapFactory.imgMap = null;
    BitmapFactory.setImageData = function(data){
        BitmapFactory.imgMap = data;
    }
    /**
     * 根据资源ID获得Image对象
     * @param {String} id 资源编号
     * @return {Image} Image对象
     */
    BitmapFactory.getImage = function(id){
        if(this.images !=null && this.images[id] != undefined){
            return this.images[id].image;
        }else{
            return null;
        }
    };
    /**
     * 根据资源的编号和标签，获得一个大图中指定小图的数据，该数据用于构建Bitmap对象
     * @param {String} id 资源的编号
     * @param {String/Number} indexOrLabel 小图的标签数据或者序号(大图被等分的情况下)
     * @return {Ojbect} 包括了image属性和rect属性的对象
     */
    BitmapFactory.getImageData = function(id,indexOrLabel){
        var props = {};
        props.image = this.getImage(id);
        //获得图片的扩展数据
        var framesData = BitmapFactory.imgMap.getValue(id);
        if(framesData === undefined || framesData === null || indexOrLabel === null || indexOrLabel === "" || indexOrLabel === "null"){
            return props;
        }
        var dataType = Object.prototype.toString.call(framesData);
        if(dataType == "[object String]")
        {
            var group = framesData.split(";"),i,item,key,lastIdx;
            for(i = 0;i < group.length;i++){
                item = group[i].split(":");
                key = item[0];
                lastIdx = parseInt(item[1]);
                if(indexOrLabel <= lastIdx)
                {
                    return this.getImageData(key,lastIdx);
                }
            }
        }else if(dataType == "[object Array]") //imgMap.put("ss", [["0",0,0,112,24]]);
        {
            props.rect = getImgRect(framesData,indexOrLabel);
        }else{ //[object Object] imgMap.put("daoju", {w:110, h:110, n:56});
            var col = props.image.width / framesData.w;
            indexOrLabel = (framesData.k === undefined) ? parseInt(indexOrLabel) - 1 : ArrayUtil.indexOf(framesData.k.split(","),indexOrLabel);
            if(indexOrLabel < col){
                props.rect = [framesData.w * indexOrLabel,0,framesData.w,framesData.h];
            }else{
                var a = Math.floor(indexOrLabel / col);
                var b = indexOrLabel % col;
                props.rect = [framesData.w * b,framesData.h * a,framesData.w,framesData.h];
            }
        }
        return props;
    }
    /**
     * 取得带灰度的图片,大图资源必须是等分的，奇数行为彩色图片，偶数行为灰色图片
     * @param {String} id 图片资源名称
     * @param {Number} index 图片序号
     * @param {Boolean} isGray 是否灰色
     */
    BitmapFactory.getIndexImageData = function(id,index,isGray){
        var framesData = BitmapFactory.imgMap.getValue(id);
        var image = this.getImage(id);
        //列数
        var col = image.width / framesData.w;
        var rect = {};
        index -= 1;
        if(index < col){
            rect.x = framesData.w * index;
            rect.y = 0;
        }else{
            var a = Math.floor(index / col);
            var b = index % col;
            rect.x = framesData.w * b;
            rect.y = framesData.h * a * 2;
        }
        if(isGray === true){
            rect.y += framesData.h;
        }
        return {image:image,rect:[rect.x,rect.y,framesData.w,framesData.h]};
    }

    /**
     * 从图片集合数据中取出元件的Rect
     */
    var getImgRect = function(dataArr,indexOrLabel){
        var item;
        //单个资源的Rect
        var rect;
        //多个资源的Rect集合
        var rectArr = (indexOrLabel == "all") ? [] : null;
        for(var i=0; i < dataArr.length; i++){
            item = dataArr[i];
            rect = [item[1],item[2],item[3],item[4]];
            if(indexOrLabel == "all"){
                rectArr.push(rect);
            }else{
                var typeStr = Object.prototype.toString.call(indexOrLabel);
                if(typeStr === '[object String]') //按名称检查
                {
                    if(item[0] == indexOrLabel) //第一位是名称
                    {
                        return rect;
                    }
                }else{//按序号检查
                    if(indexOrLabel == i)
                    {
                        return rect;
                    }
                }
            }
        }
        return rectArr;
    }
    var validateImageRect = function(props){
        if(props.rect == undefined) return true;
        var rect_w = props.rect[0] + props.rect[2];
        var rect_h = props.rect[1] + props.rect[3];
        if(rect_w > props.image.width || rect_h > props.image.height){
            alert("rect error ! src:" + props.src + " label:"+props.label +" rect:"+ props.rect.toString());
            return false;
        }
        return true;
    }
    window.BitmapFactory = BitmapFactory;
})();