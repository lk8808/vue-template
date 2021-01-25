
export default {
  toast(msg, bottom, duration){
      duration = isNaN(duration) ? 1000 : duration;
      var pos = bottom == null ? 'bottom:25%;' : 'bottom:' + bottom + ';';
      console.log(pos);
      var m = document.createElement('div');
      m.innerHTML = msg;
      m.style.cssText =
        'max-width:60%;min-width: 150px;border-radius: 4px;' +
        'padding:0 14px;height: 40px;line-height: 40px;' +
        'color: rgb(255, 255, 255);text-align: center;' +
        'position: fixed;left: 50%; transform: translateX(-50%);' + pos +
        'z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;';
      document.body.appendChild(m);
      setTimeout(function() {
        var d = 0.5;
        m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
        m.style.opacity = '0';
        setTimeout(function() { document.body.removeChild(m) }, d * 1000);
      }, duration);
  }
}
