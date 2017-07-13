/**
 * Created by 王军 on 2017/4/17.
 */
/*var $ = {
    setOpacity:function(element,opacity){
        opacity = opacity>1?1:opacity;
        opacity = opacity<0?0:opacity;
        if(document.all){
            element.filter.alpha.opacity = opacity*100;
            element.style.zoom = 1;
        }else{
            element.style.opacity = opacity;
        }
        return  opacity;
    },
    fadeIn:function(element,time){
        var start = new Date()*1;
        element.style.display = 'block';
        $.setOpacity(element,0);
        var fadeInPlay = setInterval(function(){
            var end = new Date()*1;
            if($.setOpacity(element,(end-start)/time)>=1){
                clearInterval(fadeInPlay);
            }
        },1);
    },
    fadeOut:function(element,time){
        var start = new Date()*1;
        element.style.display = 'block';
        $.setOpacity(element,1);
        var fadeOutPlay = setInterval(function(){
            var end = new Date()*1;
            if($.setOpacity(element,1-((end-start)/time))<=0){
                clearInterval(fadeOutPlay);
                element.style.display = 'none';
            }
        },1);
    }
};
var tips = (function(){
    var out = tag('div','tipspop');
    out.style.display = 'none';
    out.style.position = 'fixed';
    var main = out.append('div','popshow-tips');
    var op = out.append('div','tc mt10');
    var close = function(){
        $.fadeOut(out,200);
    };
    var show = function(option){
        document.body.appendChild(out);
        if(!option){
            var option = {
                callback:{}
            };
        } else {
            if(!option.callback) {
                option.callback = {};
            }
        }
        var config = {
            img:option.img||'<span class="mr5"></span>',
            text:option.text||'',
            autoHide:option.autoHide&&true,
            confirm:option.confirm||false,
            cancel:option.cancel||false,
            callback:{
                confirm:option.callback.confirm||false,
                cancel:option.callback.cancel||false
            }
        };
        main.innerHTML = config.img+config.text;
        out.style.display = 'block';
        out.style.left = (window.innerWidth-out.offsetWidth)/2+'px';
        out.style.top = (window.innerHeight-out.offsetHeight)/2+'px';
        $.fadeIn(out,200);
        out.style.zIndex = 2000;
        if(config.confirm) {
            if (!out.confirm) {
                var confirm = op.append('div', 'btn btn-primary btn-sm mr10');
                out.confirm = confirm;
                confirm.innerHTML = config.confirm;
                confirm.addEventListener('click', function () {
                    tips.close();
                    if (config.callback.confirm) {
                        config.callback.confirm();
                    }
                })
            }
        }else {
            if (out.confirm) {
                op.removeChild(out.confirm);
                out.confirm = false;
            }
        }
        if(config.cancel){
            if(config.cancel){
                if(!out.cancel){
                    var cancel = op.append('div','btn btn-default btn-sm');
                    out.cancel = cancel;
                    cancel.innerHTML = config.cancel;
                    cancel.addEventListener('click',function(){
                        tips.close();
                        if(config.callback.cancel){
                            config.callback.cancel();
                        }
                    })
                }
            }
        }else{
            if(out.cancel){
                op.removeChild(out.cancel);
                out.cancel = false;
            }
        }
        if(config.autoHide || config.autoHide === undefined){
            setTimeout(tips.close,2000);
        }
    };
    return {
        show:show,
        close:close
    }
})();*/
var parseMsToTime = function(s){
    s = s > 0 ? s : 0;
    var str = '';
    var h = 0;
    var mi = Math.floor(s / 60);
    s = s % 60;
    if(mi >= 60) {
        h = Math.floor(mi / 60);
        mi = mi % 60;
    }
    if(h > 0) {
        str += h + '时';
    }
    if(mi > 0) {
        str += mi + '分';
    }
    str += s + '秒';
    return str;
};

var realTimeMessage = (stops, time) => {
    "use strict";
    return "还有" + stops + "站，" + parseMsToTime(time) + "后预计到达";
};

/*function tag(tagName,props){
    var Tag = document.createElement(tagName);
    if(typeof props == 'string'){
        Tag.className = props;
    }
    else{
        if(props != undefined){
            /!*if(props.style){
             updateObject(props.style,tag.style);
             delete props.style;
             }*!/
            updateObject(props,Tag);
        }
    }
    Tag.append = function (tagName, props) {
        return Tag.appendChild(tag(tagName, props));
    };
    return Tag;
}
function updateObject(inputValue,outputValue){
    for(var key in inputValue) {
        if (inputValue[key] && inputValue[key].constructor == Object) {
            outputValue[key] = this.updateObject(inputValue[key], outputValue[key]);
        }
        else if (inputValue[key] != undefined) {
            outputValue[key] = inputValue[key];
        }
    }
    return outputValue;
}*/

module.exports = {
   /* $: $,
    tips: tips,
    tag: tag,
    updateObject: updateObject,*/
    parseMsToTime: parseMsToTime,
    realTimeMessage: realTimeMessage
};
