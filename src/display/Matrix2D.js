(function(window) {

    /**
     * Represents an affine transformation matrix, and provides tools for constructing and concatenating matrixes.
     * @class Matrix2D
     * @constructor
     * @param {Number} a Specifies the a property for the new matrix.
     * @param {Number} b Specifies the b property for the new matrix.
     * @param {Number} c Specifies the c property for the new matrix.
     * @param {Number} d Specifies the d property for the new matrix.
     * @param {Number} tx Specifies the tx property for the new matrix.
     * @param {Number} ty Specifies the ty property for the new matrix.
     **/
    var Matrix2D = function(a, b, c, d, tx, ty) {
        this.initialize(a, b, c, d, tx, ty);
    }
    var p = Matrix2D.prototype;

// static public properties:

    /**
     * An identity matrix, representing a null transformation. Read-only.
     * @property identity
     * @static
     * @type Matrix2D
     **/
    Matrix2D.identity = null; // set at bottom of class definition.

    /**
     * Multiplier for converting degrees to radians. Used internally by Matrix2D. Read-only.
     * @property DEG_TO_RAD
     * @static
     * @final
     * @type Number
     **/
    Matrix2D.DEG_TO_RAD = Math.PI/180;


// public properties:
    /**
     * Position (0, 0) in a 3x3 affine transformation matrix.
     * @property a
     * @type Number
     **/
    p.a = 1;

    /**
     * Position (0, 1) in a 3x3 affine transformation matrix.
     * @property b
     * @type Number
     **/
    p.b = 0;

    /**
     * Position (1, 0) in a 3x3 affine transformation matrix.
     * @property c
     * @type Number
     **/
    p.c = 0;

    /**
     * Position (1, 1) in a 3x3 affine transformation matrix.
     * @property d
     * @type Number
     **/
    p.d = 1;

    /**
     * Position (2, 0) in a 3x3 affine transformation matrix.
     * @property atx
     * @type Number
     **/
    p.tx = 0;

    /**
     * Position (2, 1) in a 3x3 affine transformation matrix.
     * @property ty
     * @type Number
     **/
    p.ty = 0;

    /**
     * Property representing the alpha that will be applied to a display object. This is not part of matrix
     * operations, but is used for operations like getConcatenatedMatrix to provide concatenated alpha values.
     * @property alpha
     * @type Number
     **/
    p.alpha = 1;

    /**
     * Property representing the shadow that will be applied to a display object. This is not part of matrix
     * operations, but is used for operations like getConcatenatedMatrix to provide concatenated shadow values.
     * @property shadow
     * @type Shadow
     **/
    p.shadow  = null;

    /**
     * Property representing the compositeOperation that will be applied to a display object. This is not part of
     * matrix operations, but is used for operations like getConcatenatedMatrix to provide concatenated
     * compositeOperation values. You can find a list of valid composite operations at:
     * <a href="https://developer.mozilla.org/en/Canvas_tutorial/Compositing">https://developer.mozilla.org/en/Canvas_tutorial/Compositing</a>
     * @property compositeOperation
     * @type String
     **/
    p.compositeOperation = null;

// constructor:
    /**
     * Initialization method.
     * @method initialize
     * @protected
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     */
    p.initialize = function(a, b, c, d, tx, ty) {
        if (a != null) { this.a = a; }
        this.b = b || 0;
        this.c = c || 0;
        if (d != null) { this.d = d; }
        this.tx = tx || 0;
        this.ty = ty || 0;
        return this;
    }

// public methods:
    /**
     * Concatenates the specified matrix properties with this matrix. All parameters are required.
     * @method prepend
     * @param {Number} a
     * @param {Number} b
     * @param {Number} c
     * @param {Number} d
     * @param {Number} tx
     * @param {Number} ty
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.prepend = function(a, b, c, d, tx, ty) {
        var tx1 = this.tx;
        if (a != 1 || b != 0 || c != 0 || d != 1) {
            var a1 = this.a;
            var c1 = this.c;
            this.a  = a1*a+this.b*c;
            this.b  = a1*b+this.b*d;
            this.c  = c1*a+this.d*c;
            this.d  = c1*b+this.d*d;
        }
        this.tx = tx1*a+this.ty*c+tx;
        this.ty = tx1*b+this.ty*d+ty;
        return this;
    }

    /**
     * Appends the specified matrix properties with this matrix. All parameters are required.
     * @method append
     * @param {Number} a
     * @param {Number} b
     * @param {Number} c
     * @param {Number} d
     * @param {Number} tx
     * @param {Number} ty
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.append = function(a, b, c, d, tx, ty) {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;

        this.a  = a*a1+b*c1;
        this.b  = a*b1+b*d1;
        this.c  = c*a1+d*c1;
        this.d  = c*b1+d*d1;
        this.tx = tx*a1+ty*c1+this.tx;
        this.ty = tx*b1+ty*d1+this.ty;
        return this;
    }

    /**
     * Prepends the specified matrix with this matrix.
     * @method prependMatrix
     * @param {Matrix2D} matrix
     **/
    p.prependMatrix = function(matrix) {
        this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        this.prependProperties(matrix.alpha, matrix.shadow,  matrix.compositeOperation);
        return this;
    }

    /**
     * Appends the specified matrix with this matrix.
     * @method appendMatrix
     * @param {Matrix2D} matrix
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.appendMatrix = function(matrix) {
        this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        this.appendProperties(matrix.alpha, matrix.shadow,  matrix.compositeOperation);
        return this;
    }

    /**
     * Generates matrix properties from the specified display object transform properties, and prepends them with this matrix.
     * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
     * mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
     * @method prependTransform
     * @param {Number} x
     * @param {Number} y
     * @param {Number} scaleX
     * @param {Number} scaleY
     * @param {Number} rotation
     * @param {Number} skewX
     * @param {Number} skewY
     * @param {Number} regX Optional.
     * @param {Number} regY Optional.
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.prependTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        if (rotation%360) {
            var r = rotation*Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r);
        } else {
            cos = 1;
            sin = 0;
        }

        if (regX || regY) {
            // append the registration offset:
            this.tx -= regX; this.ty -= regY;
        }
        if (skewX || skewY) {
            // TODO: can this be combined into a single prepend operation?
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
            this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
        } else {
            this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
        }
        return this;
    }

    /**
     * Generates matrix properties from the specified display object transform properties, and appends them with this matrix.
     * For example, you can use this to generate a matrix from a display object: var mtx = new Matrix2D();
     * mtx.appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
     * @method appendTransform
     * @param {Number} x
     * @param {Number} y
     * @param {Number} scaleX
     * @param {Number} scaleY
     * @param {Number} rotation
     * @param {Number} skewX
     * @param {Number} skewY
     * @param {Number} regX Optional.
     * @param {Number} regY Optional.
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.appendTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        if (rotation%360) {
            var r = rotation*Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r);
        } else {
            cos = 1;
            sin = 0;
        }

        if (skewX || skewY) {
            // TODO: can this be combined into a single append?
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
        } else {
            this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
        }

        if (regX || regY) {
            // prepend the registration offset:
            this.tx -= regX*this.a+regY*this.c;
            this.ty -= regX*this.b+regY*this.d;
        }
        return this;
    }

    /**
     * Applies a rotation transformation to the matrix.
     * @method rotate
     * @param {Number} angle The angle in degrees.
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.rotate = function(angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        var a1 = this.a;
        var c1 = this.c;
        var tx1 = this.tx;

        this.a = a1*cos-this.b*sin;
        this.b = a1*sin+this.b*cos;
        this.c = c1*cos-this.d*sin;
        this.d = c1*sin+this.d*cos;
        this.tx = tx1*cos-this.ty*sin;
        this.ty = tx1*sin+this.ty*cos;
        return this;
    }

    /**
     * Applies a skew transformation to the matrix.
     * @method skew
     * @param {Number} skewX The amount to skew horizontally in degrees.
     * @param {Number} skewY The amount to skew vertically in degrees.
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     */
    p.skew = function(skewX, skewY) {
        skewX = skewX*Matrix2D.DEG_TO_RAD;
        skewY = skewY*Matrix2D.DEG_TO_RAD;
        this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
        return this;
    }

    /**
     * Applies a scale transformation to the matrix.
     * @method scale
     * @param {Number} x
     * @param {Number} y
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.scale = function(x, y) {
        this.a *= x;
        this.d *= y;
        this.tx *= x;
        this.ty *= y;
        return this;
    }
    /**
     * Translates the matrix on the x and y axes.
     * @method translate
     * @param {Number} x
     * @param {Number} y
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.translate = function(x, y) {
        this.tx += x;
        this.ty += y;
        return this;
    }
    /**
     * prepend the registration offset
     * @param regX
     * @param regY
     */
    p.regPoint = function(regX,regY){
        this.tx -= regX*this.a+regY*this.c;
        this.ty -= regX*this.b+regY*this.d;
    }
    /**
     * 包括用于缩放、转换的参数。当应用于矩阵时，该方法会基于这些参数设置矩阵的值。
     * @param tx 沿 x 轴向右平移（移动）的像素数。
     * @param ty 沿 y 轴向右平移（移动）的像素数。
     * @param scale  缩放系数
     * @param rotation 旋转角度
     * @param regX  注册点X坐标
     * @param regY  注册点Y坐标
     * @param horizontal 是否水平翻转，默认为false
     * @param vertical 是否垂直翻转，默认为false
     */
    p.createBox = function(tx,ty,scale,rotation,regX,regY,horizontal,vertical){
        this.identity();
        var scaleX = scale;
        var scaleY = scale;
        if(horizontal == true){
            scaleX *= -1;
        }
        if(vertical == true){
            scaleY *= -1;
        }
        this.appendTransform(tx, ty, scaleX,scaleY,rotation,null,null,regX, regY);
    }

    /**
     * Sets the properties of the matrix to those of an identity matrix (one that applies a null transformation).
     * @method identity
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.identity = function() {
        this.alpha = this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        this.shadow = this.compositeOperation = null;
        return this;
    }

    /**
     * Inverts the matrix, causing it to perform the opposite transformation.
     * @method invert
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     **/
    p.invert = function() {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;
        var tx1 = this.tx;
        var n = a1*d1-b1*c1;

        this.a = d1/n;
        this.b = -b1/n;
        this.c = -c1/n;
        this.d = a1/n;
        this.tx = (c1*this.ty-d1*tx1)/n;
        this.ty = -(a1*this.ty-b1*tx1)/n;
        return this;
    }

    /**
     * Returns true if the matrix is an identity matrix.
     * @method isIdentity
     * @returns Boolean
     **/
    p.isIdentity = function() {
        return this.tx == 0 && this.ty == 0 && this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1;
    }

    /**
     * Decomposes the matrix into transform properties (x, y, scaleX, scaleY, and rotation). Note that this these values
     * may not match the transform properties you used to generate the matrix, though they will produce the same visual
     * results.
     * @method decompose
     * @param {Object} target The object to apply the transform properties to. If null, then a new object will be returned.
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     */
    p.decompose = function(target) {
        // TODO: it would be nice to be able to solve for whether the matrix can be decomposed into only scale/rotation
        // even when scale is negative
        if (target == null) { target = {}; }
        target.x = this.tx;
        target.y = this.ty;
        target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
        target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);

        var skewX = Math.atan2(-this.c, this.d);
        var skewY = Math.atan2(this.b, this.a);

        if (skewX == skewY) {
            target.rotation = skewY/Matrix2D.DEG_TO_RAD;
            if (this.a < 0 && this.d >= 0) {
                target.rotation += (target.rotation <= 0) ? 180 : -180;
            }
            target.skewX = target.skewY = 0;
        } else {
            target.skewX = skewX/Matrix2D.DEG_TO_RAD;
            target.skewY = skewY/Matrix2D.DEG_TO_RAD;
        }
        return target;
    }

    /**
     * Reinitializes all matrix properties to those specified.
     * @method appendProperties
     * @param {Number} a
     * @param {Number} b
     * @param {Number} c
     * @param {Number} d
     * @param {Number} tx
     * @param {Number} ty
     * @param {Number} alpha desired alpha value
     * @param {Shadow} shadow desired shadow value
     * @param {String} compositeOperation desired composite operation value
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     */
    p.reinitialize = function(a,b,c,d,tx,ty,alpha,shadow,compositeOperation) {
        this.initialize(a,b,c,d,tx,ty);
        this.alpha = alpha || 1;
        this.shadow = shadow;
        this.compositeOperation = compositeOperation;
        return this;
    }

    /**
     * Appends the specified visual properties to the current matrix.
     * @method appendProperties
     * @param {Number} alpha desired alpha value
     * @param {Shadow} shadow desired shadow value
     * @param {String} compositeOperation desired composite operation value
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     */
    p.appendProperties = function(alpha, shadow, compositeOperation) {
        this.alpha *= alpha;
        this.shadow = shadow || this.shadow;
        this.compositeOperation = compositeOperation || this.compositeOperation;
        return this;
    }

    /**
     * Prepends the specified visual properties to the current matrix.
     * @method prependProperties
     * @param {Number} alpha desired alpha value
     * @param {Shadow} shadow desired shadow value
     * @param {String} compositeOperation desired composite operation value
     * @return {Matrix2D} This matrix. Useful for chaining method calls.
     */
    p.prependProperties = function(alpha, shadow, compositeOperation) {
        this.alpha *= alpha;
        this.shadow = this.shadow || shadow;
        this.compositeOperation = this.compositeOperation || compositeOperation;
        return this;
    }
    /**
     * 将某个矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起。
     * 在数学术语中，将两个矩阵连接起来与使用矩阵乘法将它们结合起来是相同的。
     * @param {Matrix2D} mtx 要连接到源矩阵的矩阵
     */
    p.concat = function(mtx)
    {
        var a = this.a;
        var c = this.c;
        var tx = this.tx;
        
        var newMatrix = new Matrix2D(1,0,0,1,0,0);

        newMatrix.a = a * mtx.a + this.b * mtx.c;
        newMatrix.b = a * mtx.b + this.b * mtx.d;
        newMatrix.c = c * mtx.a + this.d * mtx.c;
        newMatrix.d = c * mtx.b + this.d * mtx.d;
        newMatrix.tx = tx * mtx.a + this.ty * mtx.c + mtx.tx;
        newMatrix.ty = tx * mtx.b + this.ty * mtx.d + mtx.ty;
        return newMatrix;
    };

    /**
     * Returns a clone of the Matrix2D instance.
     * @method clone
     * @return {Matrix2D} a clone of the Matrix2D instance.
     **/
    p.clone = function() {
        var mtx = new Matrix2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
        mtx.shadow = this.shadow;
        mtx.alpha = this.alpha;
        mtx.compositeOperation = this.compositeOperation;
        return mtx;
    }

    /**
     * Returns a string representation of this object.
     * @method toString
     * @return {String} a string representation of the instance.
     **/
    p.toString = function() {
        return "[Matrix2D (a="+this.a+" b="+this.b+" c="+this.c+" d="+this.d+" tx="+this.tx+" ty="+this.ty+")]";
    }
    p.transformSize = function(width,height){
        // transform point (0,0)
        var x1 = 0;
        var y1 = 0;

        // transform point (width, 0)
        var x2 = width * this.a;
        var y2 = width * this.b;

        // transform point (0, height)
        var x3 = height * this.c;
        var y3 = height * this.d;

        // transform point (width, height)
        var x4 = x2 + x3;
        var y4 = y2 + y3;

        var minX = Math.min(Math.min(x1, x2), Math.min(x3, x4));
        var maxX = Math.max(Math.max(x1, x2), Math.max(x3, x4));
        var minY = Math.min(Math.min(y1, y2), Math.min(y3, y4));
        var maxY = Math.max(Math.max(y1, y2), Math.max(y3, y4));
        return {width:(maxX - minX) + 0.5 >> 0,height:(maxY - minY) + 0.5 >> 0};
    }
    p.getScaleX = function(){
        return Math.sqrt((this.a * this.a) + (this.c * this.c));
    }

    p.getScaleY = function(){
        return Math.sqrt((this.b * this.b) + (this.d * this.d));
    }

    p.getRotation = function(){
        return Math.atan( -this.c / this.a);
    }
    p.getSkewY = function(){
        return Math.atan2(this.b, this.a) * (180/Math.PI);
    }
    //MatrixTransformer.as 类
    p.getSkewX = function(){
        return Math.atan2(-this.c, this.d) * (180/Math.PI);
    }
    // this has to be populated after the class is defined:
    Matrix2D.identity = new Matrix2D(1, 0, 0, 1, 0, 0);
    /**
     * 计算Bounds方法，同flash的getBounds()
     * @param {Number} w 图片的宽度
     * @param {Number} h 图片的高度
     * @param {Matrix@D} m 矩阵
     * @return 返回一个矩形坐标
     */
    Matrix2D.getBoundsAfterTransformation = function(w,h,m){
        var lt = {x:0,y:0};
        var rt = {x:w,y:0};
        var lb = {x:0,y:h};
        var rb = {x:w,y:h};
        lt = transformPoint(m,lt);
        rt = transformPoint(m,rt);
        lb = transformPoint(m,lb);
        rb = transformPoint(m,rb);
        var xmin = Math.min(lt.x,rt.x,lb.x,rb.x);
        var ymin = Math.min(lt.y,rt.y,lb.y,rb.y);
        var xmax = Math.max(lt.x,rt.x,lb.x,rb.x);
        var ymax = Math.max(lt.y,rt.y,lb.y,rb.y);
        function transformPoint(m,p){
            return {x:m.a * p.x + m.c * p.y + m.tx,y:m.b * p.x + m.d * p.y + m.ty};
        }
        return [xmin,ymin,xmax - xmin,ymax - ymin];
    }
    p.transformPoint = function(point, round, returnNew)
    {
        var x = point.x * this.a + point.y * this.c + this.tx;
        var y =	point.x * this.b + point.y * this.d + this.ty;
        if(round)
        {
            x = x + 0.5 >> 0;
            y = y + 0.5 >> 0;
        }
        if(returnNew) return {x:x, y:y};
        point.x = x;
        point.y = y;
        return point;
    };
    Quark.Matrix2D = Matrix2D;
}(window))