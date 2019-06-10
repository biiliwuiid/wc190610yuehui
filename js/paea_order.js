$(function() {
FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
/**********公共配置部分**********/
var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
var TOKENMD5 = hex_md5("SkZUAroT");
var OPENID = JSON.parse(localStorage.getItem("openid")).openid;
/**********公共方法部分**********/
function showToast(text, time, callback){//提示框
    var _str = '<div id="showModal">'+ 
                  '<div class="showModal_box">'+text+'</div>'+  
                '</div>';
    if (!$("#showModal").html()){
      $("body").append(_str);setTimeout(function(){$("#showModal").fadeOut(300,function(){$("#showModal").remove();if(callback){callback();}});}, time)}            
}
/*从地址栏获参index*/
function getId() {
    var ids;
    var url = window.location.search;
    var Request = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            Request[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
        }
    }
    ids = Request["index"];
    return ids;
}
/**********功能开发部分**********/
var PAGE = 1;
var BOOKSTATUS = 2;
var PAGE = 1;
var ORDERARRY = [];
var COPYPAGE = 0;
var END = false;
var ONCE = true;
var ADDRESS = {};
var RESERVETIME = '';
var ACTIVETAB = '';
var CURRENT;
var DOM;
var INDEX; // 当前tab
var ISLOADING = true;
var SCORE; //当前评分 

datePicker({
    appointDays: 7, //默认可以预约未来7天
    preTime: 20, //默认只能预约10分钟之后,如果两个小时就填120
    disMinute: 1, //分钟的间隔，默认一分钟
    confirmTime: function(year, month, day, hour, minute, timeStamp, timeStr) {
        console.log(year, month, day, hour, minute, timeStamp, timeStr)
    }
});

// document.getElementById('mf-picker').style.display="none";

$.get("./template/template_order.html", function(res){
    $("body").append(res);
    setTab();
    var index = getId();
    INDEX = index;
    if (index == 0) {
        BOOKSTATUS = 2;
        DOM = 'wait-Sign';
        ACTIVETAB = 'data-none-1-no-more';
        renderOrders();
    } else if (index == 1) {
        BOOKSTATUS = 4
        DOM = 'wait-return';
        ACTIVETAB = 'data-none-2-no-more';
        renderOrders();
    } else if (index == 2) {
        DOM = 'has-return';
        ACTIVETAB = 'data-none-3-no-more';
        BOOKSTATUS = 5
        renderOrders();
    } else if (index == 3) {
        renderHistory()
        ACTIVETAB = 'data-none-4-no-more';
        DOM = 'history-dom'
    } else if (index == 4) {
        ACTIVETAB = 'data-none-5-no-more';
        DOM = 'buy-order'
        renderBuy();
    }
    scroll();
    
});

    //    归还弹窗
    $('.reseve').on('click',function () {
        $('.revert').show();
    })
    $('.quxiao').on('click',function () {
        $('.revert').hide();
    })
    /*$('.body').height($('body').height());*/

    // 签收
    $(document).on('click', '#wait-sure', function() {
        var _self = $(this);
        confirmModal("确认签收", "您确认已收到该订单商品并要签收该订单？", "取消", "确定", function(res){
            if(res) {
                var order = _self.attr('data-order-no');
                var orderId = _self.attr('data-order-id');
                var domId = _self.attr('data-parent-id');
                var _url = SERVICE + 'api/Order/set_borrow_finish';
                var _opt = {
                    submit: TOKENMD5,
                    orderid: orderId,
                    openid: OPENID,
                    order_no: order,
                }
                $.post(_url, _opt, function(res){
                    if (JSON.parse(res).status === 200) {
                        showToast('签收成功', 1500);
                        $('#' + domId).remove();
                        for (var i = 0; i < ORDERARRY.length; i++) {
                            if (ORDERARRY[i].order_no === order) {
                                ORDERARRY.splice(i, 1);
                            }
                        }
                        if (ORDERARRY.length === 0) {
                            $('.data-none-1').show();
                        }
                    } else {
                        showToast(JSON.parse(res).message, 1500);
                    }
                })
            }
        });
    });

    // 归还
    $(document).on('click', '#set-back', function() {
        if ($(this).attr('class') == 'done') return;
        getAddress($(this));
        
    });
    // 选择归还时间
    $(document).on('click', '#time-back', function() {
        
        document.getElementById('mf-picker').style.top="0";
        CURRENT = $(this);
        
    });
    document.querySelector('.confirm').addEventListener('touchend', function() {
        document.getElementById('mf-picker').style.top="100%";
        RESERVETIME = localStorage.yhTime;
        CURRENT.text(RESERVETIME);
    }, false)

    // 确认预约

    $(document).on('click', '#sure-back', function() {
        if (RESERVETIME === '') {
            showToast('请先选择上门取件时间', 1500);
            return;
        };
        var order = $(this).attr('data-order-no');
        var orderId = $(this).attr('data-order-id');
        var _url = SERVICE + 'api/Order/reserve_book';
        var _opt = {
            submit: TOKENMD5,
            orderid: orderId,
            openid: OPENID,
            order_no: order,
            collect_address: ADDRESS.province  + ADDRESS.city + ADDRESS.area + ADDRESS.address,
            collect_name: ADDRESS.collect_name,
            collect_phone: ADDRESS.collect_phone,
            reserve_time: RESERVETIME,
        }
        $.post(_url, _opt, function(res){
            if (JSON.parse(res).status === 200) {
                $('#order' + order).remove();
                $('#set-back').addClass('done').text('归还中');
                RESERVETIME = '';
                for (var i = 0; i < ORDERARRY.length; i++) {
                    if (ORDERARRY[i].order_no === order) {
                        ORDERARRY.splice(i, 1);
                    }
                }
                if (ORDERARRY.length === 0) {
                    $('.data-none-2').show();
                }
                showToast('预约归还成功', 1500);
            } else {
                showToast(JSON.parse(res).message, 1500);
            }
        })
    });

    $(document).on('click', '#cancel-back', function() {
        var domId = $(this).attr('data-parent-id');
        var timeId = $('#' + domId).children('.infomation')
        $(timeId).hide(300);
        $(this).hide();
        $(this).next().hide();
        $(this).prev().show();
    });
    // tab切换
    $(document).on('click', '#am-tabs-pos li', function() {
        // tab切换时根据当前tab页的内容决定是否出现滚动条
        setTimeout(function() {
            $('.order-tab').css('overflow-y','hidden');
            var bHeight = $('.order-tab').height();
            var tHeight = $('.am-in').height();
            if (tHeight > bHeight) {
                $('.order-tab').css('overflow-y','scroll');
            } else {
                $('.order-tab').css('overflow-y','hidden');
            }
            RESERVETIME = '';
        },500)
        var index = $(this).attr('data-index');
        INDEX = index;
        PAGE = 1;
        ONCE = true;
        END = false;
        COPYPAGE = 0;
        ORDERARRY = [];
        ISLOADING = false;
        setTimeout(function() {
            ISLOADING = true;
        },800);
        $('.order-tab').scrollTop(0);
        if (index == 0) {
            BOOKSTATUS = 2;
            DOM = 'wait-Sign';
            ACTIVETAB = 'data-none-1-no-more';
            renderOrders();
        } else if (index == 1) {
            BOOKSTATUS = 4
            DOM = 'wait-return';
            ACTIVETAB = 'data-none-2-no-more';
            renderOrders();
        } else if (index == 2) {
            DOM = 'has-return';
            ACTIVETAB = 'data-none-3-no-more';
            BOOKSTATUS = 5
            renderOrders();
        } else if (index == 3) {
            ACTIVETAB = 'data-none-4-no-more';
            DOM = 'history-dom'
            renderHistory();
        } else if (index == 4) {
            ACTIVETAB = 'data-none-5-no-more';
            DOM = 'buy-order'
            renderBuy();
        }
        scroll();
    });
    
    // 购买-确认收货
    $(document).on('click', '#buy-sure', function() {
        var _self = $(this);
        confirmModal("确认签收", "您确认已收到该订单商品并要签收该订单？", "取消", "确定", function(res){
            if(res) {
                var id = _self.data('order-id');
                var order_no = _self.attr('data-order-no');
                var _url = SERVICE + 'api/Order/set_pay_finish';
                var _opt = {
                    submit: TOKENMD5,
                    orderid: id,
                    openid: OPENID,
                    order_no: order_no,
                }
                $.post(_url, _opt, function(res){
                    if (JSON.parse(res).status === 200) {
                        _self.addClass('evaluate').removeAttr("id").text('评价');
                        showToast('收货成功', 1500);
                    } else {
                        showToast(JSON.parse(res).message, 1500);
                    }
                });
            }
        })
        
    });

    // 点击评价
    $(document).on('click', '.evaluate', function() {
        SCORE = $(this).attr('data-id');
        var html = '<div class="score-model">'+
            '<div class="score-body">'+
                '<div class="score-content">'+
                    '<div class="title">评分</div>'+
                    '<div class="star">'+
                        '<select id="star" name="rating" autocomplete="off">'+
                            '<option value="1"></option>'+
                            '<option value="2"></option>'+
                            '<option value="3"></option>'+
                            '<option value="4"></option>'+
                            '<option value="5"></option>'+
                        '</select>'+
                    '</div>'+
                '</div>'+
                '<div class="score-buttom">'+
                    '<img src="./images/ourselfs/time-sure.png" alt="" id="star-sure">'+
                '</div>'+
            '</div>'+
        '</div>';
        $('body').append(html);
        $('#star').barrating({
            theme: 'fontawesome-stars',
        });
        $('#star').barrating('set', 5);
        $(document).on("click", '.score-model', function(){
          $(this).remove();    
        })
        $(".score-model .score-body").on("click", function(e){e.preventDefault();});
    });

    
    // 点击提交评分
    $(document).on('click', '#star-sure', function() {
        var scores = $('.br-current').attr('data-rating-value');
        var _url = SERVICE + 'api/Info/add_score';
        var _opt = {
            submit: TOKENMD5,
            score: scores,
            order_id: SCORE,
        }
        $.post(_url, _opt, function(res){
            showToast(JSON.parse(res).message, 1500);
            $('.score-model').remove();
            ORDERARRY = [];
            PAGE = 1;
            if (INDEX == '3') {
                $("#history-dom").empty();
                renderHistory();
            } else {
                $("#buy-order").empty();
                renderBuy();
            }
        
        })
    });

function setTab() {
    var ids = getId();
    var _tabDom = $('.am-tabs-nav li');
    _tabDom.each(function(i,e) {
        if ($(e).attr('data-index') == ids) {
            $(e).addClass('am-active').siblings('li').removeClass('am-active');
        }
    })
    var _panelDom =  $('.am-tabs-bd .am-tab-panel');
    _panelDom.each(function(i,e) {
        if ($(e).attr('data-index') == ids) {
            $(e).addClass('am-active').siblings('.am-tab-panel').removeClass('am-active');
        }
    })
}
function scroll() {
    $(window).scroll(function(){
    　　 var $currentWindow = $(window);
        //当前窗口的高度
        var windowHeight = $currentWindow.height();
        //当前滚动条从上往下滚动的距离
        var scrollTop = $(this).scrollTop();
        //当前文档的高度
        var docHeight = $('#' + DOM).height();
        if (scrollTop >= docHeight - windowHeight && ISLOADING) {
            if(!END && ONCE) {
                PAGE++
                ONCE = false;
                $('.' + ACTIVETAB).show();
                if (DOM === 'history-dom') {
                    setTimeout(function() {
                        renderHistory();
                    },300)
                } else if (DOM === 'buy-order') {
                    setTimeout(function() {
                        renderBuy();
                    },300)
                } else {
                    setTimeout(function() {
                        renderOrders();
                    },300)
                }
            }
        }
    });
}

function renderOrders() {
    if (COPYPAGE === PAGE) return;
    var _url = SERVICE + 'api/Order/get_stay_sign';
    var _opt = {
        submit: TOKENMD5,
        page_rows: PAGE,
        openid: OPENID,
        book_status: BOOKSTATUS,
    }
    $.post(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
            COPYPAGE = PAGE;
            ONCE = true;
            ORDERARRY = ORDERARRY.concat(JSON.parse(res).stay_order);
            var _data = {
                list: ORDERARRY,
                type: BOOKSTATUS
            }
            if (BOOKSTATUS == 2) {
                var tem_html = template("tem_order", _data);
                $("#wait-Sign").html(tem_html);
                $('.data-none-1').hide();
            } else if (BOOKSTATUS == 4) {
                var tem_html = template("tem_order", _data);
                $("#wait-return").html(tem_html);
                $('.data-none-2').hide();
            } else if (BOOKSTATUS == 5) {
                var tem_html = template("tem_order", _data);
                $("#has-return").html(tem_html);
                $('.data-none-3').hide();
            }
        } else {
            END = true;
            $('.' + ACTIVETAB).text('没有更多了');
        }
    })
}
// 获取默认地址
function getAddress(dom) {
    var domId = dom.attr('data-parent-id');
    $('.order-tab').css('overflow-y','scroll');
    var timeId = $('#' + domId).children('.infomation');
    var id = dom.data('order-id');
    var _url = SERVICE + 'api/Shop/show_address';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
    }
    $.post(_url, _opt, function(res){
        var data = JSON.parse(res);
        if (data.status === 200) {
            ADDRESS = data.collect_address;
            $('#people' + id).text('收货人：' + data.collect_address.collect_name);
            $('#phone' + id).text(data.collect_address.collect_phone);
            $('#address' + id).text('收货地址：' + data.collect_address.province  + data.collect_address.city + data.collect_address.area + data.collect_address.address);
            $(timeId).children('.set-time').show();
            $(timeId).children('.details').show();
            $(timeId).children('.set-address').hide();
            $(timeId).show(300);
            dom.hide().siblings().show();
        } else {
            $(timeId).children('.set-time').hide();
            $(timeId).children('.details').hide();
            $(timeId).children('.set-address').show();
            $(timeId).show(300);
            dom.hide().siblings().show();
            sessionStorage.setItem("url_login", '../../order-status.html?index=1');
        }
    })
}


