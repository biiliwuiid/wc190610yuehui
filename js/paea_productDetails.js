$(function() {
    FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
    /**********公共配置部分**********/
    var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
    var TOKENMD5 = hex_md5("SkZUAroT");
    var OPENID = JSON.parse(localStorage.getItem("openid")).openid;
    /**********公共方法部分**********/
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
    /*图片自适应宽高*/
    function autowidthheight(elements) {
      $(elements).each(function(index,ele){
        if ( ele.width / ele.height < 1) {
          $(ele).css({"width": "auto","height": "100%"});
        }
      })
    }
    /**********功能开发部分**********/
    var LOADING = true;
    var PAGE = 1;
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
          } else {
            _isVip = false;
          }
        } 
      }); 
      return _isVip;
    }
    function is_vip_price() {//判断是否为会员价
      if (isVip()) {
        $(".vip_pirce>button").show();
      }
    }
    $.get("../template/template_guess.html", function(res){
        $("body").append(res);
        getGuessData(PAGE);
    });
    $.get("../template/template_bookDetails.html", function(res){
        $("body").append(res);
        getBookDetails(GetQueryString('id'));
    });
    changeGuess();
    //评分 
    var grade=$('.num_grade').text();
    if(grade>0&grade<=2){
       $(".th1").addClass("str1").removeClass('str2')
    }else if(grade>2&grade<=4){
        $(".th1,.th2").addClass("str1").removeClass("str2")
    } else if(grade>4&grade<=6){
        $(".th1,.th2,.th3").addClass("str1").removeClass("str2")
    }else if(grade>6&grade<=9){
        $(".th1,.th2,.th3,.th4").addClass("str1").removeClass("str2")
    }else{
        $(".th1,.th2,.th3,.th4,.th5").addClass("str1").removeClass("str2")
    }
    //    点击收藏
    $('.ba1').on('click',function () {
        var _self = $(this);
        var _url = SERVICE + 'api/Index/add_book_mark';
        var _opt = {
            submit: TOKENMD5,
            openid: OPENID,
            book_id: GetQueryString('id'),
        };
        $.post(_url, _opt, function(res){
          if (_self.hasClass("ba3")) {
            _self.removeClass("ba3 animated rubberBand");
          } else {
            _self.addClass("ba3 animated rubberBand");
          }
        });
    });

    $('.guess-book').on('click', function() {
        var _bookId = $(this).attr('data-id');
        window.location.href="product-details.html?id=" + _bookId;
    });

    // 加入购物车
    $('.db_jr_btn').on('click', '.jr_gwc', function() {
        addToCart(GetQueryString('id'));
    });

    // 加入书包
    $('.db_jr_btn').on('click', '.jr_bag', function() {
        addToBag(GetQueryString('id'));
    });

// 获取书城首页信息
function getGuessData(page) {
    if (!LOADING) return;
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
            var tem_html = template("tem_guess", _data);
            $("#guess").html(tem_html);
        } else {
            PAGE = 1;
            getGuessData(1);
        }
        
    });
}
// 换一换
function changeGuess() {
    $('#change').on('click', function() {
        PAGE++;
        getGuessData(PAGE);
    })
}
// 书籍详情
function getBookDetails(id) {
    var _url = SERVICE + 'api/Index/book_detail';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        book_id: id,
      };
    $.get(_url, _opt, function(res){
        if (JSON.parse(res).status === 200) {
            if (JSON.parse(res).book.stock_num === 0) {
              $('.jr_disabled').show();
            } else {
              if (JSON.parse(res).book.is_pay === 1) {
                $('.jr_gwc').show();
              }
              if (JSON.parse(res).book.is_borrow === 1) { 
                $('.jr_bag').show();
              }
            }
            if (JSON.parse(res).book.is_book_mark === 2) $('.db_jr_btn .ba1').addClass('ba3');
            var _data = {
                list: [JSON.parse(res).book],
            };
            (_data.list)[0].detail = (_data.list)[0].detail.split(",");
            _data.list[0].new_price = changeTwoDecimal_f(_data.list[0].new_price, 2);
            var tem_html = template("tem_bookDetails", _data);
            $("#book-details").html(tem_html);
            setTimeout(imgload,10);
            function imgload(){
              if ($(".book-pic .img img").height()) {
                autowidthheight(".book-pic .img img");
              } else {
                setTimeout(imgload,10);
              }
            }
            var _star_num = JSON.parse(res).book.avg_count == 0 ? 5 : JSON.parse(res).book.avg_count;
            $(".grade .pinfen span.num_grade").html(Math.floor(_star_num) + '.0');
            $(".grade .lookstar").html(star(Math.floor(_star_num), 5));
            is_vip_price();
        } else {
            console.log(JSON.parse(res).message)
        }
    });
}
/*评分*/
function star(fraction, num){
  var _star = '';
  for (var i = 0; i < num; i++) {
    var _class = '';
    if (fraction > i) {
      _class="str1";   
    } else {
      _class="str2";  
    }
    _star += '<i class="'+_class+'"></i>'  
  }
  return _star;
}
function GetQueryString(opt) {
    var reg = new RegExp("(^|&)"+ opt +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
// 添加到书包
function addToBag(id) {
    var _url = SERVICE + 'api/Shop/set_book_shoping';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        book_id: id,
        set_type: 'add',
    }
    $.get(_url, _opt, function(res){
        var _data = JSON.parse(res);
        if ( _data.status === 200) {
            showToast('添加成功！', 1500);
        } else {
            var message = '该书籍已在您的书包中';
            showToast(message, 1500);
        }
    })
}
// 添加购物车
function addToCart(id) {
    var _url = SERVICE + 'api/Shop/set_shoping';
    var _opt = {
        submit: TOKENMD5,
        openid: OPENID,
        book_id: id,
        set_type: 'add',
    }
    $.get(_url, _opt, function(res){
        var _data = JSON.parse(res);
        if ( _data.status === 200) {
            showToast('添加成功！', 1500);
        } else {
            var message = '添加失败：' + _data.message;
            showToast(message, 1500);
        }
    })
}
function showToast(text, time, callback){//提示框
    var _str = '<div id="showModal">'+ 
                  '<div class="showModal_box">'+text+'</div>'+  
                '</div>';
    if (!$("#showModal").html()){
      $("body").append(_str);setTimeout(function(){$("#showModal").fadeOut(300,function(){$("#showModal").remove();if(callback){callback();}});}, time)}            
}
});