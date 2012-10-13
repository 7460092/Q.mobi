/**
 * 数组工具类
 */
(function(){
    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        supportsIndexOf = 'indexOf' in arrayPrototype
    var ArrayUtil = {
        /**
         * 使用全等运算符 (===) 搜索数组中的项，并返回项的索引位置
         * @param {Array} 数组对象
         * @param {Object} 要在数组中查找的项
         * @param {Number} 数组中的位置，从该位置开始搜索项
         * @return {Number} 数组项的索引位置（从 0 开始）。如果未找到 item 参数，则返回值为 -1。
         */
        indexOf: (supportsIndexOf) ? function(array, item, from) {
            return array.indexOf(item, from);
        } : function(array, item, from) {
            var i, length = array.length;
            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * 数组合并
         * 多个不定参数的数组合并为一个数组，以靠前的数组数据为合并后的数组数据
         */
        merge: function() {
            var args = slice.call(arguments),
                array = [],
                i, ln;
            for (i = 0, ln = args.length; i < ln; i++) {
                array = array.concat(args[i]);
            }
            return ArrayUtil.unique(array);
        },
        /**
         * Returns a new array with unique items
         *
         * @param {Array} array
         * @return {Array} results
         */
        unique: function(array) {
            var clone = [],
                i = 0,
                ln = array.length,
                item;
            for (; i < ln; i++) {
                item = array[i];
                if (ArrayUtil.indexOf(clone, item) === -1) {
                    clone.push(item);
                }
            }
            return clone;
        },
        /**
         * 以主键的方式搜索数组中的项，并返回项的索引位置
         * @param array 数组对象
         * @param key 主键
         * @param value 键值
         * @param from
         */
        indexOfKey:function(array,key,value,from){
            var i, length = array.length;
            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i][key] == value) {
                    return i;
                }
            }
            return -1;
        }
    };
    window.ArrayUtil = ArrayUtil;
})();