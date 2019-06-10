$(function(){
  FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
  /**********公共配置部分**********/
  /*将sessionStrorage的个人信息转存到localStorage*/
  localStorage.setItem("openid", sessionStorage.getItem("openid"));
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";//请求接口域名
  var OPENID = localStorage.getItem("openid");
  if (OPENID) {OPENID = JSON.parse(OPENID).openid;}//用户openid 
  var TOKENMD5 = hex_md5("SkZUAroT");//md5加密
  var REG_PHONE  = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;//正则--手机号
  var REG_CHINESE = /^[\u4E00-\u9FA0]{2,6}$/;//正则--中文
  isLogin();//首页判断是否有注册登录过
  /**********公共方法部分**********/
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
  $("body").delegate("#showModal", "click", function(){//关闭模态框
    $("#showModal").fadeOut(300,function(){$("#showModal").remove();});
  })
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
  /*判断是否注册登录过*/
  function isLogin(){
    var isLogins;
    var _url = SERVICE + "api/Index/is_login";
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
        if (res.status == 200 || res.status == 403) {
          _phone = res.phone;
          localStorage.setItem("USERMOBILE", _phone);
          var _url = sessionStorage.getItem("url_login");
          if (_url) {
            sessionStorage.removeItem("url_login");
            window.location.href=_url;
          } else {
            return;
          }
        } else {
          isLogins = false;
        }
      } 
    }); 
    //return isLogins;
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
  /**********登录页**********/
  $(".login").addClass("on");
  /*发送手机验证码*/
  $("#obtainCode").on("click", function(){
    var _self = $(this);
    var _phone = $("#phone").val();
    var _name = $("#name").val();
    var _url = SERVICE + "api/Login/verety";
    var _data = {
      type: "echosms",
      submit: TOKENMD5,
      phone: _phone
    };
    if (REG_PHONE.test(_phone) && REG_CHINESE.test(_name)) {
      $.get(_url, _data, function(res){
        res = JSON.parse(res);
        if (res.status == 200) {
          var _selfParent = _self.parent(".obtainCode");
          _selfParent.addClass("switch");
          showToast("发送成功", 1500);
          $("#verificationCode").prop("disabled", "");
          count_down(".obtainCode span", 60, function(){_selfParent.removeClass("switch");});
        } else {
          showToast(res.message, 1500);
        }
      })
    } else if (!REG_CHINESE.test(_name)) {
      if (!_name) {
        showModal("真实姓名不能为空");
        return;
      } else {
        showModal("真实姓名只能为2-6位中文字符");
        return;
      }
    } else {
      if (!_phone) {
        showModal("手机号不能为空");
        return;
      } else {
        showModal("请填写符合规范的手机号");
        return;
      }
    }
  });
  /*确认密码完成注册*/
  $("#submit_register").on("click", function(){
    var _name = $("#name").val();
    var _password = $("#password").val();
    var _passwords = $("#passwords").val();
    var _phone = $("#phone").val();
    var reg_paw = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
    if (reg_paw.test(_password) && (_password===_passwords)) {
      var _url = SERVICE + "api/Login/doRegister";
      var _data = {
        pwd: _password,
        re_pwd: _passwords,
        submit: TOKENMD5,
        phone: _phone,
        openid: OPENID,
        realname: _name
      };
      $.get(_url, _data, function(res){
        res = JSON.parse(res);
        if (res.status == 200) {
          $(".login .login_box input").val("");
          localStorage.setItem("USERMOBILE", _phone);
          showToast("注册成功", 1000, function(){
            var _url = sessionStorage.getItem("url_login");
            if (!_url) {
              window.location.href="./index.html";
            } else {
              sessionStorage.removeItem("url_login");
              window.location.href=_url;
            }
          });
        } else {
          showToast(res.message, 1500);
        }
      })
    } else { 
      if (!_password) {
        showModal("密码不能为空");
        $("#passwords").val("");
      } else if (!reg_paw.test(_password)) {
        showModal("请填写6-16位字母、数字组合密码");
      } else if (!_passwords) {
        showModal("确认密码不能为空");
      } else {
        showModal("两次密码输入不一致");
        $("#passwords").val("");
      }
    }
  });
  /*倒计时*/
  function count_down(ele, times, callback){
    var _time = times - 1;
    $(ele).html(_time + "s")
    var auto_times = setInterval(function(){
      _time --;
      if(_time > 0){$(ele).html(_time + "s")}else{clearInterval(auto_times);if(callback){callback();}}
    }, 1000)
  }
  /*输入手机验证码跳转到输入密码页*/
  $("#verificationCode,#name").on("input",function(){
    var _name = $("#name").val();
    var _input = $("#verificationCode").val();
    if (_input.length === 4 && _name) {
      $("#submit_validate").prop("disabled", '');
    } else {
      $("#submit_validate").prop("disabled", 'disabled');
    }
  })
  //$("#submit_validate").prop("disabled", '');
  $("#submit_validate").on("click", function(){
    var _name = $("#name").val();
    var _phone = $("#phone").val();
    var _verety = $("#verificationCode").val();
    var _url = SERVICE + "api/Login/auth_phone";
    var _data = {
      verety: _verety,
      submit: TOKENMD5,
      phone: _phone,
      realname: _name
    };
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 200) {
        $(".login .login_box").addClass("on");
      } else {
        showToast(res.message, 1500);
        $(this).val("").blur();
      }
    })
 // $(".login .login_box").addClass("on");
  })
  /**********个人中心**********/
  /*图标懒加载*/
  var lazyload_all = [".reserve_list .list_center .img img", ".per_viplistBox ul li .img img"];
  var lazyload_dom = '';
  lazyload_all.forEach(function(item){
    if ($(item).attr("src")){
      lazyload_dom +=  item
    }
  });
  if (lazyload_dom) {
    $(".reserve_list .list_center .img img, .per_viplistBox ul li .img img").lazyload({
      placeholder : "../images/personal/loading.png", //用图片提前占位
        // placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
      effect: "fadeIn", // 载入使用何种效果
        // effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
      threshold: 100, // 提前开始加载
        // threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
      //event: 'click',  // 事件触发时才加载
        // event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
      //container: $("#container"),  // 对某容器中的图片实现效果
        // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
      //failurelimit : 10 // 图片排序混乱时
         // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
    });
  }
});