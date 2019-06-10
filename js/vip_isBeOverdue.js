$(function(){
  /**********公共配置部分**********/
  var SERVICE = "https://game.flyh5.cn/game/wxf8c4f91c26f2fa95/draw/";
  var TOKENMD5 = hex_md5("SkZUAroT");
  var OPENID = localStorage.getItem("openid");
  if (OPENID) {
    try {OPENID = JSON.parse(OPENID).openid;}//用户openid 
    catch(err){
      sessionStorage.removeItem("openid");
      localStorage.removeItem("openid");
      localStorage.removeItem("USERMOBILE");
      localStorage.removeItem("isSelectLabel");
      window.location.href="./login.html";
    }
  }  
  /*会员是否过期*/
  if (!OPENID) {return;}
  var _url = SERVICE + "api/Info/over_vip";
  var _data = {
    submit: TOKENMD5,
    openid: OPENID
  };
  $.get(_url, _data, function(res){
    //res = JSON.parse(res)
    //console.log(res);
  })
});