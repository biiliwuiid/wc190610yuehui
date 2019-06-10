$(function(){
  FastClick.attach(document.body);//解决移动端click点击事件300ms延迟 
  /**********公共配置部分**********/
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
  var TOKENMD5 = hex_md5("SkZUAroT");
  var OPENID = JSON.parse(localStorage.getItem("openid")).openid;
  var USERMOBILE = localStorage.getItem("USERMOBILE") || '';
  var REG_PHONE  = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;//正则--手机号
  var REG_CHINESE = /^[\u4E00-\u9FA0]{2,6}$/;//正则--中文
  /*用户头像、昵称、手机号*/
  $("img#userAvatar").attr("src", JSON.parse(localStorage.getItem("openid")).headimgurl);//头像
  $("#userName").html(JSON.parse(localStorage.getItem("openid")).nickname);//昵称
  $("#userPhone").html(USERMOBILE);
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
  /**********功能开发部分**********/
  /**********会员中心**********/
  /*我的*/
  if ($(".body_my").html()) {
    var _url = SERVICE + "api/Info/info_index";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      console.log(res);
      if (res.status == 200) {
        $(".user-add .vip .vip-n").hide();
        $(".user-add .vip .vip-kind").show();
        if (res.vip.vip_grade == 2) {
          $("#vip_grade").addClass("vip2").html("小秀才");
        } else if (res.vip.vip_grade == 3) {
          $("#vip_grade").addClass("vip3").html("小状元");
        }
      }
      if (res.order_count.length != 0) {
        if (res.order_count.stay_order_count > 0) {
          $(".all-orders-cen .th1 p").show().html(res.order_count.stay_order_count < 99 ? res.order_count.stay_order_count : "99+");
        }
        if (res.order_count.stay_revert_count > 0) {
          $(".all-orders-cen .th2 p").show().html(res.order_count.stay_revert_count < 99 ? res.order_count.stay_revert_count : "99+");
        }
        if (res.order_count.finish_revert_count > 0) {
          $(".all-orders-cen .th3 p").show().html(res.order_count.finish_revert_count < 99 ? res.order_count.finish_revert_count : "99+");
        } 
        if (res.order_count.history_order_count > 0) {
          $(".all-orders-cen .th4 p").show().html(res.order_count.history_order_count < 99 ? res.order_count.history_order_count : "99+");
        }
        if (res.order_count.coiling_count > 0) {
          $(".all-orders-cen .th5 p").show().html(res.order_count.coiling_count < 99 ? res.order_count.coiling_count : "99+");
        }
      }
    })
  }
  /**********个人详情--宝宝信息**********/
  if ($(".my_baby_box").html()) {
    $.get("../../template/template_my.html", function(res){
      $("body").append(res);
      baby_info();//收货地址列表
    })
    
  }
  function baby_info() {
    var _data_tem = {}
    var _url = SERVICE + "api/Info/baby_info";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        if (res.user_info.baby_sex) {
          $("._my .sex_select p:eq(" + (res.user_info.baby_sex - 1) + ")").addClass("selected");
        }
        $("#baby_age").val(res.user_info.baby_age ? res.user_info.baby_age + '岁' : '');
        _data_tem.list = res.user_info.tag_list
        $(".my_babyBox .interest ul").html(template("tem_baby_tag", _data_tem));
      }
    })
  }
  /*更改兴趣标签*/
  $('.my_babyBox .interest .interest_select').on("click", function(){
    home_label();
   // $(".tag").fadeIn(200);
  });
  /*获取标签*/
  function home_label(){
      var _data_tem = {};
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
      confirmModal('确认', '选择书签便于推荐您喜欢的书籍，确认不选择任何书签吗？', '取消', '确认', function(res){
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
    /*if (_selectLabel.length >= 7) {*/
      $.get(_url, _data, function(res){
        res =JSON.parse(res);
        console.log(res);
        if (res.status == 200) {
          $(".tag").fadeOut(200);
          showToast("标签保存成功", 1500);
          baby_info();
        } else {
          showToast("请先修改标签~", 1500);
        }
      })
    /*} else {
      showToast("请选择最少7个标签后保存", 1500);
    }*/
  })
  $(".tag .content .close").on("click", function(){//关闭标签弹窗
    $(".tag").fadeOut(200);
  });
  $("._my .sex_select p").on("click", function(){//选择性别
    $(this).addClass("selected").siblings().removeClass("selected");
  });
  $("#baby_age").on("focus", function(){//聚焦输入年龄框时去掉‘岁’字
    var _input = $(this).val();
    var new_input = _input.replace(/[^\d]/g,'');
    $(this).val(new_input)
  })
  $("#baby_age").on("blur", function(){//输入数字年龄后自动添加‘岁’字
    var _input = $(this).val();
    if (_input) {$(this).val(_input + '岁');}
  })
  $("#submit_baby").on("click", function(){//保存宝宝信息
    var _gender = $("._my .sex_select p.selected").index() + 1;
    var _age = parseFloat($(".age_select input").val());
    var _url = SERVICE + "api/Info/edit_baby_info";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      baby_sex: _gender,
      baby_age: _age
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res);
      if (res.status == 200) {
        showToast("宝宝信息保存成功", 1500);
      } else {
        showToast("您未做任何修改操作", 1500);
      }
    })
  })
  /**********个人详情--更多**********/
  /*数据请求、模板引擎*/
  if ($(".my_address_box").html()) {
    $("._my .sex_select p").html(JSON.parse(localStorage.getItem("openid")).sex == 1 ? "男" : "女");
    $.get("../../template/template_my.html", function(res){
      $("body").append(res);
      address_list();//收货地址列表
    })
  }
  function address_list(){
    var _data_tem = {}
    var _url = SERVICE + "api/Info/get_my_address";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      console.log(res);
      _data_tem.list = res.address;
      $("._my ul.address_box").html(template("tem_my_address", _data_tem));
      if (res.status == 404){
        $(".no-address").show(); 
      }
    })
  }
  $("._my .address").delegate(".edit .select","click", function(){//默认收货地址选择
    $(this).parents("li").addClass("selected").siblings().removeClass("selected");
    var _url = SERVICE + "api/Info/set_default_address";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      id: $(this).parents("li").data("id")
    }
    $.post(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        showToast("默认地址设置成功", 1500);
      } else {
        showToast(res.message, 1500);
      }
    })
  })
  $("#submit_more").on("click", function(){
    var _gender = $("._my .sex_select p.selected").index();
    var _address = $("._my .address p").html();
    var _autograph = $("._my .autograph p").html();
    var _data = {
      gender: _gender,
      address: _address,
      autograph: _autograph
    }
  })
  /*删除收货地址*/
  $(".my_address_box .address_box").delegate(".btn_delete", "click", function(){
    var _id = $(this).parents("li").data("id");
    confirmModal("确认删除", "您确定要删除该收货地址？", "取消", "确定", function(res){
      if(res){
        var _url = SERVICE + "api/Info/del_address";
        var _data = {
          submit: TOKENMD5,
          openid: OPENID,
          id: _id
        }
        $.post(_url, _data, function(res){
          res = JSON.parse(res)
          if (res.status == 200) {
            showToast("删除成功", 1500, function(){
              address_list();
            });
          } else {
            showToast(res.message, 1500);
          }
        })
      }
    });
  })
  if ($(".my_editaddressBox").html() && GetQueryString("id")) {
    var  _id = GetQueryString("id")
    var _url = SERVICE + "api/Info/get_one_address";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      id: _id
    }
    $.post(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        $(".consignee_input input").val(res.address.collect_name);
        $(".phone_input input").val(res.address.collect_phone);
        var _region_select = res.address.province + "," + res.address.city;
        if (res.address.area) { _region_select += "," + res.address.area}
        $(".region_select").html(_region_select);
        $(".my_editaddressBox textarea").val(res.address.address);
      } else {
        showToast(res.message, 1500);
      }
    })
  }
  /*编辑地址*/
  /*省市区三级联动*/
  if ($(".region_select").html()) {
    var area1 = new LArea();
    area1.init({
      'trigger': '.region_select', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
      'valueTo': '#value1', //选择完毕后id属性输出到该位置
      'keys': {
        id: 'id',
        name: 'name'
      }, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
      'type': 1, //数据源类型
      'data': LAreaData //数据源
    });
    area1.value=[27,15,0];//控制初始位置，注意：该方法并不会影响到input的value
  }
  /*$(".region_select").on("click", function(){
    showToast("现只对浙江省宁波市海曙区用户开放", 2000);
  });*/
  /*保存收货地址*/
  $("#submit_address").on("click", function(){
    var _name = $(".consignee_input input").val();
    var _phone = $(".phone_input input").val();
    var _region = $(".region_select").html();
    var _streets = $("#detailed_address").val();
    if (!REG_CHINESE.test(_name)) {
      if (!_name) {
        showModal("收货人姓名不能为空");
        return;
      } else {
        showModal("收货人姓名只能为2-6位中文字符");
        return;
      }
    } else if (!_phone) {
      showModal("请填写收货人联系电话");
      return;
    } else if (!REG_PHONE.test(_phone)) {
      showModal("请填写符合规范的手机号码");
      return;
    } else if (_region === "请选择") {
      showModal("请选择您所在区");
      return;
    } else if (!_streets) {
      showModal("请填写您的详细地址");
      return;
    } else if (_streets.replace(/\s/g, '').length < 5) {
      showModal("详细地址不能少于5个字");
      return;
    }
    var _url = SERVICE + "api/Info/add_address";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      collect_name: _name,
      collect_phone: _phone,
      province: _region.split(",")[0],
      city: _region.split(",")[1],
      area: _region.split(",")[2] ? _region.split(",")[2] : '',
      address: _streets
    }
    if (GetQueryString("id")) {
      _data.id = GetQueryString("id");
      _url = SERVICE + 'api/Info/edit_address'
    }
    var _province = ["浙江省"];
    var _city = ["宁波市"];
    var _area = ["海曙区", "江北区", "高新区", "鄞州区", "镇海区", "北仑区", "奉化区", "东钱湖度假区"];
    if (_province.indexOf($.trim(_data.province)) == -1 || _city.indexOf($.trim(_data.city)) == -1 || _area.indexOf($.trim(_data.area)) == -1) {
      showModal("目前悦绘只支持宁波市内（含海曙区、江北区、高新区、鄞州区、镇海区、北仑区、奉化区、东钱湖度假区）的物流配送服务，若超出这些地区的物流配送请与悦绘客服沟通，带来不便敬请谅解！");
      return;
    }
    $.post(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        showToast("保存成功", 1500, function(){
          var _url = sessionStorage.getItem("url_login");
          if (!_url) {
            window.location.href = "../my/my_more.html"
          } else {
            sessionStorage.removeItem("url_login");
            window.location.href = _url;
          }
        });
      } else {
        showToast(res.message, 1500);
      }
    })
  })
  /**********心愿单**********/
  var WISHPAGE = 1;
  if ($(".body_wish").html()) {
    $.get("./template/template_my.html", function(res){
      $("body").append(res);
      wish_list(WISHPAGE);//心愿单列表
    })
  }
  // 滚动加载
  $(window).scroll(function(){
　  var scrollTop = $(this).scrollTop();
　　var scrollHeight = $(document).height();
　　var windowHeight = $(this).height();
　　if(scrollHeight - (scrollTop + windowHeight) === 0){
        WISHPAGE++
        /*ISLOADING = true;*/
        wish_list(WISHPAGE);
　　}
  });
  function wish_list(page){
    var _data_tem = {}
    var _url = SERVICE + "api/Info/wish_book";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      page_rows: page 
    }
    $.get(_url, _data, function(res){
      res = JSON.parse(res)
      if (res.status == 200) {
        _data_tem.list = res.book_marks;
        if (page === 1 &&_data_tem.list.length <= 6) {
          $(".loading").hide();
        } else {
          $(".loading").html("没有更多了~");
        }
        $(".newbook .second").append(template("tem_my_wish", _data_tem));
      } else {
        if (page === 1) {
          $(".eidter-btn,.loading").hide();
          $(".not-wish").show();
        } else {
          $(".loading").html("没有更多了~");
        }
        
      }
    })
  }
  var delete_wish = [];
  /*点击编辑按钮*/
  $('.eidter-btn').on('click',function () {
    $(".newbook .second").addClass("shake");
    //$('._delete').show();
    $('.complete-btn').show();
    $('.eidter-btn,.loading').hide();
    //$(".second").children().css('margin-top','0.2rem');
  })
  /*编辑*/
  $('.second').on('click','._delete', function (event) {
    event.preventDefault();
    delete_wish.push($(this).parents(".flex_com").data("id"));
    $(this).parents(".flex_com").remove();
  })
  /*确定编辑按钮*/
  $('.complete-btn').on('click',function () {
    var _url = SERVICE + "api/Info/edit_wish_book";
    var _data = {
      submit: TOKENMD5,
      openid: OPENID,
      del_ids: delete_wish.join(",")
    }
    if (_data.del_ids.length != 0) {
      $.get(_url, _data, function(res){
        res = JSON.parse(res)
        if (res.status == 200) {
          showToast("编辑成功", 1500);
          $(".newbook .second").removeClass("shake");
          $('.complete-btn').hide();
          $('.eidter-btn,.loading').show();
          $(".second").children().css('margin-top','0.1rem');
          WISHPAGE = 1;
          $(".newbook .second").html('');
          wish_list(WISHPAGE);
        }
      })
    } else {
      $(".newbook .second").removeClass("shake");
      $('.complete-btn').hide();
      $('.eidter-btn,.loading').show();
      $(".second").children().css('margin-top','0.1rem');
    }
  })
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
      console.log(res);
      if (res.status == 200) {
        $("#per_proposal").val('');
        showToast("提交成功", 1500);
      }
    })
    }
  });
  //  打开客服弹窗
    $('#complaints').on('click', function() {
      var _url = SERVICE + "api/Appointment/getService";
      var _data = {
        submit: TOKENMD5
      }
      $.get(_url, _data, function(res){
        res = JSON.parse(res)
        if (res.status == 200) {
          $("#ewm").attr("src", res.list.file_path);
          $('.customer-service').show(); 
        }
      })
    });
    // 关闭客服弹窗
    $('#customer-close').on('click', function() {
      $('.customer-service').hide(); 
  });
})