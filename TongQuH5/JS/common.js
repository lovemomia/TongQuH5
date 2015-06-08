var tq = {
	doing: false,
	p: {} // 当前页
};

//通用工具
tq.t = {
	init: function(){
		//点击logo回到首页
		$(".head").on('click',function(){
			location = "/"
		});
	}

	//弹框(比如说用户输入错误的提示框，css样式未写)
	,alert: function(){
		var s = '<div class="hide">'
			+ '<div class="alert">'
			+ '</div></div>';
			$(document.body).append(s);
	}
	//加载
    , wait: function (msg) {
        var s = '<div class="loading">';
        s += '<div class="ld">';
        s += '<img src="../image/loading.gif" />';
        s += '<p>' + (msg || '加载中...') + '</p>';
        s += '</div></div>';
        $(document.body).append(s);
        tq.doing = true;
    }
    //加载ok
    , waitok: function () {
        $('.loading').remove();
        tq.doing = false;
    }
    , loading: function (done) {
        if (!done) $('.body').append('<p id="p_loading" class="center"><br /><br />加载中...</p>');
        else $('#p_loading').remove();
    }
    //post请求入口
    ,post: function(url,para,callback){
    	$.post(url,para,function(data){
    		if(data.errno == 0 && !data.status){
    			callback();	
    		}else{
    			alert("erro");
    		}
    	})
    }
    //get请求入口
    ,get: function(url,para,callback){
    	$.get(url,para,function(data){
    		if(data.errno == 0 && !data.status){
    			callback();	
    		}else{
    			alert("erro");
    		}
    	})
    }
    //加载外部js(方便微信分享，支付等js的引入)
    ,loadJs: function(src){
    	var st = document.createElement("script");
    	st.src = src;
    	document.body.appendChild(st);
    }
    //设置，获取，删除cookie
   	,cookie: {
   		get: function(key){
   			var arr = new RegExp('\w?' + key + '=(.*?)(;|$)', 'i').exec(document.cookie);
   			return arr ? decodeURIComponent(arr[1]): '';
   		}
   		,set: function(key, val, days){
   			var reg = key + '=' + encodeURIComponent(val);
   			if(days){
   				var exp = new Date();
   				exp.setTime(exp.getTime() + days*24*60*60*1000);
   				reg += "; expires=" + exp.toGMTString();
   			}
   			reg += '; path=/';
   			document.cookie = reg;
   		}
   		,del: function(key){
   			tq.t.cookie.set(key, '',-10);
   		}
   	}
    //获取位置信息
    ,getLocation: function(){
    	
    	var loc = tq.t.cookie.get('loc');
    	if(loc && loc != '0'){
    		//重新刷新位置:tq.t.reget_loc();
    		return loc;
    	}
    	navigator.geolocation.getCurrentPosition(function(res){ //获取地理位置成功
    		loc = (res.coords.longitude + ',' + res.coords.latitude);
    		tq.t.cookie.set('loc', loc, 3);
    		tq.t.cookie.set('loc_at', 1, 0.02);//记录30分钟；

    		//获取具体的城市
    		$.get('cityapi', { pos: loc }, function(data){
    			if(ret.status){
    				//callback();
    			}
    		});

    	},function(res){
    		alert("erro"); //获取失败后的处理;
    	},
    		{ enableHighAcuracy: false, timeout: 5000, maximumAge: 30000
    	});
    }

    //图片轮播
    ,imgMove: function(obj,json,endFn){
          clearInterval(obj.timer);

          obj.timer = setInterval(function(){
      
              var bBtn = true;
          
              for(var attr in json){
            
                var iCur = 0;
          
                if(attr == 'opacity'){
                    if(Math.round(parseFloat(obj.css(attr))*100)==0){
                      iCur = Math.round(parseFloat(obj.css(attr))*100);
                    
                    }
                    else{
                      iCur = Math.round(parseFloat(obj.css(attr))*100) || 100;
                    } 
                  }
                else{
                 iCur = parseInt(obj.css(attr)) || 0;
                }
            
                var iSpeed = (json[attr] - iCur)/10;
                iSpeed = iSpeed >0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
                if(iCur!=json[attr]){
                      bBtn = false;
                }
          
                if(attr == 'opacity'){
                  obj.css(attr, (iCur + iSpeed)/100);
                }
                else{
                  obj.css(attr, iCur + iSpeed);
                }  
          }
          
          if(bBtn){
            clearInterval(obj.timer);
            
            if(endFn){
              endFn.call(obj);
            }
          }
          
        },30);
    }
}

//各个页面的js

tq.home = {

  //登录
  	login: function(odiv,phonetext,url){
  		var InterValObj; //timer变量，控制时间
  		var count = 30;//间隔函数，1秒执行
  		var curCount;//当前剩余秒数
  		odiv.on('click',function(){
  			sendMessage();
  		})
  		function sendMessage(){
  			curCount = count;
  			var phone = phonetext.val();//手机号码
  			var postStr = 'phone=' + phone;
  			tq.t.post(url,{phone:phone},suceess)
  		}
  		function SetRemainTime(){
  			if (curCount == 1) {                
  				window.clearInterval(InterValObj);//停止计时器
  				odiv.removeAttr("disabled");//启用按钮
  				odiv.removeClass("colddown");
  				odiv.html("重新发送");
  			}
  			else {
  				odiv.html( curCount + "秒后重试");
  				tq.t.waitok();
  				curCount--;
  			}
  		}
  		function suceess(){
  			odiv.attr("disabled", "true");
  			tq.t.wait();
  			odiv.val(curCount + "秒后重试");
  		 	odiv.addClass("colddown");
  			InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
  		}
  	}

    //图片轮播
    ,startMove: function(){
      var imgUl = $("#img");
      var imgLi = $("#img li");
      var numLi = $("#num li");
      
      var imgWidth = $(imgUl).width();
      var iNow = 0;
      var iNow2 = 0;

      $(imgUl).css('width', imgLi.length*imgWidth + 'px');

      for(var i=0; i<numLi.length; i++){
        numLi[i].index = i;
        $(numLi[i]).on("click",function(){
          for(var i=0; i<numLi.length; i++){
            numLi[i].className = "";
          }
        this.className = "hover";

        tq.t.imgMove(imgUl, {left:-this.index*imgWidth});

        });
      }

      setInterval(tab, 3000);

      function tab(){
        if(iNow == imgLi.length - 1){
          $(imgLi[0]).css('left', imgLi.length * imgWidth + 'px');
          $(imgLi[0]).css('position', 'relative');
          iNow = 0;
        }else{
          iNow++;
        }

        iNow2++;

        for(var i=0; i<numLi.length; i++){
          numLi[i].className = "";
        }

        numLi[iNow].className = 'hover';
        
        tq.t.imgMove(imgUl, {left: -iNow2 * imgWidth}, function(){
           if(iNow == 0){
              $(imgUl).css('left', 0);
              $(imgLi[0]).css('position', 'static');
              iNow2 = 0;
            }
        });
           
      }

    }
}

