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
    /**********功能开发部分**********/
    var PAGE = 1;
    var TAG = '';
    var TYPE = 1; 
    var SECONDTAG = [];
    var FIRSTTAG;
    var BOOKARRY = []; //书籍缓存数据
    var ISLOADING = false;
    var TYPE = 'first';
    $.get("../template/template_bookCity.html", function(res){
        $("body").append(res);
        getHomeInfomation(PAGE, TYPE, TAG);
    });
    $('body,html').animate({ scrollTop: 0 }, 800);
    /*搜索书籍*/
    var _auto_search;
    $("#search_book").bind("focus input propertychange", function(){
      var _input = $(this).val().replace(/\s/g, '');
      if (_auto_search) {
        clearTimeout(_auto_search);
      }
      _auto_search = setTimeout(function(){
        if (_input) {
          var _data_tem = {};
          var _url = SERVICE + "api/Index/search_book";
          var _data = {
            submit: TOKENMD5,
            openid: OPENID,
            page_rows: 1,
            book_name: _input
          };
          $.get(_url, _data, function(res){
            res = JSON.parse(res);
            console.log(res);
            if (res.status == 200) {
              _data_tem.list = res.search_book;
              $(".search .search_result").show().html(template("tem_search_list", _data_tem));
            } else {
              $(".search .search_result").show().html('<li><a href="javascript:;">没有相关书籍</a></li>');
            }
          })
        } else {
          $(".search .search_result").hide().html('');
        }
      }, 400)
      
    })
    $(window).scroll(function(){
        $("#search_book").val("");
        $(".search .search_result").hide();
      });  
      //导航栏
      $('.dh-btn').on('click','span',function () {
          $(this).addClass('bcolor').siblings().removeClass('bcolor');
          TYPE = $(this).attr('data-id');
          PAGE = 1;
          BOOKARRY = [];
          ISLOADING = false;
          getHomeInfomation();
      })
      //点击收藏
      $('body').delegate('.bottom-btn-net .ba1', 'click',function () {
        var _url = SERVICE + 'api/Index/add_book_mark';
        var _self = $(this);
        var _opt = {
          submit: TOKENMD5,
          openid: OPENID,
          book_id: $(this).attr('data-id'),
        };
        $.post(_url, _opt, function(res){
          res = JSON.parse(res);
          if (res.status == 200) {
            if (_self.hasClass("ba2")) {
              _self.removeClass("ba2 animated rubberBand");
            } else {
              _self.addClass("ba2 animated rubberBand");
            }
          }
        });
      });
      // 父类选择
      $(document).on('click', '.kind-line', function() {
          $("#book").html("");
          $(".childbook .kinds .title").html($(this).find("div").html());
          $(".loading").html("加载中...");
          $(this).addClass('active').siblings().removeClass('active');
          var id = $(this).attr('data-id');
          FIRSTTAG = id;
          PAGE = 1;
          TYPE = 'second';
          BOOKARRY = [];
          SECONDTAG = [];
          getCheckData();
          getChildrenTag(id);
          $("html,body").animate({scrollTop: $(".childbooks").offset().top}, 500);
      });
      //子类选择
     $('.kinds').on('click', 'span', function () {
          BOOKARRY = [];
         if ($(this).text() == '全部') {
              $(this).css('color', '#ff6c00');
              $(this).siblings().removeClass('baack');
              SECONDTAG = [];
              getCheckData();
              return;
         };
         $('#all').css('color', '#0b3e9e');
         if (!$(this).attr('class')) {
             $(this).addClass('baack');
             SECONDTAG.push($(this).attr('data-id'));
          } else {
              $(this).removeClass('baack');
              SECONDTAG.splice(SECONDTAG.indexOf($(this).attr('data-id')), 1);
         }
         PAGE = 1;
         TYPE = 'second';
         if (SECONDTAG.length === 0) {
              $('#all').css('color', '#ff6c00');
         }
         getCheckData();
     })
      /*分类展开*/
      $(".kback").on("click", function(){
          var text = $(this).text();
          if (text.indexOf('收起') >= 0) {
              $(this).children('span').text('展开');
              $(this).children('i').css("transform", "rotate(180deg)");
          } else {
              $(this).children('span').text('收起');
              $(this).children('i').css("transform", "rotate(0deg)");
          }
          $(".allkin").slideToggle(200);
      });
      // 滚动加载
      $(window).scroll(function(){
      　  var scrollTop = $(this).scrollTop();
      　　var scrollHeight = $(document).height();
      　　var windowHeight = $(this).height();
      　　if(scrollHeight - (scrollTop + windowHeight) === 0){
              PAGE++
              ISLOADING = true;
              if (TYPE == 'first') {
                  getHomeInfomation(PAGE);
              } else {
                  getCheckData();
              }
      　　}
      });

    // 获取书城首页信息
    function getHomeInfomation(page, type, tag) {
        var _url = SERVICE + 'api/Index/book_list';
        var _opt = {
            submit: TOKENMD5,
            openid: OPENID,
            page_rows: page || PAGE,
          };
        $.post(_url, _opt, function(res){
            var _data_banner = {};
            var _data = JSON.parse(res);
            if ( _data.status === 200) {
                if (_data.pay_count.book_total > 0) {
                  $(".sbgwc span.bag").show().html(_data.pay_count.book_total < 99 ? _data.pay_count.book_total : "99+");
                }
                if (_data.pay_count.pay_total > 0) {
                  $(".sbgwc span.car").show().html(_data.pay_count.pay_total < 99 ? _data.pay_count.pay_total : "99+");
                }
                $(".childbook .kinds .title").html(_data.types[0].name);
                FIRSTTAG = _data.types[0].id;
                _data_banner.list = _data.carousel;
                var tagData = {
                    list: _data.types,
                };
                var secondTag = _data.types2;
                secondTag.unshift({
                    id: 'all',
                    name: '全部'
                });
                if (ISLOADING === true) {
                    if (_data.list_book && _data.list_book.length > 0) {
                        BOOKARRY = BOOKARRY.concat(_data.list_book);
                    }
                    var bookData = {
                        list: BOOKARRY,
                    };
                } else {
                    BOOKARRY = _data.list_book;
                    var bookData = {
                        list: _data.list_book,
                    };
                }
                //console.log(_data_banner);
                var tem_banner_html = template("tem_home_banner", _data_banner);
                $(".swiper-container .swiper-wrapper").html(tem_banner_html);
                var tem_tag = template("tem_first_tag", tagData);
                var tem_book = template("tem_book", bookData);
                $("#first-tag").html(tem_tag);
                $("#second-tag").html(template("tem_second_tag", {list: secondTag}));
                $("#book").html(tem_book);
                $('.kind-line').eq(0).addClass('active');
                var mySwiper = new Swiper(".swiper-container", {
                  autoplay:2000,
                  loop:true,
                  autoplayDisableOnInteraction:false,
                  pagination:".swiper-pagination",
                  paginationClickable:true,
                  observer: true,
                  observeParents: true
                })
            } else {
                $('.loading').text('没有更多了');
            }
        });
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
                var message = '添加失败：' + _data.message;
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


    // 获取子级标签

    function getChildrenTag(id) {
        var _url = SERVICE + 'api/Index/get_two_cate';
        var _opt = {
            submit: TOKENMD5,
            pid: id,
        }
        $.get(_url, _opt, function(res){
            var _data = JSON.parse(res);
            if ( _data.status === 200) {
                var secondTag = _data.two_types;
                secondTag.unshift({
                    id: 'all',
                    name: '全部'
                });
                $("#second-tag").html(template("tem_second_tag", {list: secondTag}));
            }
        })
    }

    // 切换标签时获取数据
    function getCheckData() {
        var _url = SERVICE + 'api/Index/click_cate_search';
        var _opt = {
            submit: TOKENMD5,
            openid: OPENID,
            page_rows: PAGE,
            one_sure_type: FIRSTTAG,
            two_sure_type: SECONDTAG.toString()
        }
        $.get(_url, _opt, function(res){
            var _data = JSON.parse(res);
            if (_data.status === 200) {
                if (ISLOADING === true) {
                    if (_data.list_book && _data.list_book.length > 0) {
                        BOOKARRY = BOOKARRY.concat(_data.list_book);
                    }
                    var bookData = {
                        list: BOOKARRY,
                    };
                } else {
                    BOOKARRY = _data.list_book;
                    var bookData = {
                        list: _data.list_book,
                    };
                }
                var tem_book = template("tem_book", bookData);
                $("#book").html(tem_book);
            } else {
                if (!$("#book").html()) {
                    $('.loading').text('此分类下暂无相关书籍');
                } else {
                    $('.loading').text('没有更多了');
                }
            }
        })
    }
});