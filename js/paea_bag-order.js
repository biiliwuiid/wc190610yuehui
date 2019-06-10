$(function(){
    FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
    /**********公共配置部分**********/
    var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
    var TOKENMD5 = hex_md5("SkZUAroT");
    var OPENID = JSON.parse(localStorage.getItem("openid")).openid;
    /**********公共方法部分**********/
    function GetQueryString(opt) {
        var reg = new RegExp("(^|&)"+ opt +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }
    function showToast(text, time, callback){//提示框
        var _str = '<div id="showModal">'+ 
                      '<div class="showModal_box">'+text+'</div>'+  
                    '</div>';
        if (!$("#showModal").html()){
          $("body").append(_str);setTimeout(function(){$("#showModal").fadeOut(300,function(){$("#showModal").remove();if(callback){callback();}});}, time)}            
    }
    /**********功能开发部分**********/
    var BOOKSARRY = [];
    var ADDRESS = {};
    var IDS;
    $.get("./template/template_bag_order.html", function(res){
        $("body").append(res);
        getBookInfomation();
        getAddress();
    });
    var url = SERVICE + 'api/Info/is_my_vip';
    var IDS = GetQueryString('id').split(',');
    var books = IDS.length;
    $('.book-total').text(books);
    var opt = {
        submit: TOKENMD5,
        openid: OPENID,
    }
    $.post(url, opt, function(res){
        res = JSON.parse(res);
        if (res.status === 200) {
          var _url = SERVICE + 'api/Info/is_info_return';
          var _opt = {
              submit: TOKENMD5,
              openid: OPENID,
          }
          $.post(_url, _opt, function(res){
             res = JSON.parse(res);
             if (res.status == 404) {
               $(".submit_box ._one").show();
             }else if (res.status == 200) {
               $(".submit_box ._three").show();
             }
          });
        } else if (res.status === 404) {
          $(".submit_box ._two").show();
          sessionStorage.setItem("url_login", "../../bag-order.html?id=" + GetQueryString("id"));
        }
        // 提交订单
        $(document).on('click', '#bag-pay', function() {
            var is_ningboshi = $('#user-address').text().indexOf("浙江省宁波市");
            if (ADDRESS.collect_name && is_ningboshi != -1) {
                var _url = SERVICE + 'api/Order/shop_order';
                var arr = [];
                $.each(BOOKSARRY, function(index, item) {
                    var obj = {};
                    obj.book_name = item.book_name;
                    obj.book_id = item.id;
                    obj.book_pic = item.book_pic;
                    obj.book_number = 1;
                    obj.book_price = item.price;
                    obj.bar_code = item.bar_code;
                    arr.push(obj);
                });
                var _opt = {
                    submit: TOKENMD5,
                    openid: OPENID,
                    collect_name: ADDRESS.collect_name,
                    collect_phone: ADDRESS.collect_phone,
                    collect_address: $('#user-address').text(),
                    shop_detail: JSON.stringify(arr),
                    is_pay: 2,
                    order_text: $(".order-details .commodity-info .message textarea").val()
                }
                $.post(_url, _opt, function(res){
                    if (JSON.parse(res).status === 200) {
                        showToast('提交成功！', 1500, function() {
                           window.location.href = './book-city/index.html';                
                        });
                    } else {
                        showToast(JSON.parse(res).message, 1500);
                    }
                });
            } else if (!ADDRESS.collect_name){
                showToast('请先设置收货地址', 1500);
            } else {
                showToast('默认收货地址必须在浙江省宁波市内', 1500);
            }
            
        });
    });

    // 获取默认收货地址
    function getAddress() {
        var _url = SERVICE + 'api/Shop/show_address';
        var _opt = {
            submit: TOKENMD5,
            openid: OPENID,
        }
        $.post(_url, _opt, function(res){
            if (JSON.parse(res).status === 200) {
                ADDRESS = JSON.parse(res).collect_address;
                var _data = {
                    list: [JSON.parse(res).collect_address]
                 }
                var tem_html = template("tem_order_adress", _data);
                $("#user-info").html(tem_html);
                var _address = $("#user-address").html();
            } else {
                $('.no-adress').show();
                sessionStorage.setItem("url_login", "../../bag-order.html?id=" + IDS);
                $('#user-info').hide();
            }
        })
    }

    // 获取书本信息
    function getBookInfomation() {
        // 获取购物车数据
    var _url = SERVICE + 'api/Shop/showCartList';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        type: 2,
    }
    $.post(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
          var _allList = JSON.parse(res).list;
          IDS = GetQueryString('id').split(',');
          var _data = {list:[]}
          for (var m in IDS) {
            for (var n in _allList) {
              if (IDS[m] == _allList[n].id) {
                _data.list.push(_allList[n]);    
              }      
            }
          }
          BOOKSARRY = _data.list;
          if (_data.list.length < 5) {
            $(".order-details .commodity-add").show().find(".book-count").html(5 - _data.list.length); 
          }
          $("#bag-books").html(template("tem_bag_order", _data));
        }
    })
    }
})