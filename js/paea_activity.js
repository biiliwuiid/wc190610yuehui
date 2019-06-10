$(function(){
  FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
  /**********公共配置部分**********/
  //localStorage.removeItem("USERMOBILE");
  var APPID = "wx0f0cf12df3c0e698";//商户公众号appid（用于微信支付）
  var OPENID = localStorage.getItem("openid");
  if (OPENID) {OPENID = JSON.parse(OPENID).openid;}//用户openid 
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";//请求接口域名
  var TOKENMD5 = hex_md5("SkZUAroT");//md5加密
  var USERMOBILE = localStorage.getItem("USERMOBILE") || '';
  if ($(".body_activity").html() || $(".body_shop").html()) {/*查询是否注册登录过*/
    if (!(OPENID && USERMOBILE)) {
      if ($(".body_activity").html()) {
        sessionStorage.setItem("url_login", './engagement/activity.html');
      } else {
        sessionStorage.setItem("url_login", './engagement/dpnews.html');
      }
      window.location.href="../login.html";
    } else {
      isLogin();
    }
  } 
  /*查询账号是否被注销*/
  function isLogin(){
    var _url = SERVICE + "api/Index/is_login"; 
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.ajax({
      type : "get",
      url : _url, 
      data : _data, 
      async : false,
      success : function(res){
        res = JSON.parse(res); 
        if (res.status == 200) {
          if (res.subscribe !== 1) {
            var auto_count_down = setInterval(function(){
              if ($("#count_down").html() <= 1) {
                clearInterval(auto_count_down);
                closeWindow();
              }
              setTimeout(function(){$("#count_down").html(parseInt($("#count_down").html() - 1));},500);
            }, 1000);
            confirmModal('关注公众号', '您还未关注悦绘亲子图书馆公众号，为了更好的体验请先关注公众号。<br/><span style="color: #ff6c00;"><span id="count_down">10</span>s</span>后将自动退出...', '取消', false, '退出', '.6', function(res){
              if (res) {
                closeWindow();
              }
            })
            return;
          }
          return false;
        } else if (res.status == 404) {
          sessionStorage.removeItem("openid");
          localStorage.removeItem("openid");
          localStorage.removeItem("USERMOBILE");
          localStorage.removeItem("isSelectLabel");
          window.location.href="./login.html";
        } else if (res.status == 403) { 
          var auto_count_down = setInterval(function(){
            if ($("#count_down").html() <= 1) {
              clearInterval(auto_count_down);
              closeWindow(); 
            }
            setTimeout(function(){$("#count_down").html(parseInt($("#count_down").html() - 1));},500);
          }, 1000);
          confirmModal('账号异常', '您的账号存在异常，已被暂时冻结，如有疑问请联系悦绘客服。<br/><span style="color: #ff6c00;"><span id="count_down">10</span>s</span>后将自动退出...', '取消', false, '退出', '.6', function(res){
            if (res) {
              closeWindow();
            }
          })
          return; 
        }
      } 
    }); 
  }
  /*退出微信浏览器*/
  function closeWindow() {
    //这个可以关闭安卓系统的手机
    document.addEventListener('WeixinJSBridgeReady', function(){ WeixinJSBridge.call('closeWindow'); }, false);
    //这个可以关闭ios系统的手机
    try {
      WeixinJSBridge.call('closeWindow');
    }
    catch(error){
      console.log(error);
    }
  }
  /**********公共方法部分**********/
  $("body").delegate("#showModal", "click", function(){//关闭模态框
    $("#showModal").fadeOut(300,function(){$("#showModal").remove();});
  })
  function showModal(text){//模态框
    var _str = '<div id="showModal">'+ 
                  '<div class="showModalBox">'+  
                    '<span class="close">&times;</span>'+
                    '<i class="icon iconfont">&#xe724;</i>'+
                   '<p>'+text+'</p>'+ 
                  '</div>'+  
                '</div>';
    if (!$("#showModal").html()){$("body").append(_str);}            
  }
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
  function confirmModal(text, str, cancel, isCancel , confirm, opacity, callback){//确认取消框
    var _isCancel;
    if (!isCancel) {
      _isCancel = 'style="color:#555;"'
    }
    var _str = '<div id="confirmModal" style="background: rgba(0,0,0,'+opacity+');">'+
                  '<div class="confirmModalBox">'+
                    '<h3>' + text + '</h3>'+ 
                    '<p>' + str + '</p>'+
                    '<div class="button">'+
                      '<div class="cancel" '+_isCancel+'>' + cancel + '</div>'+
                      '<div class="confirm">' + confirm + '</div>'+
                    '</div>'+
                  '</div>'+
                '</div>';
    if (!$("#confirmModal").html()){$("body").append(_str);}             
    $("#confirmModal .cancel").on("click", function(){
      if (!isCancel) {return;}
      $("#confirmModal").fadeOut(100,function(){
        $("#confirmModal").remove();
        return callback(false);
      });
    }) 
    $("#confirmModal .confirm").on("click", function(){
      $("#confirmModal").fadeOut(100,function(){
        $("#confirmModal").remove();
        return callback(true);
      });
    })
  }
  /**********功能开发部分**********/
  /**********店铺**********/
  if ($(".body_shop").html()) {
    $.get("../template/template_activity.html", function(res){
      $("body").append(res);
      store_list();
    })
  }
  function store_list() { 
    var _data_tem = {};
    var _url = SERVICE + "api/Appointment/getStore";
    var _data = {
      submit: TOKENMD5
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        _data_tem.list = res.list.store;
        $(".theory-news .leirong").html(res.list.key.content);
        $("#dp-intro-box").html(template("tem_shop_list", _data_tem));
      }
    })
  }
  /*会员活动*/
  if ($(".body_activity").html()) {
    $.get("../template/template_activity.html", function(res){
      $("body").append(res);
      activity_list();
    })
  }
  function activity_list() { 
    var _data_tem = {};
    var _url = SERVICE + "api/Appointment/vipActivity";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      $(".theory-news .leirong").html(res.list.key.content);
      if (res.status == 200) {
        _data_tem.list = res.list.activity_info;
        for (k in _data_tem.list) {
          _data_tem.list[k].address = res.list.store_info[0].address;
          _data_tem.list[k].phone = res.list.store_info[0].phone;
        }
        $("#activity-list-box ul").html(template("tem_activity_list", _data_tem));
      } else {
        $("#activity-list-box ul").html('<li class="not-more">暂未开展任何活动，过段时间再来看看吧~</li>');
      }
    })
  }
  /*确认预约*/
  if ($(".body_activity_in").html()) {
    var activity_price = GetQueryString("price");
    var _year = GetQueryString("year");
    var _month = GetQueryString("month");
    var _day = GetQueryString("day");
    var _start = GetQueryString("start");
    var _end = GetQueryString("end");
    var _name = GetQueryString("name");
    var _week= GetQueryString("week");
    var _time;
    _start.slice(0, _start.indexOf(":")) < 12 ? _time = "上午" : _time = "下午";
    $(".content .sub-time span.date1").html(_year + "-" + (_month < 10 ? '0' + _month : _month) + "-" + (_day < 10 ? '0' + _day : _day));
    $(".content .sub-time span.date2").html('周' + _week + ' ' + _time + ' ' + _start + "-" + _end);
    $(".activity_name").html(_name);
    $("#totalPrice").html(changeTwoDecimal_f(activity_price, 2));
  }
  var MAXNUM = 2;//最大能预约的人数
    $("#add").on("click", function(){
      var is_select_voucher = $("#select_voucher").get(0).selectedIndex;
      if ($("#quantity").val() < MAXNUM) {
        $("#del").removeClass("disabled");
        $("#quantity").val(parseInt($("#quantity").val())+1);
        if (is_select_voucher == 0) {
          var total = activity_price*parseInt($("#quantity").val());
          $("#totalPrice").html(changeTwoDecimal_f(total, 2));
        }
      }
      if($("#quantity").val() >= MAXNUM){
        $("#add").addClass("disabled");
      }
    });
  /*商品数量-1*/
  $("#del").on("click", function(){
    var is_select_voucher = $("#select_voucher").get(0).selectedIndex;
    if($("#quantity").val() > 1){
      $("#add").removeClass("disabled");
      $("#quantity").val(parseInt($("#quantity").val())-1);
      if (is_select_voucher == 0) {
        var total = activity_price*parseInt($("#quantity").val());
        $("#totalPrice").html(changeTwoDecimal_f(total, 2));
      }
    }
    if($("#quantity").val() <= 1){
      $("#del").addClass("disabled");
    }  
  });
  /*选择是否用券*/
  $("#select_voucher").on("change", function(){
    var is_select_voucher = $("#select_voucher").get(0).selectedIndex;
    if (is_select_voucher == 0) {
      $("#add").removeClass("disabled");
      $("#totalPrice").html(changeTwoDecimal_f(activity_price * parseInt($("#quantity").val()), 2));
    } else if (is_select_voucher == 1){
      $("#totalPrice").html("0.00");
        if ($("#quantity").val() >= 2) {
          $("#quantity").val("2");
          $("#add").addClass("disabled");
        }
    }
  });
  /*确认预约会员活动*/
  /*点击确认预约按钮*/
  var IS_PAYMENT = false;//是否已经点击确认预约，防止多点
  $("#confirm_activity").on("click", function(){
      if (IS_PAYMENT) {return;}
      IS_PAYMENT = true;
      var is_select_voucher = $("#select_voucher").get(0).selectedIndex;
      var _url = SERVICE + "api/Activity/useCoiling";
      var _data = {
        submit: TOKENMD5,
        openid: OPENID,
        year: _year,
        month: _month,
        day: _day,
        start: _start,
        end: _end,
        join_num: $("#quantity").val(),
        activity_name: $(".activity_name").html(),
        order_key: "yuehui" + new Date().getTime()
      }
      if (is_select_voucher == 0) {
        _url = SERVICE + "api/Activity/pay_order"
        _data.order_prise = $("#totalPrice").html();
        _data.body = "用于预约会员活动购买。"
      }
      $.get(_url, _data, function(res){
        res = JSON.parse(res);
        if (res.status == 200) {
          data = res.data;
          if (is_select_voucher == 0) {
            /*后台返回调取微信支付接口所需相关参数*/ 
            window['_timeStamp'] = data.timeStamp;
            window['_nonceStr'] = data.nonceStr;
            window['_package'] = data.package;
            window['_signType'] = data.signType;
            window['_paySign'] = data.paySign;
            window['_appId'] = data.appId;
            callpay(); 
          } else if (is_select_voucher == 1) {
            showToast("预约成功", 1500, function() {
              window.location.href="./activity.html";
            });
          }
        } else {
          IS_PAYMENT = false;
          showToast(res.message, 1500);
        }
      })
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
            showToast("预约成功", 1500, function() {
              window.location.href="./activity.html";
            });
            //addCard();//-->调用微信发送卡券方法
          } else {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
            IS_PAYMENT = false;
            showToast("支付失败", 1500);
          }  
        });
      }
    });
})