$(function(){
  FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
  /**********公共配置部分**********/
  /*localStorage.removeItem("openid");
  sessionStorage.removeItem("openid");
  localStorage.removeItem("USERMOBILE");
  localStorage.removeItem("isSelectLabel");*/
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
  var TOKENMD5 = hex_md5("SkZUAroT");
  var OPENID = localStorage.getItem("openid");
  if (OPENID) {OPENID = JSON.parse(OPENID).openid;}//用户openid 
  var REG_PHONE  = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
  var USERMOBILE = localStorage.getItem("USERMOBILE") || '';
  if ($(".body_index").html()) {/*查询是否注册登录过*/
    if (!(OPENID && USERMOBILE)) {
      sessionStorage.setItem("url_login", './index.html');
      window.location.href="./login.html";
    } else {
      isLogin();
    }
  }
  /*查询账号是否被注销*/
  /*if ($(".body_index").html()) {
    if (OPENID) {*/
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
/*    } 
  }*/
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
    $("body").append(_str);        
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
   /*图片自适应宽高*/
    function autowidthheight(elements) {
      $(elements).each(function(index,ele){
        if ( ele.width / ele.height < 1) {
          $(ele).css({"width": "auto","height": "100%"});
        }
      })
    }
  /**********功能开发部分**********/
  /**********首页**********/
  /*数据请求、模板引擎*/
  if ($(".body_index").html()) {
    //if (!isLogin()) {window.location.href="./login.html";}
    $.get("./template/template_home.html", function(res){
      $("body").append(res);
      home_label();//首页标签列表
      home_list();//首页最新推荐-最热推荐-借阅排行-猜你喜欢
    })
  } else if ($(".body_more").html()) {
    $.get("../template/template_home_more.html", function(res){
      $("body").append(res);
      more_list(more_index);
      $("#ffll").html(more_index);
      $("#page").html(more_page);
      //$(".dh-btn-tn>span:eq("+GetQueryString("index")+")").addClass("bcolor");
    })
  }
  /*首页获取标签*/
  function home_label(){
    if (!localStorage.getItem("isSelectLabel")){
      var _data_tem = {
        list: []
      }
      var _url = SERVICE + "api/Index/get_book_tag";
      var _data = {
        submit: TOKENMD5,
        openid: OPENID
      };
      $.get(_url, _data, function(res){
        res = JSON.parse(res)
        if (res.status == 200) {
          var types = res.types;
          var _select = res.sure_tags;
          for (var i = 0;i < types.length; i++) {
            if(_select.join(",").indexOf(types[i].id) != -1) {
              types[i].isSelect = 1
            } else {
              types[i].isSelect = 0
            }
          }
          _data_tem.list = types;
          var tem_html = template("tem_home_label", _data_tem);
          $(".tag .content .tag-line").html(tem_html);
          $(".tag").fadeIn(200);
        }
      })
    } else {
      return;
    }
  }
  //选取标签
  $(".tag-line").delegate(".tag-one", "click", function(){
    $(this).toggleClass("active");
  })
  //保存选择的标签
  $("#tagSave").on("click", function(){
    var _selectLabel = [];
    var allLabel = $(".tag-line .tag-one");
    for (var i = 0; i < allLabel.length; i++) {
      if ($(allLabel[i]).hasClass("active")) {
        _selectLabel.push($(allLabel[i]).data("id"));
      }
    }
    if (_selectLabel.length == 0) {
      confirmModal('确认', '选择书签便于推荐您喜欢的书籍，确认不选择任何书签吗？', '取消', true, '确认', '.2', function(res){
        if (res) {
          $(".tag").fadeOut(200);
          localStorage.setItem("isSelectLabel", true);
        }
      })
      return;
    }
    var _url = SERVICE + "api/Index/add_tag";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      tag: _selectLabel.join(",")
    }
    // if (_selectLabel.length >= 7) {
      $.get(_url, _data, function(res){
        res =JSON.parse(res);
        if (res.status == 200) {
          $(".tag").fadeOut(200);
          showToast("标签保存成功", 1500);
          localStorage.setItem("isSelectLabel", true);
          window.history.go(0);
        } else {
          showToast(res.message, 1500);
        }
      })
    // } else {
    //   showToast("请选择最少7个标签后保存", 1500);
    // }
  })
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
          if (res.status == 200) {
            _data_tem.list = res.search_book;
            $(".search .search_result").show().html(template("tem_search_list", _data_tem));
          } else {
            $(".search .search_result").show().html('<li><a href="javascript:;">没有相关书籍</a></li>');
          }
        })
      } else {
        clearTimeout(_auto_search);
        $(".search .search_result").hide().html('');
      }
    }, 400)
  })
  $(window).scroll(function(){
    $("#search_book").val("");
    $(".search .search_result").hide();
  });
  /*首页最新推荐-最热推荐-借阅排行-猜你喜欢*/
  function home_list(){
    var _data_new_groom = {}
    var _data_banner = {}
    var _data_hot_book = {}
    var _data_borrow_num = {}
    var _data_borrow_num2 = {}
    var _data_borrow_num3 = {}
    var _data_rand_book = {}
    var _url = SERVICE + "api/Index/index_book";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
    }
    $.get(_url, _data, function(res){
      res =JSON.parse(res); 
      if (res.status == 200) {
        _data_banner.list = res.carousel;
        _data_new_groom.list = res.new_groom;
        _data_hot_book.list = res.hot_book;
        _data_borrow_num.list = res.borrow_num;
        _data_borrow_num2.list = res.borrow_num.slice(1, 3);
        _data_borrow_num3.list = res.borrow_num.slice(3, 5);
        _data_rand_book.list = res.rand_book;
      }
      var tem_html = template("tem_home_newrec", _data_new_groom);
      var tem_html2 = template("tem_home_newrec", _data_hot_book);
      var tem_html3 = template("tem_home_borrow", _data_borrow_num);
      var tem_html3_2 = template("tem_home_borrow2", _data_borrow_num2);
      var tem_html3_3 = template("tem_home_borrow2", _data_borrow_num3);
      var tem_html4 = template("tem_home_newrec", _data_rand_book);
      $(".new_recommend .second").html(tem_html);
      $(".hot_recommend .second").html(tem_html2);
      $(".borrow .second").html(tem_html3 + "<div>" + tem_html3_2 +  "</div><div>" +tem_html3_3 + "</div>");
      $(".whatulike .second").html(tem_html4);
      $("#home_banner").html(template("tem_home_banner", _data_banner));
      var mySwiper = new Swiper(".swiper-container", {
        autoplay:2000,
        loop:true,
        autoplayDisableOnInteraction:false,
        pagination:".swiper-pagination",
        paginationClickable:true,
        observer: true,
        observeParents: true
      })
    })
  }
  /**********首页more页**********/
  var more_index = GetQueryString("index");
  var more_page = 2;
  var more_list_str = [];
  var isLoad = true;
  $(".dh-btn-tn>span").on("click", function(){
    //$("html,body").scrollTop(0);
    isLoad = true;
    $("html,body").animate({"scrollTop": 0},200);
    $(".scroll_load_more").html("加载中...");
    more_index = $(this).index();
    more_list(more_index); 
    more_page = 2;
    more_list_str = [];
  })
  if ($(".body_more").html()) {
    $(window).on("scroll",function(){
      var s_t=$(window).scrollTop();
      var p_h=window.innerHeight;
      var allH=$("body").prop("scrollHeight");
      if(s_t + p_h >= allH){ 
        if (isLoad) {
          isLoad = false;
          more_list(more_index,more_page++);
        }
      }   
    }); 
  }
  function more_list(index,page){
    var _type;
    !page ? page = 1 : page = page 
    if (index == 0) {
      _type = 1;
    }else if (index == 1) {
      _type = 3;
    }else if (index == 2) {
      _type = 4;
    }else if (index == 3) {
      _type = 2;
    }
    $(".dh-btn-tn>span:eq("+index+")").addClass("bcolor").siblings().removeClass("bcolor");
    $(".top-pro div:eq(" + index + ")").show().siblings().hide();
    var _data_tem = {list: []}
    var _url = SERVICE + "api/Index/get_more_list";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      page_rows: page,
      type: _type
    };
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      more_list_str = (more_list_str.concat(res.more_book));
      _data_tem.list = more_list_str;
      if (res.status == 200) {
        isLoad = true;
        var tem_html = template("tem_home_more", _data_tem);
        $(".whatulike .second").html(tem_html); 
      } else if (res.status == 404){
        isLoad = false;
        $(".scroll_load_more").html("没有更多啦~");
      }
    })
  }
  /*点爱心收藏*/
  $(".whatulike").delegate(".bottom-btn-net i", "click", function(){
    var _self = $(this);
    var _id = $(this).parents(".flex_com").data("id");
    var _url = SERVICE + "api/Index/add_book_mark";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      book_id: _id
    };
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 200) {
        if (_self.hasClass("ba2")) {
          _self.removeClass("ba2 animated rubberBand");
        } else {
          _self.addClass("ba2 animated rubberBand");
        }
      }
    })
  })
})