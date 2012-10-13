(function(){

    /**
     * Constructor.
     * @name Text
     * @augments DisplayObject
     * @class The Text class provides simple text drawing.
     * @property text The text to display.
     * @property font  The font style to use.
     * @property color The color to use.
     * @property textAlign The text alignment. Can be any of "start", "end", "left", "right", and "center".
     * @property outline Determine whether stroke or fill text.
     * @property maxWidth The maximum width to draw the text, For canvas use.
     * @property lineWidth The maximum width for a line of text.
     * @property lineSpacing The space between two lines, in pixel.
     * @property fontMetrics The font metrics. You don't need to care it in most cases, can be passed in for performance optimization.
     */
    var Text = Quark.Text = function(_text,props)
    {
        this.text = ""+_text;
        this.fontSize = "12px";
        this.fontFamily = "sans-serif";
        this.fontWeight = "normal";
        this.fontStyle = "normal";

        this.color = "#000";
        this.textAlign = "start";
        this.outline = false;
        this.maxWidth = 10000;
        this.lineWidth = null;
        this.lineSpacing = props.lineSpacing || 0;
        this.fontMetrics = null;
        this.textWidth = 0; //只读
        this.textHeight = 0; //只读
        props = props || {};
        props.eventEnabled = false;
        //props.fontSize *= Q.scale;
        Text.superClass.constructor.call(this, props);
        this.id = Quark.UIDUtil.createUID("Text");
        if(typeof(this.fontSize) == "number"){
            this.fontSize += "px";
        }
        this.lineWidth = props.lineLength/** Q.scale*/ || this.lineWidth;
        this.font = [/*this.fontStyle,*/this.fontWeight,this.fontSize,this.fontFamily].join(" ");
    }
    Quark.inherit(Text, Quark.DisplayObject);

    Text.prototype.setText = function(str){
        this.text = ""+str;
    }
    /**
     * Draws the text into the specific context.
     * @private
     */
    Text.prototype._draw = function(context)
    {
        if(!this.text || this.text.length == 0) return;
        //set drawing style
        context.font = this.font;
        context.textAlign = this.textAlign;
        context.textBaseline = "top";
        if(this.outline) context.strokeStyle = this.color;
        else context.fillStyle = this.color;

        var lines = this.text.split(/\r\n|\r|\n|<br(?:[ \/])*>/);
        var y = -4;//this.lineSpacing;
        this.width = this.lineWidth || 0;
        if(this.lineHeight == undefined){
            this.lineHeight = context.measureText("中").width * 1.2 + this.lineSpacing;
        }
        for(var i = 0, len = lines.length; i < len; i++)
        {
            var line = lines[i], width = context.measureText(line).width;
            //check if the line need to split
            if(this.lineWidth == null || width < this.lineWidth)
            {
                if(width > this.width) this.width = width;
                this._drawTextLine(context, line, y);
                y += this.lineHeight;
                continue;
            }

            //split the line by each single word, loop to find the break
            //TODO: optimize the regular expression
            var words = line.split(/([^\x00-\xff]|\b)/), str = words[0];
            for(var j = 1, wlen = words.length; j < wlen; j++)
            {
                var word = words[j];
                if(!word || word.length == 0) continue;

                var newWidth = context.measureText(str + word).width;
                if(newWidth > this.lineWidth)
                {
                    this._drawTextLine(context, str, y);
                    y += this.lineHeight;
                    str = word;
                }else
                {
                    str += word;
                }
            }

            //draw remaining string
            this._drawTextLine(context, str, y);
            y += this.lineHeight;
        }
        this.height = y;
    }

    Text.prototype._drawTextLine = function(context,str,y)
    {
        var x = 0;
        switch(this.textAlign)
        {
            case "center":
                x = this.width*0.5;
                break;
            case "right":
                x = 0-this.width;
                break;
            case "end":
                x = this.width;
                break;
        };
        if(this.outline) context.strokeText(str, x, y);
        else context.fillText(str, x, y);
    };

    Text.prototype.getTextWidth = function(){
        return this.width > 0 ? this.width : this.textWidth;
    }
})();