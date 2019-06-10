$(function(){
  FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
  /**********公共配置部分**********/
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
  var TOKENMD5 = hex_md5("SkZUAroT");
  var USER;
  var OPENID = localStorage.getItem("openid");
  if (OPENID) {USER = JSON.parse(OPENID);OPENID = USER.openid;}//用户openid 
  var REG_PHONE  = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
  var USERMOBILE = localStorage.getItem("USERMOBILE") || '';
  if ($(".body_personal").html()) {/*查询是否注册登录过*/
    if (!(OPENID && USERMOBILE)) {
      sessionStorage.setItem("url_login", './page/center/personal.html');
      window.location.href="../../login.html";
    } else {
      isLogin();
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
      $("body").append(_str);setTimeout(function(){$("#showModal").fadeOut(300,function(){$("#showModal").remove();if(callback){callback();}});}, time);}            
  }
  function GetQueryString(name){//从地址栏获取传参
      var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if(r!=null)return  unescape(r[2]); 
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
  /*时间戳转换日期*/
  function time_stamp (times, symbol) {
    symbol ? symbol = symbol : symbol = '.';
    times = new Date(times * 1000);
    var _year = times.getFullYear();
    var _month = times.getMonth() + 1;
    var _date = times.getDate();
    return _year + symbol + (_month < 10 ? '0' + _month : _month) + symbol + (_date < 10 ? '0' + _date : _date);
  }
  /**********功能开发部分**********/
  /*判断是否注册登录过*/
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
  /*是否是会员*/
  function isVip() {
    var _isVip;
    var _url = SERVICE + "api/Info/is_my_vip";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.ajax({
        url : _url,
        type : "get",
        data : _data,
        async : false,
        success : function(res) {
          res = JSON.parse(res);
          if (res.status == 200) {
            _isVip = res.vip.vip_grade;
            $(".personal_list ul li.my_vip a").attr("href", "../../order-status.html?index=4");
          } else if (res.status == 404){
            _isVip = false;
            $(".personal_list ul li.my_vip a").attr("href", "./per_viplist.html");
          }
        }
    });
    return _isVip;
  }
  /*会员介绍*/
  if ($(".per_viplist").html()) {
    var _url = SERVICE + "api/Info/get_vip_thing";
    var _data = {submit: TOKENMD5};
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      $(".per_viplist_top p").html(res.thing.thing);
    });
  }
  /**********个人中心**********/
  if ($(".body_personal").html()) {
    $("img#userAvatar").attr("src", USER.headimgurl);//头像
    $("#userName").html(USER.nickname);//昵称
    if (isVip() == 1) {
      $(".personal_title_right .vipIcon").addClass("vip1").html("小书童");

    } else if (isVip() == 2) {
      $(".personal_title_right .vipIcon").addClass("vip2").html("小秀才");
    } else if (isVip() == 3) {
      $(".personal_title_right .vipIcon").addClass("vip3").html("小状元");
    }
  }
  if ($(".per_problem_box").html()) {
    $.get("../../template/template_center.html", function(res){
      $("body").append(res);
      problem_list();//常见问题列表
    })
  }
  /*搜索常见问题*/
  var _auto_search;
  $("#input_problem").bind("input propertychange", function(){
    var _input = $(this).val().replace(/[\s]/g, '');
    if (_input) {
      if (_auto_search) {
        clearTimeout(_auto_search);
      }
      _auto_search = setTimeout(function(){
          var _data_tem = {};
          var _url = SERVICE + "api/Problem/searchQuestion";
          var _data = {
            submit: TOKENMD5,
            content﻿: _input
          }
          $.get(_url, _data, function(res){
            res = JSON.parse(res);
            if (res.status == 200) {
              _data_tem.list = res.content;
              $(".per_problem .per_problem_box ul").html(template("tem_center_problem", _data_tem));
            } else {
              $(".per_problem .per_problem_box ul").show().html('<li class="_no">没有关于"'+_input+'"的相关问题~</li>');
            }
          })
        }, 400);
    } else {
      clearTimeout(_auto_search);
      problem_list();
    }
  })
  /*常见问题列表*/
  function problem_list() {
    var _data_tem = {};
    var _url = SERVICE + "api/Problem/getQuestion";
    var _data = {
      submit: TOKENMD5
    }
    $.get(_url, _data, function(res){ 
      res = JSON.parse(res);
      if (res.status == 200) {
        _data_tem.list = res.content;
        $(".per_problem .per_problem_box ul").html(template("tem_center_problem", _data_tem));
      }
    }) 
  }
  /*常见问题详情*/
  $(".per_problem_box ul").delegate("li", "click", function(){
    $("#details .container h3,#details .container .text").html('');
    $("#details").addClass("on");
    var _url = SERVICE + "api/Problem/getQuestionDetail";
    var _data = {
      submit: TOKENMD5,
      id: $(this).data("id")
    }
    $.get(_url, _data, function(res){ 
      res = JSON.parse(res);
      console.log(res);
      if (res.status == 200) {
        $("#details .container h3").html('<i class="iconfont icon-wenti"></i>问题：' + res.content.question);
        $("#details .container .text").html(res.content.answer);
      }
    }) 
  });
  $("#details .top .back").on("click", function(){
    $("#details").removeClass("on");
  });
  /**********投诉建议**********/
  $("#submit_per_proposal").on("click", function(){
    var _textarea = $("#per_proposal").val();
    if (!_textarea) {
      showModal("请填写您的宝贵建议");
    } else {
    var _url = SERVICE + "api/Info/add_proposal";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      proposal: _textarea
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        $("#per_proposal").val('');
        showToast("提交成功", 1500);
      }
    })
    }
  });
  /**********到店体验券/优惠券**********/
  var voucher_type = 0;
  var more_page = 2;
  var more_list_str = [];
  var isLoad = true;
  if ($(".body_voucher").html()) {
    $.get("./template/template_coupon.html", function(res){
      $("body").append(res);
      voucher_not_used(2, 1); 
    })
    $(window).on("scroll",function(){
        var s_t=$(window).scrollTop();
        var p_h=window.innerHeight;
        var allH=$("body").prop("scrollHeight");
        if(s_t + p_h >= allH){ 
          if (isLoad) {
            isLoad = false;
            if (voucher_type == 0) {
              voucher_not_used(2, more_page++);
            } else if (voucher_type == 1) {
              voucher_not_used(1, more_page++);
            } else if (voucher_type == 2 || voucher_type == 3) {
              voucher_used(voucher_type, more_page++);
            }
          }
        }   
      }); 
  }
  /*到店体验券和优惠券*/
  function voucher_not_used(range, page) {
    var _data_tem = {};
    var _url = SERVICE + "api/Info/get_range_coiling";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      range: range,
      page_rows: page
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        for (k in res.coilings) {
            res.coilings[k].addtime = time_stamp(res.coilings[k].addtime);
            res.coilings[k].endtime = time_stamp(res.coilings[k].endtime);
        }
        if (page == 1 && res.coilings.length < 4) {
          $(".scroll_load_more").hide();
        }
        isLoad = true;
        more_list_str = more_list_str.concat(res.coilings);
        _data_tem.list = more_list_str;
        if (range == 1) {
          $(".body_voucher .voucher_two").html(template("tem_voucher", _data_tem));
        } else if (range == 2) {
          $(".body_voucher .voucher_one").html(template("tem_voucher", _data_tem));
        }
      } else if (res.status == 404){ 
        if (page != 1) {
          isLoad = false;
          $(".scroll_load_more").show().html("没有更多啦~"); 
        } else {
          $(".scroll_load_more").show().html("您还没有获得此券或已使用完~"); 
        }
      }
    })
  }
  /*使用记录和已过期*/
  function voucher_used(index, page) {
    var _data_tem = {};
    var _url;
    var _url_one = SERVICE + "api/Info/use_coiling";
    var _url_two = SERVICE + "api/Info/overdue_coiling";
    if (index == 2) {
      _url = _url_one;
    } else if (index == 3) {
      _url = _url_two;
    }
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      page_rows: page
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        for (k in res.coilings) {
          res.coilings[k].addtime = time_stamp(res.coilings[k].addtime);
          res.coilings[k].endtime = time_stamp(res.coilings[k].endtime);
        } 
        if (page == 1 && res.coilings.length < 4) {
          $(".scroll_load_more").hide();
        }
        isLoad = true;
        more_list_str = more_list_str.concat(res.coilings);
        _data_tem.list = more_list_str;
        if (index == 2) {
          for (var k in _data_tem.list) {
            _data_tem.list[k].isDisable = 1;
          }
          $(".body_voucher .voucher_three").html(template("tem_voucher", _data_tem));
        } else if (index == 3) {
          $(".body_voucher .voucher_four").html(template("tem_voucher", _data_tem));
        }
      } else if (res.status == 404){
        if (page != 1) { 
          isLoad = false;
          $(".scroll_load_more").show().html("没有更多啦~");
        } else {
          if (index == 2) {
            $(".scroll_load_more").show().html("您还没有到店体验券/优惠券的使用记录~"); 
          } else {
            $(".scroll_load_more").show().html("暂无过期的优惠券记录~");
          }
        }
      }
    })
  }
  /*切换四个券栏目*/
  $("#am-kinds li").on("click", function(){
    isLoad = false;
    $("html,body").animate({"scrollTop": 0},200);
    $(".scroll_load_more").show().html("加载中...");
    more_list_str = [];
    var _index = $(this).index();
    voucher_type = _index;
    more_page = 2;
    if (_index == 0) {
      voucher_not_used(2, 1);
    } else if (_index == 1) {
      voucher_not_used(1, 1);
    } else if (_index == 2 || _index == 3) {
      voucher_used(_index, 1);
    }
  });
  /**********已预约故事会**********/
  if ($(".body_story").html()) {
    $.get("../../template/template_center.html", function(res){
      $("body").append(res);
      story_list();
    })
  } else if ($(".body_bookstore").html()) {
    $.get("../../template/template_center.html", function(res){
      $("body").append(res);
      bookstore_list();
    })
  } else if ($(".body_activity").html()) {
    $.get("../../template/template_center.html", function(res){
      $("body").append(res);
      vipActivity_list();
    })
  } 
  /*已预约故事会列表*/
  function story_list() {
    var _data_tem = {};
    var _url = SERVICE + "api/Appointment/getHasAppointment";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 200) {
        _data_tem.list = res.list.appointment_info;
        for (k in _data_tem.list) {
          _data_tem.list[k].name = res.list.store_info[0].name;
          _data_tem.list[k].address = res.list.store_info[0].address;
          _data_tem.list[k].phone = res.list.store_info[0].phone;
        }
        $(".reserve_list ul").html(template("tem_story_list", _data_tem));
      } else {
        $(".reserve_list ul").html('<li class="not_list">你还没有预约过故事会，快去<a href="../../engagement/stores.html">预约吧&gt;&gt;</a></li>');
      }
    }) 
  }
  /*已预约到店看书列表*/
  function bookstore_list() {
    var _data_tem = {};
    var _url = SERVICE + "api/Appointment/getHasAppointmentRead";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 200) {
        _data_tem.list = res.list.appointment_info;
        for (k in _data_tem.list) {
          _data_tem.list[k].name = res.list.store_info[0].name;
          _data_tem.list[k].address = res.list.store_info[0].address;
          _data_tem.list[k].phone = res.list.store_info[0].phone;
        }
        $(".reserve_list ul").html(template("tem_story_list", _data_tem));
      } else {
        $(".reserve_list ul").html('<li class="not_list">你还没有预约过到店，快去<a href="../../engagement/yyrules.html">预约吧&gt;&gt;</a></li>');
      }
    }) 
  }
  /*已预约会员活动列表*/
  function vipActivity_list() {
    var _data_tem = {};
    var _url = SERVICE + "api/appointment/getHasAppointmentActivity";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 200) {
        _data_tem.list = res.list.appointment_info;
        for (k in _data_tem.list) {
          _data_tem.list[k].name = res.list.store_info[0].name;
          _data_tem.list[k].address = res.list.store_info[0].address;
          _data_tem.list[k].phone = res.list.store_info[0].phone;
        }
        $(".reserve_list ul").html(template("tem_story_list", _data_tem));
      } else {
        $(".reserve_list ul").html('<li class="not_list">你还没有预约过到会员活动，快去<a href="../../engagement/activity.html">预约吧&gt;&gt;</a></li>');
      }
    }) 
  }
//  打开客服弹窗
  $('.contact, .customer_service').on('click', function() {
    if ($("#ewm").attr("src")) {
      $('.customer-service').fadeIn().addClass("on");
      return;
    }
    var _url = SERVICE + "api/Appointment/getService";
    var _data = {
      submit: TOKENMD5
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        $("#ewm").attr("src", res.list.file_path);
        $('.customer-service').fadeIn().addClass("on"); 
      }
    })
  });
  // 关闭客服弹窗
  $('#customer-close').on('click', function() {
    $('.customer-service').hide().removeClass("on"); 
  });

  /*客服二维码*/
  if ($(".body_customer_service").html()) {
    var _url = SERVICE + "api/Appointment/getService";
    var _data = {
      submit: TOKENMD5
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        $(".qr_code img").attr("src", res.list.file_path);
      }
    })
  }
})