$(function() {
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
    /*确认框*/
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
    /*加入购物车特效*/
    function add_to_cart(_this, _target, duration){
      var _pw = window.innerWidth;  
      var _width = $(_this).width();
      var _height = $(_this).height();
      var _fixed_l = $(_this).offset().left;
      var _fixed_t = $(_this).offset().top - $(window).scrollTop();
      var _target_l = $(_target).offset().left;
      var _target_t = $(_target).offset().top - $(window).scrollTop();
      console.log(_target_l);    
      console.log(_target_t); 
      $("body").append('<div class="_flight"></div>');
      $("._flight").css({width:_width + 'px', height:_height + 'px',borderRadius: '50%',background: '#ff6c00',position: 'fixed',left: _fixed_l + 'px', top: _fixed_t + 'px',zIndex: 99}).animate({left: [_target_l + _width, 'linear'], top: [_target_t, 'easeInBack']}, duration, function(){$(_target).addClass("animated jello");var _self = $(this);setTimeout(function(){$(_target).removeClass("animated jello");_self.remove();}, duration);});
    }
    /**********功能开发部分**********/
    var PAGE = 1;
    var CHECKED = 'bag';
    var BAGID = [];
    var CRATID = [];
    var CRATPRICE = 0;
    $.get("./template/template_shopping.html", function(res){
        $("body").append(res);
        getGuessData(PAGE);
        if (GetQueryString("page")) {
          $(".shopping .tab .cat").trigger("click");
        } else {   
          getBagData();
        }
    });
    $('#bag-total-infomation').hide();
    $('#crat-total').hide(); 
    //切换书包或购物车
    $(".shopping .tab div").on("click", function(){
        $(".not_shopp").hide(); 
        $(".checkbox").removeClass("selected");
        $(this).addClass("active").siblings().removeClass("active");  
        if ($(this).index() == 1) {
            CHECKED = 'crat';
            $("#crat_commodity").show();
            $("#bag_commodity").hide();
            /*$('#crat-total').show();*/
            $('#bag-total').hide();
            $('#bag-total-infomation').hide();
            getCratData();
            $(this).parent().addClass("on");
        } else {
            CHECKED = 'bag';
            $("#crat_commodity").hide();
            $("#bag_commodity").show();
            $('#crat-total').hide();
            $('#bag-total').show();
            getBagData();
            $(this).parent().removeClass("on");
        }
        $("#totals").html("0.00");
    });
    // 商品增加
    $(document).on('click', '#add', function() {
        if (!$(this).parents(".commodity-line").hasClass("selected")) {
          $(this).parents(".commodity-line").find(".selectedBox").trigger("click");
        }
        add_to_cart(this, '#crat-order', 800);
        if (!$(this).parent(".controls").hasClass("on")) {
          $(this).parent(".controls").addClass("on");
        }
        var _id = $(this).attr('data-id');
        if (CHECKED === 'bag') {
            bagActe(_id, 'add');
        } else {
            cratActe(_id, 'add');
        }
    });
    // 商品减少
    $(document).on('click', '#cut', function() {
        var count = parseInt($(this).next().text());
        if (count <= 2) {
            $(this).parent(".controls").removeClass("on");
        }
        var _id = $(this).attr('data-id');
        if (CHECKED === 'bag') {
            bagActe(_id, 'dellist');
        } else {
            cratActe(_id, 'dellist');
        }
    });
    // 商品删除
    $(document).on('click', '.commodity-delete', function() {
        var _id = $(this).attr('data-id');
        confirmModal("确认删除", "您确定要删除该商品？", "取消", "确定", function(res){
            if(res) {
                if (CHECKED === 'bag') {
                    bagActe(_id, 'del');
                } else {
                    cratActe(_id, 'del');
                }
            }
        });
    });
    /*单独选择某本书籍*/
    $(document).on('click','.commodity .selectedBox', function() {
      $(this).parents(".commodity-line").toggleClass("selected");
      if (CHECKED === 'bag') {
        renderBagCount();
      } else {
        shopping_cart();
      }
    })
    // 菜单栏切换
    $('.meaun').on('click', '.meaun-tab', function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
    });
    // 购物车结算
    $('#crat-order').on('click', function() {
        CRATID = [];
        var _allSelected = $("#crat_commodity .commodity-line.selected");
        for (var i = 0; i < _allSelected.length; i++) {
          CRATID.push($(_allSelected[i]).data("id"));
        }  
        if(CRATID.length > 0) {
            window.location.href="crat-order.html?id=" + CRATID + '&price=' + $("#totals").html();
        } else {
            showToast('请先选择要购买的书籍', 1500)
        }
    });
    // 书包结算
    $('#bag-order').on('click', function() {
        BAGID = [];
        var _allSelected = $("#bag_commodity .commodity-line.selected");
        for (var i = 0; i < _allSelected.length; i++) {
          BAGID.push($(_allSelected[i]).data("id"));
        }  
        if(BAGID.length > 0 &&　BAGID.length <= 5) {
            window.location.href="bag-order.html?id=" + BAGID;
        } else if (BAGID.length > 5)　{
            showToast('借阅书籍最多为5本', 1500);
        }　else {
            showToast('请先选择要借阅的书籍', 1500);
        }
    });
    // 收藏、取消收藏
    $(document).on('click', '.love',function() {
      var _self = $(this);
      var _url = SERVICE + 'api/Index/add_book_mark';
      var _opt = {
          submit: TOKENMD5,
          openid: OPENID,
          book_id: _self.data('id'),
      };
      $.post(_url, _opt, function(res){
        if (_self.hasClass("marks")) {
          _self.removeClass("marks animated rubberBand");
        } else {
          _self.addClass("marks animated rubberBand");
        }
      });
    });
    // 换一换
    $('.guess-change').on('click', function() {
        PAGE++;
        getGuessData(PAGE);
    });
    $(document).on('click', '.guess-book', function() {
        var _bookId = $(this).attr('data-id');
        window.location.href="book-city/product-details.html?id=" + _bookId;
    });
// 获取购物车数据
function getCratData() {
    var _url = SERVICE + 'api/Shop/showCartList';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        type: 1,
    }
    $.post(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
            if (JSON.parse(res).list.length == 0) {
              $("#crat_commodity").html("");  
              $(".body_shopping").addClass("is_disabled");
              $('#crat-total').hide();
              $(".not_shopp").show();
              return;
            }
            var _data = {
                list: [],
                list_is_disabled: [],
                type: 'crat',
            };
            var _list = JSON.parse(res).list;
            for (k in _list) {
              if (_list[k].is_status == 1) {
                _list[k].new_price = changeTwoDecimal_f(_list[k].new_price, 2);
                _data.list.push(_list[k]);
                if (_list[k].stock_num > 0) {
                  _data.list_is_disabled.push(_list[k]);    
                }
              }    
            }
            if (_data.list_is_disabled.length <= 0) {
              $(".body_shopping").addClass("is_disabled");
            } else {
              $(".body_shopping").removeClass("is_disabled");  
            }
            if (_data.list.length != 0) {
              $("#totals").html("0.00");
              var tem_html = template("tem_commodity", _data);
              $("#crat_commodity").html(tem_html);
              $(".not_shopp").hide();    
              $('#crat-total').show();
              if (_data.list_is_disabled.length > 0) {
                $("#controls_box").show();
              } else {
                $("#controls_box").hide();
              }
            } else {
              $("#crat_commodity").html("");  
              $(".body_shopping").addClass("is_disabled");
              $(".not_shopp").show();  
            }
        } else {
            $("#crat_commodity").html("");
            $(".body_shopping").addClass("is_disabled");
            $('#crat-total').hide();
            $(".not_shopp").show();
        }
    })
}
// 获取书包数据
function getBagData() {
    var _url = SERVICE + 'api/Shop/showCartList';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        type: 2,
    }
    $.post(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
            var _data = {
                list: [],
                list_is_disabled: [],
                type: 'bag',
            };
            var _list = JSON.parse(res).list;
            for (k in _list) {
              if (_list[k].is_status == 1) {
                _data.list.push(_list[k]);
                if (_list[k].stock_num > 0) {
                  _data.list_is_disabled.push(_list[k]);    
                }
              }    
            }
            if (_data.list_is_disabled.length <= 0) {
              $(".body_shopping").addClass("is_disabled");
            } else {
              $(".body_shopping").removeClass("is_disabled");  
            }
            console.log(_data.list.length);
            if (_data.list.length != 0) {
              $('#bag-total-infomation span').eq(1).html(0);
              var tem_html = template("tem_commodity", _data);
              $("#bag_commodity").html(tem_html);
              $(".not_shopp").hide();
              if (_data.list_is_disabled.length > 0) {
                $("#controls_box").show();
              } else {
                $("#controls_box").hide();
              }
            } else {
              $("#bag_commodity").html("");
              $(".shopping .shopping-total").hide();
              $(".not_shopp").show();  
            }
        } else {
            $("#bag_commodity").html("");
            $(".shopping .shopping-total").hide();
            $(".not_shopp").show();
        }
    })
}
// 获取猜你喜欢信息
function getGuessData(page) {
    var _url = SERVICE + 'api/Index/guess_like';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        page_rows: page
      };
    $.get(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
            var _data = {
                list: JSON.parse(res).books,
            };
            var tem_html = template("tem_cart_guess", _data);
            $("#cart-guess").html(tem_html);
        } else {
            PAGE = 1;
            getGuessData(PAGE)
        }
    });
}
// 书包商品增加/减少/删除
function bagActe(id, type) {
    var _url = SERVICE + 'api/Shop/set_book_shoping';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        book_id: id,
        set_type: type,
    }
    $.get(_url, _opt, function(res){
        var _data = JSON.parse(res);
        if ( _data.status === 200) {
            var count = parseInt($('#bagCount'+id).text());
            if (type === 'add') {
                $('#bagCount'+id).text((count + 1).toString());
            } else if (type === 'dellist') {
                $('#bagCount'+id).text((count - 1).toString());
            } else if (type === 'del') {
                $('#bagCommodity'+id).remove();
                showToast('删除成功', 1500);
                getBagData();
            }
        } else {
            var message = '添加失败：' + _data.message;
            showToast(message, 1500);
        }
    })
}
// 购物车商品增加/减少/删除
function cratActe(id, type) {
    var _url = SERVICE + 'api/Shop/set_shoping';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        book_id: id,
        set_type: type,
    }
    $.get(_url, _opt, function(res){
        var _data = JSON.parse(res);
        if ( _data.status === 200) {
            var count = parseInt($('#cratCount'+id).text());
            if (type === 'add') {
                $('#cratCount'+id).text((count + 1).toString());
            } else if (type === 'dellist') {
                if ($('#cratCount'+id).html() == 1) {
                  return;    
                }
                $('#cratCount'+id).text((count - 1).toString());
            } else if (type === 'del') {
                showToast('删除成功', 1500,function(){
                  getCratData();
                });
            }
            shopping_cart();
        } else {
            var message = '添加失败：' + _data.message;
            showToast(message, 1500);
        }
    })
}
/*全选*/
$("#total_selection, #total_bagselection").on("click", function(){
  var _allList = $("#crat_commodity .commodity-line:not(.is_disabled),#bag_commodity .commodity-line:not(.is_disabled)");
  if ($(this).find(".checkbox").hasClass("selected")) {
    $(this).find(".checkbox").removeClass("selected");
    _allList.removeClass("selected");
  } else {
    $(this).find(".checkbox").addClass("selected");
    _allList.addClass("selected");
  }
  if (CHECKED === 'crat') {
      shopping_cart();
  } else if (CHECKED === 'bag') {
    renderBagCount();
  }
})
/*购物车--计算总价格*/
function shopping_cart(){
  var _allList = $("#crat_commodity .commodity-line.selected");
  var _total = 0;
  for (var i = 0; i < _allList.length; i++) {
    console.log($(_allList[i]).find("span.price").html());
    _total += (parseFloat($(_allList[i]).find("span.price").html()) * parseInt($(_allList[i]).find("span.numbers").html()));
  }
  $("#totals").html(changeTwoDecimal_f(_total, 2));
}
// 购物车checkbox

function cratCheck() {
    var checkedCount = 0;
    $(document).on('click', '.checkAllLabel', function() {
        var status = $(this).prev().is(':checked');
        var fruit=$('input[name="crat-commodity"]');
        checkedCount = $('input[name="crat-commodity"]').length;
        if (status) {
            fruit.each(function() {
                $(this).attr('checked', false);
                //$('#crat-total-infomation').hide();
            });
        } else {
            fruit.each(function() {
                $(this).attr('checked', true);
            });
        }
        renderCratPrice();
    }); 
}

// 计算书包已选书的本数
function renderBagCount() {
    var _allList = $("#bag_commodity .commodity-line.selected");
    if (_allList.length <= 0) {
        $('#bag-total-infomation').hide();
    } else {
        $('#bag-total-infomation').show();
        $('#bag-total-infomation span').eq(1).html(_allList.length);
    }
}
});