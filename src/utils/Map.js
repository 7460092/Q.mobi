(function(window) {
	/**
	 * Map类，游戏字典数据映射
	 * @param {Array} fields 数据字段名称集合
	 *例如 var map = new Map(["id","name","phone"])
	 *        map.put([1,"张三",139000898]);
	 * 		  map.put([2,"李思",135904906]);
	 */
	var Map = function(fields){
		this.fields = fields;
		/** 存放键的数组(遍历用到,保证key的排序) */ 
        this.keys = [];
	};
	
	/** 
     * 放入一个键值对 
     * @param {String} key 
     * @param {Object} value 
     */  
	Map.prototype.setValue = function(key,value){
		if(this[key] === undefined){  
            this.keys.push(key);  
		}
   		this[key] = value;
	}
	
	/**
	 * setValue方法 别名
	 */
	Map.prototype.put = function(key,value){
		this.setValue(key,value);
	}
	
	/** 
     * 获取某键对应的值 ，如果Map配置了fields，将自动返回JSON格式的值
     * @param {String} key 
     * @return {Object} value 
     */ 
	Map.prototype.getValue = function(key){
		var val = this[key];
		if(val && this.fields)
		{
			var newObj = {};
			for(var i = 0; i < this.fields.length; i++){
				newObj[this.fields[i]] = val[i];
			}
			newObj.source = val;
			return newObj;
		}
   		return val;
	}
	 
	/** 
     * 删除一个键值对 
     * @param {String} key 
     */
	Map.prototype.remove = function(key){
		if(this[key] === undefined){ 
			return;
		}
		var len = this.keys.length;  
        for(var i = 0; i< len; i++){  
           keys.splice(i,1);
        }
   		delete this[key];
	};
	
	/** 
     * 遍历Map,执行处理函数 
     *  
     * @param {Function} fn回调函数 
     * map.each(function(key,value,idx){
	 *	str += key+",";
	 * })
     */  
	Map.prototype.each = function(fn){ 
		var len = this.keys.length;  
        for(var i = 0; i< len; i++){  
            var k = this.keys[i];  
            fn(k,this.getValue(k),i);  
        }  
	}
    /**
     * 将Map值转为数组
     */
    Map.prototype.toArray = function(){
        var arr = [];
        this.each(function(key,value,index){
            arr.push(value);
        });
        return arr;
    }
    /**
     * 获得Key的索引位置
     * @param key
     * @return {Number}
     */
    Map.prototype.getKeyIndex = function(key){
        var len = this.keys.length;
        for(var i = 0; i< len; i++){
            if(this.keys[i] == key){
                return i;
            }
        }
        return -1;
    }
    /**
     * 判断是否有指定的键值
     * @param key
     * @return {Boolean}
     */
    Map.prototype.hasKey = function(key){
        return this[key] != undefined;
    }
	window.Map = Map;
})(window);