function renderHistoryData() {
    var _url = SERVICE + 'api/Order/get_history_sign';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        page_rows: PAGE,
    }
    $.post(_url, _opt, function(res){
        var data = JSON.parse(res);
        if (data.status === 200) {
            $('#order-num').text(data.order_finish.total_book_number);
            $('#order-price').text('￥' +　data.order_finish.total_book_money);
            COPYPAGE = PAGE;
            ONCE = true;
            ORDERARRY = ORDERARRY.concat(JSON.parse(res).stay_order)
            var _data = {
                list: ORDERARRY
            }
            var tem_html = template("tem_order_history", _data);
            $("#history-dom").html(tem_html);
            $('.data-none-4').hide();
        } else {
            END = true;
            $('.' + ACTIVETAB).text('没有更多了');    
        }
    });
}
// 借阅历史
function renderHistory() {
    var _url = SERVICE + 'api/Info/is_my_vip';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
    }
    $.post(_url, _opt, function(res){
        var data = JSON.parse(res);
        if (data.status === 200) {
            if (data.vip.vip_grade === 1) {
                $('#vip-xst').show();
            } else if (data.vip.vip_grade === 2){
                $('#vip-xxc').show();
            } else if (data.vip.vip_grade === 3) {
                $('#vip-xzy').show();
            }
            renderHistoryData();
        } else {
            $('#vip-no').show();
            END = true;
            $('.' + ACTIVETAB).text('');    
        }
    });
    
    
}

