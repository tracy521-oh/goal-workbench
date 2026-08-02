/* ========== 通用工具 ========== */
(function (g) {
  var U = {};

  U.$ = function (s, r) { return (r || document).querySelector(s); };
  U.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  U.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  U.pad = function (n) { return String(n).padStart(2, '0'); };

  U.dstr = function (d) { d = d || new Date(); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate()); };
  U.today = function () { return U.dstr(new Date()); };
  U.pd = function (s) { if (!s) return null; var a = String(s).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  U.mstr = function (d) { d = d || new Date(); return d.getFullYear() + '-' + U.pad(d.getMonth() + 1); };
  U.addDays = function (d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
  U.sow = function (d) { var x = new Date((d || new Date()).getTime()); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; };
  U.eow = function (d) { return U.addDays(U.sow(d), 6); };
  U.diffDays = function (a, b) { return Math.round((U.pd(b) - U.pd(a)) / 86400000); };
  U.inRange = function (d, a, b) { return d >= a && d <= b; };

  U.wkLabel = function (d) {
    var s = U.sow(d), e = U.eow(d);
    return (s.getMonth() + 1) + '月' + s.getDate() + '日 - ' + (e.getMonth() + 1) + '月' + e.getDate() + '日';
  };
  U.WD = ['一', '二', '三', '四', '五', '六', '日'];
  U.wdOf = function (s) { var d = U.pd(s); return U.WD[(d.getDay() + 6) % 7]; };

  U.money = function (n) {
    n = Number(n) || 0;
    return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  U.money0 = function (n) {
    n = Number(n) || 0;
    return '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  };
  U.mins = function (m) {
    m = Math.round(Number(m) || 0);
    if (m < 60) return m + ' 分钟';
    var h = Math.floor(m / 60), r = m % 60;
    return h + ' 小时' + (r ? ' ' + r + ' 分' : '');
  };
  U.hrs = function (m) { return ((Number(m) || 0) / 60).toFixed(1); };
  U.pct = function (a, b) { if (!b) return 0; return Math.max(0, Math.min(100, Math.round(a / b * 1000) / 10)); };

  U.esc = function (s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  U.nl2br = function (s) { return U.esc(s).replace(/\n/g, '<br>'); };
  U.clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };
  U.sum = function (arr, f) { return arr.reduce(function (t, x) { return t + (f ? (Number(f(x)) || 0) : (Number(x) || 0)); }, 0); };
  U.groupBy = function (arr, f) {
    var o = {}; arr.forEach(function (x) { var k = f(x); (o[k] = o[k] || []).push(x); }); return o;
  };
  U.download = function (name, text, type) {
    var b = new Blob([text], { type: type || 'application/json;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 300);
  };

  g.U = U;
})(window);
