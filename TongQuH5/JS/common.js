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

    	})
    }
    //加载外部js(方便微信分享，支付等js的引入)
    ,loadJs: function(src){
    	var st = document.createElement("script");
    	st.src = src;
    	document.body.appendChild(st);
    }
}

//各个页面的js

//login
tq.home = {
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


}

