$(function(){
  FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
  /**********公共配置部分**********/
  var APPID = "wx0f0cf12df3c0e698";//商户公众号appid（用于微信支付）
  var OPENID = JSON.parse(localStorage.getItem("openid")).openid;
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
  var TOKENMD5 = hex_md5("SkZUAroT");
  var REG_PHONE  = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
  var USERMOBILE = localStorage.getItem("USERMOBILE") || '';
  var FESTIVAL = [
                   {name: "中秋节", year: "2018年", date:["9月22日", "9月23日", "9月24日"]},
                   {name: "国庆节", year: "2018年", date:["10月1日", "10月2日", "10月3日", "10月4日", "10月5日", "10月6日", "10月7日"]},
                   {name: "元旦节", year: "2019年", date:["1月1日"]}
                 ];
  if ($(".body_engagement").html() || $(".body_yyrules").html()) {/*查询是否注册登录过*/
    if (!USERMOBILE) {
      if ($(".body_engagement").html()) { 
        sessionStorage.setItem("url_login", './engagement/stores.html');
      } else {
        sessionStorage.setItem("url_login", './engagement/yyrules.html');
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
      $("body").append(_str);
      setTimeout(function(){$("#showModal").fadeOut(300,function(){$("#showModal").remove();if(callback){callback();}});}, time);
    }            
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
  /**********我们约会吧**********/
  /*判断是否是会员*/
  function isVip(callBack) {
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
        callBack(res);
      } 
    }); 
  }
  if ($(".body_engagement").html()) {
    $.get("../template/template_engagement.html", function(res){
      $("body").append(res);
      var _week = new Date().getDay()==0 ? 7 : new Date().getDay();
      $(".am-tabs-bd .am-tab-panel:eq("+ (_week - 1) +"),#lpj>li:eq("+ (_week - 1) +")").addClass("am-active").siblings().removeClass("am-active");
      timetable(transform_week(_week), _week);//本周课表
    })
  }
  /*星期数字转中文*/
  function transform_week(week){
    var new_week;
    switch(parseInt(week)){
      case 0:
        new_week = "日";
        break;
      case 1:
        new_week = "一";
        break;
      case 2:
        new_week = "二";
        break;  
      case 3:
        new_week = "三";
        break;
      case 4:
        new_week = "四";
        break;
      case 5:
        new_week = "五";
        break;
      case 6:
        new_week = "六";
        break;
      case 7:
        new_week = "日";
        break;
    }
    return new_week;
  }
  function timetable(week, week_index) {
    var _data_rem = {};
    var _data_rem2 = {list:[]};
    var _url = SERVICE + "api/Appointment/getLesson";
    var _data = {
      openid: OPENID,
      submit: TOKENMD5,
      week_num: week
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      $(".theory-news .leirong").html(res.list.key.content);
      if (res.status == 200) {
        $("#doc-tab-demo-1 .am-tab-panel:eq("+(week_index - 1)+") .teacher_top").html(res.list.month + "月" + res.list.day + "日");
        _data_rem.list = res.list.lesson;
        for (k in _data_rem.list) {
          _data_rem.list[k].year = res.list.year;
          _data_rem.list[k].month = res.list.month;
          _data_rem.list[k].day = res.list.day;
          _data_rem.list[k].week_num = week;
        }
        $("#doc-tab-demo-1 .am-tab-panel:eq("+(week_index - 1)+") .teacher_box").show();
        $("#doc-tab-demo-1 .am-tab-panel:eq("+(week_index - 1)+") .subscribe_box").html(template("tem_engagement_list", _data_rem));
      } else {
        $("#doc-tab-demo-1 .am-tab-panel:eq("+(week_index - 1)+") .teacher_box").hide();
        $("#doc-tab-demo-1 .am-tab-panel:eq("+(week_index - 1)+") .subscribe_box").html('<div class="subscribe flex_com not-more">当天暂未开设故事会~</div>');
      }
    })
  }
  /*周一到周日切换*/
  $("#doc-tab-demo-1 ul li").on("click", function(){
    var _week_index = $(this).index() + 1;
    $("#doc-tab-demo-1 .bg").css("left", $("#doc-tab-demo-1 ul li.bg").width() * (_week_index - 1));
    timetable(transform_week(_week_index), _week_index);
  });
  /*根据日历预约*/
  function calendar_list(){
    var _url = SERVICE + "api/Appointment/getTime";
    var _data = {
      submit: TOKENMD5,
      month: month
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 200) {
        $(".theory-news .leirong").html(res.list.key.content);
        $(".intro .lesson-teah .le-time span.date").html(res.list.month + "月" + res.list.day + "日");
        $(".intro .lesson-teah .le-teah span.teah_name").html(res.list.teacher[0]);
        $(".intro .teah-pic img").attr("src", res.list.teacher_pic[0]);
        _data_rem.list = res.list.lesson;
        $("#doc-tab-demo-1 .am-tab-panel:eq("+(week - 1)+") .subscribe_box").html(template("tem_engagement_list", _data_rem));
      }
    })
  }
  /*确认预约*/
  var TOTAL_AMOUNT = 80;//初始化每人价格
  var TOTAL_NUMBER= 1;//初始化人数
  if ($(".appointment").html()) {
    var _year = GetQueryString("year");
    var _month = GetQueryString("month");
    var _day = GetQueryString("day");
    var _start = GetQueryString("start");
    var _end = GetQueryString("end");
    var _time;
    _start.slice(0, _start.indexOf(":")) < 12 ? _time = "上午" : _time = "下午";
    var _week= GetQueryString("week");
    if (_week == '六' || _week == '日') {
      TOTAL_AMOUNT = 100;
    }
    $(".content .sub-time span.date1").html(_year + "-" + (_month < 10 ? '0' + _month : _month) + "-" + (_day < 10 ? '0' + _day : _day));
    $(".content .sub-time span.date2").html('周' + _week + ' ' + _time + ' ' + _start + "-" + _end);
    $("#totalPrice").html(changeTwoDecimal_f(TOTAL_AMOUNT, 2));
    /*商品数量+1*/
    var MAXNUM = 2;//最大能预约的人数
    $("#add").on("click", function(){
      var is_select_voucher = $("#select_voucher").get(0).selectedIndex;
      if ($("#quantity").val() < MAXNUM) {
        $("#del").removeClass("disabled");
        TOTAL_NUMBER = parseInt($("#quantity").val()) + 1;
        $("#quantity").val(TOTAL_NUMBER);
        if (is_select_voucher == 0) {
          $("#totalPrice").html(changeTwoDecimal_f(TOTAL_AMOUNT * TOTAL_NUMBER, 2));
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
        TOTAL_NUMBER = parseInt($("#quantity").val()) - 1;
        $("#quantity").val(TOTAL_NUMBER);
        if (is_select_voucher == 0) {
          $("#totalPrice").html(changeTwoDecimal_f(TOTAL_AMOUNT * TOTAL_NUMBER, 2));
        }
      }
      if(TOTAL_NUMBER <= 1){
        $("#del").addClass("disabled");
      }  
    });
    /*选择是否用券*/
    $("#select_voucher").on("change", function(){
      var is_select_voucher = $("#select_voucher").get(0).selectedIndex;
      if (is_select_voucher == 0) {
        $("#totalPrice").html(changeTwoDecimal_f(TOTAL_AMOUNT * TOTAL_NUMBER, 2));
      } else {
        $("#totalPrice").html("0.00");
      }
    });
    /*点击确认预约按钮*/
    var IS_PAYMENT = false;//是否已经点击确认预约，防止多点 
    $("#confirm_appointment").on("click", function(){
      isVip(function(res) {
        if (res.status === 404) {
          showToast("您还不是会员，会员尊享预约特权", 2000);
          IS_PAYMENT = false;
          return;
        }
        if (IS_PAYMENT) {return;}
        IS_PAYMENT = true;
        var _vip_grade = res.vip.vip_grade;
        var _week = GetQueryString("week");
        var is_select_voucher = $("#select_voucher").get(0).selectedIndex;
        var _url = SERVICE + "api/Appointment/useCoiling";
        var _data = {
          submit: TOKENMD5,
          openid: OPENID,
          year: _year,
          month: _month,
          day: _day,
          start: _start,
          end: _end,
          join_num: TOTAL_NUMBER,
          coiling_title: 1,
          id: GetQueryString("id"),
          order_key: "yuehui" + new Date().getTime()
        }
        if (is_select_voucher == 0) { 
          _url = SERVICE + "api/Appointment/pay_order"
          delete(_data.coiling_title);
          _data.order_prise = TOTAL_AMOUNT * TOTAL_NUMBER; 
          _data.body = "用于预约故事会购买。"
        }     
        /*如果用户为【小书童】会员使用到店体验券时判断当天是否为周末或节假日*/
        if (_vip_grade == 1 && is_select_voucher == 1) {
          if ((_week== "六" || _week == "日")) {
            showToast("【小书童】会员仅限非周末、非节假日使用到店体验券哦~", 2000);
            IS_PAYMENT = false;
            return;
          }
          var _curDate = _year + "年" + _month + "月" + _day + "日";
          for (var m in FESTIVAL) {
            for (var n in FESTIVAL[m].date) {
              var new_curDate = FESTIVAL[m].year + FESTIVAL[m].date[n];
              if (_curDate === new_curDate) {
                showToast("【小书童】会员仅限非周末、非节假日使用到店体验券哦~", 2000);
                IS_PAYMENT = false;
                return;
              }
            }
          } 
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
                //window.location.href="./stores.html";
                window.location.href=document.referrer;
              });
            }
          } else {
            IS_PAYMENT = false;
            showToast(res.message, 1500);
          }
        })
      });
      
    });
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
            //window.location.href="./stores.html";
            window.location.href=document.referrer;
          });
          //addCard();//-->调用微信发送卡券方法
        } else {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
          IS_PAYMENT = false;
          showToast("支付失败", 1500);
        }  
      });
    }
  }
  /*日历预约*/
    if ($(".body_yyrules").html()) {
      $.get("../template/template_engagement.html", function(res){
        $("body").append(res);
        yyrules_day(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), (new Date().getDay() == 0 ? 7 : new Date().getDay()));//本周课表
      })
      yyrules_list(new Date().getMonth() + 1);
      var options = {
            width: '94%',
            height: '2.35rem',
            language: 'CH', //语言
            showLunarCalendar: false, //阴历
            showHoliday: true, //休假
            showFestival: true, //节日
            showLunarFestival: true, //农历节日
            showSolarTerm: true, //节气
            showMark: true, //标记
            //获取点击的日期
            onClick: (day) =>  {
              var _year = day.getFullYear();
              var _month = day.getMonth() + 1;
              var _day = day.getDate();
              var _week = day.getDay() == 0 ? 7 : day.getDay();
              yyrules_day(_year, _month, _day, _week);
            },
            timeRange: {
                startYear: 1900,
                endYear: 2049
            },
            theme: {
                changeAble: false,
                weeks: {
                backgroundColor: '#FBEC9C',
                fontColor: '#4A4A4A',
                fontSize: '20px',
                },
                days: {
                backgroundColor: '#ffffff',
                fontColor: '#565555',
                fontSize: '24px'
                },
                todaycolor: 'orange',
                activeSelectColor: 'orange',
            }
        }
        var myCalendar = new SimpleCalendar('#container', options);
    }
    /*当前所有天是否预约满*/
    function yyrules_list(month) {
      var _url = SERVICE + "api/Appointment/getMonthTime";
      var _data = {
        submit: TOKENMD5,
        month: month
      }
      $.get(_url, _data, function(res){
        res = JSON.parse(res);
        if (res.status == 200) {
          var _isTrue = res.list;
          var _day_all = $("#container .item-nolunar:not([class*=sc-othermenth])");
          for(k in _isTrue) {
            $(_day_all[_isTrue[k] - 1]).addClass("on")
            //$("#container .item-nolunar:eq("+ (_isTrue[k]) +")").addClass("on");
          }
        }
      })
    }
    function yyrules_day(year, month, day, week) {
      $("#sy-seat—box").fadeOut(50);
      var _data_rem = {};
      var _url = SERVICE + "api/Appointment/getTime";
      var _data = {
        openid: OPENID,
        submit: TOKENMD5,
        month: month,
        day: day
      }
      switch (parseInt(week)) {
      case 1:
        week = '一';
        break;  
      case 2:
        week = '二';
        break;
      case 3:
        week = '三';
        break;
      case 4:
        week = '四';
        break;
      case 5:
        week = '五';
        break;
      case 6:
        week = '六';
        break;
      case 7:
        week = '日';
        break;        
    }
      $.get(_url, _data, function(res){
        res = JSON.parse(res);
        if (res.status == 200) {
          _data_rem.list = res.list;
          for (k in _data_rem.list) {
            _data_rem.list[k].year = year;
            _data_rem.list[k].month = month;
            _data_rem.list[k].day = day;
            _data_rem.list[k].week_num = week;
          }
          $("#sy-seat—box").fadeIn(50).html(template("tem_yyrules_day", _data_rem));
        } else {
          $("#sy-seat—box").fadeIn(50).html('<div class="sy-seat flex_row not">当天暂无课程安排~</div>');
        }
      })
    }
    /*上一月*/
    $(".sc-mleft").on("click", function(){
      $(".sc-mleft").css("opacity", "0");
      $(".sc-mright").css("opacity", "1");
      yyrules_list(new Date().getMonth() + 1);
    });
    /*下一月*/
    $(".sc-mright").on("click", function(){
      $(".sc-mleft").css("opacity", "1");
      $(".sc-mright").css("opacity", "0");
      yyrules_list(new Date().getMonth() + 2);
    });
})