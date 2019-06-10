$(function(){
  function GetCity(fn) {
      var geolocation = new BMap.Geolocation();
      var gc = new BMap.Geocoder();
      geolocation.getCurrentPosition(function (r) {   //定位结果对象会传递给r变量
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {  //通过Geolocation类的getStatus()可以判断是否成功定位。
          var pt = r.point;
          gc.getLocation(pt, function (rs) {
            fn(rs);
            //alert(addComp.province + "||" + addComp.city + "||" + addComp.district + "||" + addComp.street + "||" + addComp.streetNumber);
          });
        } else {
          switch (this.getStatus()){
            case 2:
            fn("-1");
            break;
            case 3:
            fn("-1");
            break;
            case 4:
            fn("-1");
            break;
            case 5:
            fn("-1");
            break;
            case 6:
            fn("-1");
            break;
            case 7:
            fn("-1");
            break;
            case 8:
            fn("-1");
            break;
          }
        }
      },{ enableHighAccuracy: true })
    //return CityName;
    } 
    function showToast(text){//提示框
      var _str = '<div id="showModal">'+ 
                  '<div class="showModal_box">'+text+'</div>'+  
                 '</div>';
      if (!$("#showModal").html()){
        $("body").append(_str);            
      }
    }
    if (!sessionStorage.getItem("cur_city")) {
      GetCity(function(res){
        var _address = res.addressComponents.city;
        sessionStorage.setItem("cur_city", _address);
        $('#cur_city').html(_address);
      })
    } else {
      $('#cur_city').html(sessionStorage.getItem("cur_city"));
    }
    /*if (_address.indexOf("浙江") == -1) {
      showToast("您当前不在服务范围内");
    }*/
});