// 已购买
function renderBuy() {
    var _url = SERVICE + 'api/Order/pay_order_detail';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        page_rows: PAGE,
    }
    $.post(_url, _opt, function(res){
        var data = JSON.parse(res);
        if (data.status === 200) {
            COPYPAGE = PAGE;
            ONCE = true;
            ORDERARRY = ORDERARRY.concat(JSON.parse(res).pay_order);
            var _data = {
                list: ORDERARRY
            }
            var tem_html = template("tem_buy", _data);
            $("#buy-order").html(tem_html);
            $('.data-none-5').hide();
        } else {
            END = true;
            $('.' + ACTIVETAB).text('没有更多了');
        }
    });
}
/*查看物流信息*/
function getkdn(expCode, expNo){  
  var _url = SERVICE + 'api/Traffic/get_traffic';
  var _data = {
    submit: TOKENMD5,
    no: expNo,
    type: expCode
  }
  $.get(_url, _data, function(res){
    var _data_tem = {};
    res = JSON.parse(res);
    _data_tem.list = res.list;
    for (var k in _data_tem.list) {
      _data_tem.list[k].date =  _data_tem.list[k].time.split(" ")[0].slice(_data_tem.list[k].time.split(" ")[0].indexOf("-") + 1);      
      _data_tem.list[k].times =  _data_tem.list[k].time.split(" ")[1].slice(0, 5);  
      if (_data_tem.list[k].content.indexOf("揽收") != -1 || _data_tem.list[k].content.indexOf("已收件") != -1 || _data_tem.list[k].content.indexOf("收取") != -1)  {
        _data_tem.list[k].status = 0;   
      } else if (_data_tem.list[k].content.indexOf("离开") != -1 || _data_tem.list[k].content.indexOf("发往") != -1 || _data_tem.list[k].content.indexOf("到达") != -1){
        _data_tem.list[k].status = 1;
      } else if (_data_tem.list[k].content.indexOf("派件") != -1 || _data_tem.list[k].content.indexOf("派送") != -1) {
        _data_tem.list[k].status = 2;   
      }
       else if ((_data_tem.list[k].content.indexOf("代收") != -1 || _data_tem.list[k].content.indexOf("代签收") != -1) && _data_tem.list[k].content.indexOf("已签收") == -1) {
        _data_tem.list[k].status = 3;   
      } else if (_data_tem.list[k].content.indexOf("已签收") != -1 || _data_tem.list[k].content.indexOf("签收人") != -1){
        _data_tem.list[k].status = 4;
      }
    }
    console.log(_data_tem.list);
    if (res.code == "OK") {
      $("#logistics ul .li_title .name").html(res.name);  
      $("#logistics ul .li_title .code").html(res.no);  
      $("#logistics ul").append(template("logistics_list", _data_tem));
    } else {
      $("#logistics ul").append('<li class="no_list">暂未查询到该物流的相关信息~</li>');
    }  
    isGetkdn = false;
    $("#logistics .back").on("click", function(){
      $("#logistics").removeClass("on");      
      $("#logistics ul .li_title span").html('');  
      $("#logistics ul li:first-child~li").remove();
    });
  })
}
var isGetkdn = false;
$("body").delegate(".to-be-paid .top-nav>span", "click", function(){
  var expCode = $(this).data("express").split(",")[0];    
  var expNo = $(this).data("express").split(",")[1];    
  $("#logistics").addClass("on");
  if (isGetkdn) {return;}
  isGetkdn = true;
  getkdn(expCode, expNo);
});
});

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