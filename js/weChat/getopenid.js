const DOMAIN_NAME = "game.flyh5.cn";//域名
const GETOPENIDURL = "http://game.flyh5.cn/game/wx0f0cf12df3c0e698/draw";//访问这个地址拿到openid
if(window.document.location.host == DOMAIN_NAME) {
  //如果没有openid代表没有授权
  if(sessionStorage['openid'] == null || sessionStorage['openid'] == undefined || sessionStorage['openid'] == '') {
    window.location.href = GETOPENIDURL;
  }
  var _openid = JSON.parse(sessionStorage['openid']);
} else {
  if (sessionStorage['openid'] == null || sessionStorage['openid'] == undefined || sessionStorage['openid'] == '') {  
    var _openid = {
      openid: "o8I9c1XN10KsxntfwROdQ3kNPwNo",
      nickname: "扬帆", 
      headimgurl: "http://game.flyh5.cn/resources/game/wechat/yuehui/images/personal/head.jpg",
      sex: 1, 
      language: "zh_CN", 
      country: "中国",
      province: "湖南", 
      city: "长沙",
      privilege: []
    }  
    sessionStorage.setItem('openid', JSON.stringify(_openid));   
  }   
}  
console.log(JSON.parse(sessionStorage.getItem('openid')));