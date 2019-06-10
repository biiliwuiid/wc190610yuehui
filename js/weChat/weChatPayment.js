 $(function(){
    /**********公共配置部分**********/
    var APPID = "wx0f0cf12df3c0e698";//商户公众号appid
    var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";//异步请求后台接口
    var TOKENMD5 = hex_md5("SkZUAroT");
    var OPENID = JSON.parse(localStorage.getItem("openid")).openid;
    //var URL_ADDCARD  = REQUEST_URL + "/wx7c3ed56f7f792d84/gym/getcard.php",//接口2: 发送卡券
    /**********公共方法部分**********/
    function showToast(text, time, callback){//提示框
    var _str = '<div id="showModal">'+ 
                  '<div class="showModal_box">'+text+'</div>'+  
                '</div>';
    if (!$("#showModal").html()){
      $("body").append(_str);setTimeout(function(){$("#showModal").fadeOut(300,function(){$("#showModal").remove();if(callback){callback();}});}, time)}            
    }
    function GetQueryString(name){//从地址栏获取传参
      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var URL =  decodeURI(window.location.search);
      var r = URL.substr(1).match(reg);
      if(r!=null){
          //decodeURI() 函数可对 encodeURI() 函数编码过的 URI 进行解码
          return  decodeURI(r[2]);
      };
      return null;
    }
    /*保留固定小数*/
    function changeTwoDecimal_f(x, n) {    
  　  var f_x = parseFloat(x);    
  　　if (isNaN(f_x)) {    
  　    return 0;    
  　　}    
  　　var f_x = Math.round(x*100)/100;    
  　　var s_x = f_x.toString();    
  　　var pos_decimal = s_x.indexOf('.');    
  　　if (pos_decimal < 0) {    
  　　  pos_decimal = s_x.length;    
  　　  s_x += '.';    
  　　}    
  　　while (s_x.length <= pos_decimal + n) {    
  　    s_x += '0';    
  　  }     
  　　return s_x;    
    } 
    /**********功能开发部分**********/
    /*购买会员选择会员套餐*/
    $(".per_privilege_box li").on("click", function(){
      $(this).addClass("selected").siblings().removeClass("selected");
    });
    /*判断是否是会员*/
    function isVip() {
      var _isVip;
      var _url = SERVICE + "api/Info/is_my_vip";
      var _data = {
        submit: TOKENMD5,
        openid: OPENID
      }
      $.ajax({
        type : "post",
        url : _url, 
        data : _data, 
        async : false,
        success : function(res){
          res = JSON.parse(res);
          if (res.status == 200) {
            _isVip = true;
          } else if(res.status == 404){
            if (res.is_new_vip == 1) {
              $("ul.privilege_bottom li.recommend").css("display", "flex");
            }
            _isVip = false;
          }
        } 
      }); 
      return _isVip;
    }
    if (!isVip()){
      $("#submit_vip").prop("disabled", "").html("购买");
    }
    /*会员价格*/
    var VIPPRICE = [];
    (function vipPrice(){
      var _url = SERVICE + 'api/Info/vip_type_price';
      var _data = {
        submit: TOKENMD5
      }
      $.get(_url, _data, function(res){
        res = JSON.parse(res);
        console.log(res);
        var _curGrade = $("#submit_vip").data("grade");
        $("ul.privilege_bottom li p span.monthPrice").html('￥' + changeTwoDecimal_f(res.vips[3].new_price, 2));
        $("ul.privilege_bottom li p span.original").html('￥' + changeTwoDecimal_f(res.vips[_curGrade - 1].old_price, 2));
        $("ul.privilege_bottom li p span.newPrice").html('￥' + changeTwoDecimal_f(res.vips[_curGrade - 1].new_price, 2));
        for(var i = 0; i < res.vips.length; i++) {
          if (i !== 3) {
            VIPPRICE.push(res.vips[i].new_price);
          } else {
            VIPPRICE.unshift(res.vips[i].new_price);
          }
        }
        purchase_vip();
      })
    })()
    /*购买会员*/
    var IS_PAYMENT = false; //是否已经点击购买，防止多点
    function purchase_vip() {
      /*会员协议*/ 
      $(".per_privilege_box .agreement").on("click", function(){
        if ($("#manual .bottom").html()) {
          $("#manual").fadeIn(300).addClass("on");
          return;
        }
        $("#manual").fadeIn(300, function(){
          var _url = SERVICE + "api/Info/get_vip_protocol";
          var _data = {submit: TOKENMD5}
          $.get(_url, _data, function(res){
            res = JSON.parse(res);
            $("#manual .bottom").html(res.protocol.protocol);
          })
        }).addClass("on");
      })
      $("#manual .close").on("click", function(){
        $("#manual").fadeOut(300).removeClass("on");
      })
      /*点击购买*/
      $("#submit_vip").on("click", function(){
        if (IS_PAYMENT) {return;}
        IS_PAYMENT = true;
        var _vip_grade = $(this).data("grade");
        var _url = SERVICE + "api/Pay/pay_vip";
        var _vip_type = $(".per_privilege_box li.selected").data("type");
        var _body = (_vip_grade == 1 ? "【小书童卡】会员" :(_vip_grade == 2 ? "【小秀才卡】会员" : "【小状元卡】会员")) + (_vip_type == 1 ? "【包月】服务购买" : "【包年】服务购买");
        if (_vip_type == 1 && _vip_grade == 1) {
          _vip_price = VIPPRICE[0];
        } else if (_vip_type == 2 && _vip_grade == 1) {
          _vip_price = VIPPRICE[1];
        } else if (_vip_grade == 2) {
          _vip_price = VIPPRICE[2];
        } else if (_vip_grade == 3) {
          _vip_price = VIPPRICE[3];
        }
        var _data = {
          submit: TOKENMD5,
          openid: OPENID, 
          order_prise: _vip_price,
          vip_grade: _vip_grade,
          vip_type: _vip_type,
          body: _body
        }
        $.get(_url, _data, function(res){
          res = JSON.parse(res)
          if (res.status == 200) { 
            var data = res.data;
            /*点击开始触发支付事件*/ 
                window['_timeStamp'] = data.timeStamp;
                window['_nonceStr'] = data.nonceStr;
                window['_package'] = data.package;
                window['_signType'] = data.signType;
                window['_paySign'] = data.paySign;
                window['_appId'] = data.appId;
                callpay();//-->调用微信支付接口方法
          } else {
            IS_PAYMENT = false;
            showToast(res.message, 1500);
          }
        }) 
      })
    }
    /*****调用微信官方支付接口--弹出支付密码框*****/
    function callpay() {
      if (typeof WeixinJSBridge == "undefined") {
    	if (document.addEventListener) {
    	  document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
    	} else if (document.attachEvent) {
    	  document.attachEvent('WeixinJSBridgeReady', jsApiCall);
    	  document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
    	}
      } else {
      	jsApiCall();
      }
    }
    function jsApiCall() {
      var _WeixinJSBridge_data = {
        "appId": APPID, //公众号名称，由商户传入     
        "timeStamp": window['_timeStamp'], //时间戳，自1970年以来的秒数     
        "nonceStr": window['_nonceStr'], //随机串     
        "package": window['_package'],
        "signType": window['_signType'], //微信签名方式：     
        "paySign": window['_paySign'] //微信签名     
      }  
      WeixinJSBridge.invoke('getBrandWCPayRequest',_WeixinJSBridge_data,function(res) {
        if (res.err_msg == "get_brand_wcpay_request:ok") {
          showToast("购买成功", 1500, function(){
            var url_login = sessionStorage.getItem("url_login");
            if (!url_login) {
              window.location.href = "../../ourselfs.html";
            } else {
              sessionStorage.removeItem("url_login");
              window.location.href = url_login;
            }
          });
        } else {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
          IS_PAYMENT = false;
          showToast("支付失败", 1500);
        }  
      });
    }
 })      