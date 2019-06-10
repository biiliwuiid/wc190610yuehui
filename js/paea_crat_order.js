$(function(){
  FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
  /**********公共配置部分**********/
  var APPID = "wx0f0cf12df3c0e698";//商户公众号appid
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
  var TOKENMD5 = hex_md5("SkZUAroT");
  var USER = JSON.parse(sessionStorage.getItem("openid"));
  var OPENID = JSON.parse(localStorage.getItem("openid")).openid;
  var USERMOBILE = localStorage.getItem("userMobile") || '';
  var REG_PHONE  = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
/**********公共方法部分**********/
function GetQueryString(opt) {
    var reg = new RegExp("(^|&)"+ opt +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
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
  function confirmModal(text, str, cancel, confirm, callback){
    var _str = '<div id="confirmModal">'+
                  '<div class="confirmModalBox">'+
                    '<h3>' + text + '</h3>'+ 
                    '<p>' + str + '</p>'+
                    '<div class="button">'+
                      '<div class="cancel">' + cancel + '</div>'+
                      '<div class="confirm">' + confirm + '</div>'+
                    '</div>'+
                  '</div>'+
                '</div>';
    if (!$("#confirmModal").html()){$("body").append(_str);}             
    $("#confirmModal .cancel").on("click", function(){
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
  var BOOKSARRY = [];
  var IDS = [];
  var underLineOrderId;
  $.get("./template/template_crat_order.html", function(res){
    $("body").append(res);
    if (GetQueryString('id')) {
      IDS = GetQueryString('id').split(',');
      $(".user-info .addressBox").show();
      getAddress();
    } else {
      $(".order-details").addClass("underLine");
      underLineOrderId = GetQueryString('order_id');
      $(".user-info .underLineBox").show();
      $(".delivery .text-right").html("无");
      $(".invoice .text-right").html("线下订单开发票请联系店员");
    }
    getBagData();
  });
   var _data_rem_coiling = {};//所有优惠券
   var max_money = 0;//可优惠的最大金额
   /*优惠券选择*/
   $("#select_coupon").on("click", function(){
     if (!underLineOrderId) {
       $(".coupon_select").fadeIn(200, function(){$(this).addClass("on")}); 
     }
   });
   function coiling_list() {
     var _url = SERVICE + 'api/Order/get_coiling_list';
     var _data = {
       submit: TOKENMD5,
       openid: OPENID,
     }
     $.get(_url, _data, function(res){
       var is_coiling = false;//是否有可用优惠券
       var max_index = 0;
       res = JSON.parse(res);
       if (res.status == 200) {
        _data_rem_coiling.list = res.coiling;
        for (k in _data_rem_coiling.list) {
          _data_rem_coiling.list[k].addtime = time_stamp(_data_rem_coiling.list[k].addtime, '.');
          _data_rem_coiling.list[k].endtime = time_stamp(_data_rem_coiling.list[k].endtime, '.');
        }
        $(".coupon_select_box ul.coupon").html(template("tem_coupon_list", _data_rem_coiling));
        res.coiling = _data_rem_coiling.list;
        for (var i = 0; i < res.coiling.length; i++) {
          if (ORI_AMOUNT >= res.coiling[i].satisfy) {
            is_coiling = true;
            $(".coupon_select_box ul.coupon li:eq("+i+")").addClass("isSelect");
            if (res.coiling[i].reduce > max_money) {
              max_money = res.coiling[i].reduce;
              max_index = i;
            }
          }
        }
        if (is_coiling) {
          coiling_id = res.coiling[max_index].id;
          $("#select_coupon").html("满" + _data_rem_coiling.list[max_index].satisfy + "减" + _data_rem_coiling.list[max_index].reduce);
          $(".coupon_select_box ul.coupon li:eq("+max_index+")").addClass("on");
          TOTAL_AMOUNT = changeTwoDecimal_f((ORI_AMOUNT- max_money), 2);
          $('#amount').text("￥" + TOTAL_AMOUNT);
        } else {
          $("#select_coupon").html("没有可用优惠券");
        }
       } else {
          $("#select_coupon").html("没有可用优惠券");
          $(".coupon_select_box ul.coupon").html('<li class="not">你还未获得优惠券~</li>');
       }
     });    
   }
   /*确定选择优惠券/关闭优惠券选择弹框*/
   $(".coupon_select_box .close, #coupon_submit").on("click", function(){
    $(".coupon_select").fadeOut(100, function(){$(this).removeClass("on")}); 
   });
   /*选择某个优惠券*/
   $(".coupon_select_box ul").delegate("li.isSelect", "click", function(){
     $(this).addClass("on").siblings().removeClass("on");
     coiling_id = $(this).data("id");
     max_money = _data_rem_coiling.list[$(this).index()].reduce;
     $("#select_coupon").html("满" + _data_rem_coiling.list[$(this).index()].satisfy + "减" + _data_rem_coiling.list[$(this).index()].reduce);
     TOTAL_AMOUNT = changeTwoDecimal_f((ORI_AMOUNT - max_money), 2);
     $('#amount').text("￥" + TOTAL_AMOUNT);
   });
   var is_invoice = false;//是否开发票
   var coiling_id;//当前选择的发票
   var invoice = {
     invoice_type: 1,
     rise: 1  
   };
   /*发票类型选择*/
   $(".invoice-choose .kind .li").on("click", function(){
     $(this).addClass('active').siblings().removeClass('active');
     invoice.invoice_type = $(this).index() + 1;
   });
   /*个人和公司选择*/
   $(".invoice-choose .invoice .li").on("click", function(){
     $(this).addClass('active').siblings().removeClass('active');
     invoice.rise = $(this).index() + 1;
     if ($(this).index() == 1) {
       $(".invoice-choose .invoice .company-infomation").show();
       $(".invoice-choose .invoice .person-infomation").hide();
     } else {
       $(".invoice-choose .invoice .company-infomation").hide();
       $(".invoice-choose .invoice .person-infomation").show();
     }
   });
   /*是否开发票选择*/
   $(".invoice-choose .content .li").on("click", function(){
     $(this).addClass('active').siblings().removeClass('active');
     if ($(this).index() == 1) {
       $(".invoice-choose-mask .invoice").slideDown(200);   
       is_invoice = true;
     } else {
       $(".invoice-choose-mask .invoice").slideUp(200); 
       is_invoice = false;
     }
   });
   /*发票确认*/
   $("#invoice-submite").on("click", function(){
     if (!is_invoice) {
       $(".invoice-choose-mask").fadeOut(200, function(){
         $(this).removeClass("on");   
         $("#invoice-kind").html($(".invoice-choose .content div.active").html());
       })   
     } else if (invoice.rise == 1) {
        invoice.phone = $(".invoice .person-infomation input").val();
        if (!invoice.phone) {
          showModal("请填写收票人手机号");
        } else if (!REG_PHONE.test(invoice.phone)) {
          showModal("请填写符合规范的收票人手机号");  
        } else {
          if (invoice.company) {
            delete invoice.company
          }  
          if (invoice.pay_taxes_code) {
            delete invoice.pay_taxes_code
          }
          $(".invoice-choose-mask").fadeOut(200, function(){
            $(this).removeClass("on");   
          })
          $("#invoice-kind").html($(".invoice-choose .details div.active").html());
        }
     } else if (invoice.rise == 2){
       invoice.company = $(".company-infomation input.company").val();
       invoice.pay_taxes_code = $(".company-infomation input.recognition").val();
       if (!invoice.company) {
         showModal("请填写公司名称");
       } else if (!invoice.pay_taxes_code) {
         showModal("请填写纳税人识别号");
       } else {
         if (invoice.phone) {
            delete invoice.phone
          } 
         $(".invoice-choose-mask").fadeOut(200, function(){
           $(this).removeClass("on");   
           $("#invoice-kind").html($(".invoice-choose .details div.active").html());
         })
       }
     }
   })
   //关闭发票弹窗
   $('.close-invoice-choose').on('click', function() {
     if (is_invoice) {
       confirmModal("确认关闭", "关闭当前修改将不会保存", "取消", "确定", function(res){
         if (res) {
           $(".invoice-choose-mask").fadeOut(200, function(){
             $(this).removeClass("on");   
           })
         } 
       })
     } else {
        $(".invoice-choose-mask").fadeOut(200, function(){
          $(this).removeClass("on");   
        })
     }
     
   });
   // 打开发票弹窗
   $('#invoice-kind').on('click', function() {
     if (!underLineOrderId) { 
       $(".invoice-choose-mask").fadeIn(200, function(){
         $(this).addClass("on");   
       })
     }
   });
    
/*});*/

// 获取默认收货地址
function getAddress() {
    var _url = SERVICE + 'api/Shop/show_address';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
    }
    $.get(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
            ADDRESS = JSON.parse(res).collect_address;
            $(".user-info span.name").html(ADDRESS.collect_name);
            $(".user-info span.phone").html(ADDRESS.collect_phone);
            $(".user-info span.addressBox").html(ADDRESS.province + ADDRESS.city + ADDRESS.area + ADDRESS.address);
        } else {
            $('.no-adress').show();
            sessionStorage.setItem("url_login", "../../crat-order.html?id=" + IDS + "&price=" + ORI_AMOUNT);
            $('.user-info').hide();
        }
    })
}

// 获取书包数据
var ORI_AMOUNT = 0;
var TOTAL_AMOUNT = 0;
function getBagData() {
  if (underLineOrderId) {
    var _url = SERVICE + 'api/Order/get_under_line_order';
    var _data = {
        submit: TOKENMD5,
        openid: OPENID,
        order_id: underLineOrderId
    }
    var _data_tem = {};
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.coiling.satisfy) {
        $("#select_coupon").html('满' + res.coiling.satisfy + '减' + res.coiling.reduce);
      } else {
        $("#select_coupon").html('无');
      }
      _data_tem.list = res.order_detail
      var tem_html = template("tem_crat_order", _data_tem);
      var _order_amount = 0;
      for (var k in _data_tem.list) {
        _order_amount += (parseInt(_data_tem.list[k].num) * parseFloat(_data_tem.list[k].book_price));
      }
      TOTAL_AMOUNT = _order_amount - (res.coiling.reduce ? res.coiling.reduce : 0);
      $('#amount').text("￥" + TOTAL_AMOUNT);
      $("#crat-commodity").html(tem_html);
      $('#book-num').html(_data_tem.list.length);
    });     
  } else {
    var _url = SERVICE + 'api/Shop/showCartList';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        type: 1
    }
    $.get(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
            console.log(JSON.parse(res));
            var list = JSON.parse(res).list;
            var arr = [];
            for (k in IDS) {
              for (x in list) {
                if (IDS[k] == list[x].id) {
                  list[x].new_price = changeTwoDecimal_f(list[x].new_price, 2);
                  TOTAL_AMOUNT += parseFloat(list[x].new_price) * parseInt(list[x].num);
                  arr.push(list[x]);
                }
              }
            }
            var _data = {
                list: arr
            }
            var tem_html = template("tem_crat_order", _data);
            ORI_AMOUNT = TOTAL_AMOUNT;
            $('#amount').text("￥" + TOTAL_AMOUNT);
            $("#crat-commodity").html(tem_html);
            $('#book-num').html(_data.list.length);
            coiling_list();
        } else {
          showToast("暂无有效订单", 1500, function(){
            window.location.href = './book-city/index.html';
          });
        }
    })
  }
}
/*关于完成支付弹窗*/
$(".payment_success_box .btns img").on("click", function(){
  $('.payment_success').fadeOut(200, function(){
    window.location.href="./order-status.html?index=4";
  });
});
/*提交订单*/ 
var IS_PAYMENT = false;//是否已经点击提交订单，防止多点
$("#place_order").on("click", function(){
  if (IS_PAYMENT) {return;}
  IS_PAYMENT = true;
  if (underLineOrderId) {
    order_weChat_payment(underLineOrderId);
    return;
  }
  var _shop_detail = [];
  var all_book = $("#crat-commodity .commodity-line");
  var _old_price = 0;
  for (var i = 0; i < all_book.length; i++) {
    _old_price += parseFloat($(all_book[i]).find(".commodity-price").data("originalprice")) * parseFloat($(all_book[i]).find(".commodity-price").data("num"));
    _shop_detail.push({
      book_name: $.trim($(all_book[i]).find(".commodity-name").html()),
      author: $.trim($(all_book[i]).find(".commodity-subname").html()),
      book_id: $.trim($(all_book[i]).data("id")),
      book_pic: $.trim($(all_book[i]).find("img").attr("src")),
      book_number: $.trim($(all_book[i]).find(".commodity-count").html()).slice(1),
      book_price: $.trim($(all_book[i]).find(".commodity-price").html()).slice(1),
      bar_code: $.trim($(all_book[i]).find(".commodity-code").html()).slice(1),
    });
  }  
  var _url = SERVICE + 'api/Order/shop_order';
  var _data = {
    submit: TOKENMD5,
    openid: OPENID,
    collect_name: $(".user-info span.name").html(),
    collect_phone: $(".user-info span.phone").html(),
    collect_address: $("#user-address").html(),
    old_price: _old_price,
    order_price: ORI_AMOUNT - max_money,
    shop_detail: JSON.stringify(_shop_detail),
    is_pay: 1,
    order_text: $(".commodity-info .message textarea").val(),
    re_coiling_id: coiling_id
  }
  if (is_invoice) {
    _data.invoice = JSON.stringify(invoice);
  }
  if (_data.collect_address) {
    $.post(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 405) {
        showToast(res.message, 1500);
      } else {
        order_weChat_payment(res.orderid);
      }
    })  
  } else {
    showToast("请先设置收货地址~", 1500);
  }
});
/*提交订单成功后进行微信支付*/
function order_weChat_payment(orderid){
  var _url = SERVICE + 'api/Pay/pay';
  var _data = {
    submit: TOKENMD5,
    openid: OPENID,
    order_prise: TOTAL_AMOUNT,
    body: "订单id为[" + orderid + "]书籍商品购买。",
    orderid: orderid
  }
  $.post(_url, _data, function(res){
    res = JSON.parse(res);
    if (res.status == 200) { 
      var data = res.data;
      /*后台返回调取微信支付接口所需相关参数*/ 
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
          $(".payment_success").fadeIn(200, function(){
            $(".payment_success").addClass("on");
          })   
          //addCard();//-->调用微信发送卡券方法
        } else {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
          IS_PAYMENT = false; 
          showToast("支付失败", 1500);
        }  
      });
    }
});