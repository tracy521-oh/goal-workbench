/* ========== 应用主控 ========== */
(function (g) {
  var App = {};
  var NAV = [
    { k: 'home', n: '总看板', i: '🏠', sub: '三大目标一屏掌握' },
    { k: 'study', n: '公考备考', i: '📚', sub: '国考 + 吉林省考 双线推进' },
    { k: 'finance', n: '攒钱规划', i: '💰', sub: '存款目标 · 医疗备用金 · 预算' },
    { k: 'life', n: '生活配套', i: '🌱', sub: '作息 · 运动 · 体检' },
    { k: 'writer', n: '作家成长路', i: '✍️', sub: '小说创作 · 浇灌生命之树' },
    { k: 'reader', n: '阅读者', i: '📖', sub: '书单 · 笔记 · 金句书签' },
    { k: 'review', n: '每周复盘', i: '🗓', sub: '固定每周日 · 自动加载模板' },
    { k: 'settings', n: '设置', i: '⚙', sub: '考试日期 · 提醒 · 数据备份' }
  ];
  var cur = 'home';
  var deferredPrompt = null;

  App.go = function (k) {
    cur = k;
    App.render();
    window.scrollTo({ top: 0 });
  };

  App.refreshTop = function () {
    var st = S.get(), s = st.settings;
    var box = document.getElementById('countdowns');
    function cd(name, date, cls) {
      var d = S.q.dLeft(date);
      if (d === null) return '';
      return '<div class="cd ' + cls + '"><b>' + (d >= 0 ? d : '—') + '</b><span>' +
        U.esc(name.length > 7 ? name.slice(0, 7) + '…' : name) + '</span></div>';
    }
    box.innerHTML = cd(s.gkName, s.gkDate, 'gk') + cd(s.jlName, s.jlDate, 'jl');
  };

  function navHTML() {
    return NAV.map(function (n) {
      return '<button data-nav="' + n.k + '" class="' + (cur === n.k ? 'active' : '') + '">' +
        '<span class="i">' + n.i + '</span><span>' + n.n + '</span></button>';
    }).join('');
  }

  function openDrawer() {
    var sb = document.getElementById('sidebar'), bd = document.getElementById('backdrop');
    if (sb) sb.classList.add('open');
    if (bd) bd.classList.add('show');
  }
  function closeDrawer() {
    var sb = document.getElementById('sidebar'), bd = document.getElementById('backdrop');
    if (sb) sb.classList.remove('open');
    if (bd) bd.classList.remove('show');
  }
  App.openDrawer = openDrawer;
  App.closeDrawer = closeDrawer;

  App.render = function () {
    var meta = NAV.filter(function (n) { return n.k === cur; })[0];
    document.getElementById('pageTitle').textContent = meta.n;
    document.getElementById('pageSub').textContent = meta.sub;
    document.getElementById('sideNav').innerHTML = navHTML();
    U.$$('[data-nav]').forEach(function (b) {
      b.onclick = function () { App.go(b.dataset.nav); closeDrawer(); };
    });

    App.refreshTop();
    App.alerts();

    var el = document.getElementById('page');
    if (cur === 'home') Home.render(el);
    else if (cur === 'study') Study.render(el);
    else if (cur === 'finance') Fin.render(el);
    else if (cur === 'life') Life.render(el);
    else if (cur === 'writer') Writer.render(el);
    else if (cur === 'reader') Reader.render(el);
    else if (cur === 'review') Review.render(el);
    else Settings.render(el);
  };

  /* ---------- 首页提醒条 ---------- */
  App.alerts = function () {
    var st = S.get(), z = document.getElementById('alertZone');
    var out = '';
    var now = new Date();
    var rt = (st.settings.reminderTime || '22:30').split(':');
    var passed = now.getHours() > +rt[0] || (now.getHours() === +rt[0] && now.getMinutes() >= +rt[1]);
    var ci = S.q.todayCheckin();

    if (passed && !ci) {
      out += '<div class="alert warn">⏰ 已过 ' + st.settings.reminderTime + '，今天还没填写学习打卡' +
        '<button class="btn btn-primary" id="alCheck">去打卡</button></div>';
    }
    // 弹性消费提醒
    var al = S.f.flexAlert();
    if (al) {
      out += '<div class="alert ' + (al.level === 'over' ? 'danger' : 'warn') + '">' +
        (al.level === 'over' ? '💸 本月弹性消费已超预算（' + al.pct + '%）' : '💸 本月弹性消费已用 ' + al.pct + '%') +
        '<button class="btn" id="alFlex">查看</button></div>';
    }
    // 周日复盘提醒
    if (now.getDay() === 0) {
      var tw = U.dstr(U.sow(now));
      if (!st.reviews.some(function (r) { return r.weekStart === tw; })) {
        out += '<div class="alert info">🗓 今天是周日，别忘了完成本周复盘' +
          '<button class="btn" id="alRv">去复盘</button></div>';
      }
    }
    // 逾期任务
    var over = st.tasks.filter(function (t) { return t.status !== '已完成' && t.due && t.due < U.today(); });
    if (over.length >= 3) {
      out += '<div class="alert danger">⚠️ 有 ' + over.length + ' 项学习任务已逾期，建议重排计划' +
        '<button class="btn" id="alOver">查看</button></div>';
    }
    z.innerHTML = out;
    var q;
    if ((q = z.querySelector('#alCheck'))) q.onclick = function () { Study.checkinForm(); };
    if ((q = z.querySelector('#alFlex'))) q.onclick = function () { Fin.goto('budget'); App.go('finance'); };
    if ((q = z.querySelector('#alRv'))) q.onclick = function () { App.go('review'); };
    if ((q = z.querySelector('#alOver'))) q.onclick = function () { Study.goto('tasks', 'list'); App.go('study'); };
  };

  /* ---------- 每日 22:30 通知 ---------- */
  function tick() {
    var st = S.get();
    var now = new Date();
    var rt = (st.settings.reminderTime || '22:30').split(':');
    if (now.getHours() === +rt[0] && now.getMinutes() === +rt[1]) {
      if (st._lastRemind !== U.today() && !S.q.todayCheckin()) {
        st._lastRemind = U.today(); S.save();
        if (st.settings.notify && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('植物生长日记 · 学习打卡', {
              body: '到 ' + st.settings.reminderTime + ' 了，记录今天的学习时长与薄弱考点吧。',
              icon: 'icons/icon.svg', tag: 'daily-checkin'
            });
          } catch (e) { }
        }
        UI.toast('⏰ 该填写今日学习打卡了');
        App.alerts();
      }
    }
    // 跨天刷新
    if (App._day !== U.today()) { App._day = U.today(); App.render(); }
  }

  /* ---------- 安装 ---------- */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferredPrompt = e;
  });
  App.install = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (r) {
        if (r.outcome === 'accepted') UI.toast('安装成功，去桌面看看吧', 'ok');
        deferredPrompt = null;
      });
    } else {
      UI.sheet({
        title: '添加到手机桌面',
        body: '<p style="font-size:14px;line-height:2">' +
          '<b>安卓 / 鸿蒙浏览器</b><br>点击浏览器右上角菜单 →「添加到主屏幕」或「安装应用」<br><br>' +
          '<b>iPhone / iPad（Safari）</b><br>点击底部「分享」按钮 → 下滑选择「添加到主屏幕」→ 确认<br><br>' +
          '<b>电脑 Chrome / Edge</b><br>点击地址栏右侧的「安装」图标<br><br>' +
          '<span style="color:var(--text-3);font-size:12.5px">安装后可离线使用，数据保存在本机，永久免费。</span></p>',
        footer: '<button class="btn btn-primary btn-block" data-x>知道了</button>'
      });
    }
  };

  /* ---------- 启动 ---------- */
  function boot() {
    App._day = U.today();
    var mb = document.getElementById('menuBtn');
    if (mb) mb.onclick = function () { openDrawer(); };
    var bd = document.getElementById('backdrop');
    if (bd) bd.onclick = function () { closeDrawer(); };
    S.sub(function () { App.render(); });
    App.render();
    Review.ensureDigests();
    setInterval(tick, 20000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { App.alerts(); if (App._day !== U.today()) { App._day = U.today(); App.render(); } }
    });
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    }
  }
  g.App = App;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
