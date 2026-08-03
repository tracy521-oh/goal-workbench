/* ========== 作家成长路：小说创作 · 章节管理 · 创作日历 ========== */
(function (g) {
  var W = {};
  var ui = { tab: 'chapters', editId: null, calMonth: U.mstr() };
  var curEl = null;

  function wordCount(s) { return (s || '').replace(/\s/g, '').length; }

  /* ---------------- 主渲染 ---------------- */
  W.render = function (el) {
    curEl = el;
    var st = S.get(), w = st.writer;
    var total = U.sum(w.chapters, function (c) { return c.words || 0; });
    var todayWords = w.log[U.today()] || 0;

    var h = '<div class="card wr-head">' +
      '<div class="row" style="gap:10px">' +
      '<input class="wr-title" id="bookTitle" value="' + U.esc(w.title) + '" placeholder="小说书名">' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-sm btn-primary" id="dlDoc">⬇ 下载 Word</button>' +
      '</div>' +
      '<div class="wr-stats">总字数 <b class="num">' + total + '</b> · 章节 <b>' + w.chapters.length + '</b> · 今日创作 <b class="' + (todayWords >= 2000 ? 'pos' : '') + '">' + todayWords + '</b> 字</div>' +
      '</div>';

    h += '<div class="row" style="margin-bottom:12px">' +
      UI.seg([{ v: 'chapters', l: '章节管理' }, { v: 'calendar', l: '创作日历' }], ui.tab, 'wtab') + '</div>';

    if (ui.tab === 'chapters') {
      if (ui.editId) {
        var ch = w.chapters.filter(function (x) { return x.id === ui.editId; })[0];
        if (ch) h += editor(ch, total);
        else { ui.editId = null; h += chaptersList(w.chapters, total); }
      } else {
        h += chaptersList(w.chapters, total);
      }
    } else {
      h += calendarPage();
    }
    el.innerHTML = h;

    /* 事件绑定 */
    UI.bindSeg(el, 'wtab', function (v) { ui.tab = v; ui.editId = null; W.render(el); });
    var bt = el.querySelector('#bookTitle');
    if (bt) bt.onchange = function () { st.writer.title = bt.value.trim() || '我的小说'; S.save(); UI.toast('书名已更新', 'ok'); };
    var dl = el.querySelector('#dlDoc'); if (dl) dl.onclick = function () { downloadDoc(); };

    if (ui.tab === 'chapters') {
      var ac = el.querySelector('#addCh'); if (ac) ac.onclick = function () { chapterForm(); };
      U.$$('[data-ech]', el).forEach(function (b) {
        b.onclick = function () { ui.editId = b.dataset.ech; W.render(el); };
      });
      if (ui.editId) bindEditor(el);
    } else {
      var wp = el.querySelector('#wPrev'), wn = el.querySelector('#wNext');
      if (wp) wp.onclick = function () { ui.calMonth = shiftM(ui.calMonth, -1); W.render(el); };
      if (wn) wn.onclick = function () { ui.calMonth = shiftM(ui.calMonth, 1); W.render(el); };
      U.$$('[data-wday]', el).forEach(function (b) {
        b.onclick = function () { daySheet(b.dataset.wday); };
      });
    }
  };

  /* ---------------- 章节列表 ---------------- */
  function chaptersList(list, total) {
    var st = S.get(), w = st.writer, today = U.today();
    var head = '<div class="toolbar"><b style="font-size:14px">全部章节</b><span class="spacer"></span>' +
      '<button class="btn btn-primary btn-sm" id="addCh">＋ 新增章节</button></div>';
    if (!list.length) return head + UI.empty('✍️', '还没有章节<br>点「新增章节」开始创作你的故事');
    return head + list.map(function (c, i) {
      var updated = c.updatedAt === today;
      return '<div class="task" data-ech="' + c.id + '" style="cursor:pointer">' +
        '<div class="t-body"><div class="row"><b style="font-size:14px">第 ' + (i + 1) + ' 章 · ' + U.esc(c.title || '未命名') + '</b>' +
        '<span class="spacer"></span>' + (updated ? '<span class="chip ok">今日更新</span>' : '') + '</div>' +
        '<div class="t-tags"><span class="chip mute">' + (c.words || 0) + ' 字</span>' +
        (c.updatedAt ? '<span class="chip mute">📅 ' + c.updatedAt.slice(5) + '</span>' : '') + '</div>' +
        (c.content ? '<div class="t-note">' + U.esc(c.content.replace(/\s/g, '').slice(0, 48) || '') + (c.content.replace(/\s/g, '').length > 48 ? '…' : '') + '</div>' : '') +
        '</div></div>';
    }).join('') + '<p class="tiny muted" style="margin-top:8px">点章节进入编辑；正文自动保存，每次新增的字数会累计到当日创作量。</p>';
  }

  /* ---------------- 章节编辑器 ---------------- */
  function editor(ch, total) {
    return '<div class="card wr-edit">' +
      '<div class="row" style="margin-bottom:10px"><button class="btn btn-sm" id="backCh">‹ 返回</button>' +
      '<span class="spacer"></span><span class="tiny muted" id="wrWords">' + (ch.words || 0) + ' 字</span>' +
      '<button class="btn btn-sm btn-danger" id="delCh" style="margin-left:8px">删除章节</button></div>' +
      '<input class="wr-ch-title" id="chTitle" value="' + U.esc(ch.title || '') + '" placeholder="章节标题">' +
      '<textarea id="chBody" class="wr-area" placeholder="在这里自由创作吧……每一段文字，都在浇灌你的生命之树。">' + U.esc(ch.content || '') + '</textarea>' +
      '<p class="tiny muted" style="margin-top:6px">正文自动保存。当日累计新增字数满 2000，自动获得「一壶水」奖励（+10 滴水）。</p>' +
      '</div>';
  }

  function bindEditor(el) {
    var st = S.get();
    var ch = st.writer.chapters.filter(function (x) { return x.id === ui.editId; })[0];
    if (!ch) return;
    var back = el.querySelector('#backCh');
    if (back) back.onclick = function () { ui.editId = null; W.render(el); };
    var title = el.querySelector('#chTitle');
    if (title) title.oninput = function () { ch.title = title.value; S.save(); };
    var ta = el.querySelector('#chBody');
    var lbl = el.querySelector('#wrWords');
    if (ta) {
      var tm;
      ta.oninput = function () {
        clearTimeout(tm);
        tm = setTimeout(function () {
          var content = ta.value;
          var newWords = wordCount(content);
          var delta = Math.max(0, newWords - (ch.words || 0));
          ch.content = content;
          ch.words = newWords;
          ch.updatedAt = U.today();
          if (delta > 0) S.writerAddWords(delta);
          S.commit();
          if (lbl) lbl.textContent = newWords + ' 字';
          // 同步顶部今日字数
          var tw = el.querySelector('#bookTitle'); // no-op keep reference
        }, 600);
      };
    }
    var del = el.querySelector('#delCh');
    if (del) del.onclick = function () {
      if (!confirm('确定删除《' + (ch.title || '未命名') + '》这一章？内容不可恢复。')) return;
      st.writer.chapters = st.writer.chapters.filter(function (x) { return x.id !== ch.id; });
      ui.editId = null; S.commit(); UI.toast('已删除'); W.render(el);
    };
  }

  /* ---------------- 新增章节表单 ---------------- */
  W.chapterForm = function () {
    UI.form({
      title: '新增章节',
      fields: [
        { key: 'title', label: '章节标题', type: 'text', required: true, placeholder: '例：第一章 启程' }
      ],
      onSubmit: function (v) {
        var st = S.get();
        var ch = { id: U.uid(), title: v.title || '未命名章节', content: '', words: 0, updatedAt: U.today() };
        st.writer.chapters.push(ch); S.commit();
        ui.editId = ch.id; ui.tab = 'chapters'; UI.toast('章节已创建，开始写吧', 'ok');
        if (curEl) W.render(curEl);
      }
    });
  };

  /* ---------------- 创作日历 ---------------- */
  function calendarPage() {
    var w = S.get().writer;
    var ym = ui.calMonth.split('-'), y = +ym[0], mo = +ym[1];
    var first = new Date(y, mo - 1, 1);
    var start = U.sow(first);
    var cells = '';
    for (var i = 0; i < 42; i++) {
      var d = U.addDays(start, i), ds = U.dstr(d);
      var off = d.getMonth() !== mo - 1;
      var isToday = ds === U.today();
      var cnt = w.log[ds] || 0;
      var pot = cnt >= 2000;
      cells += '<div class="cal-d ' + (off ? 'off' : '') + ' ' + (isToday ? 'today' : '') + '" data-wday="' + ds + '">' +
        '<div class="dn">' + d.getDate() + '</div>' +
        (cnt ? '<div class="wr-cw' + (pot ? ' pot' : '') + '">' + cnt + ' 字' + (pot ? '<br>🪣 一壶水' : '') + '</div>' : '') +
        '</div>';
    }
    return '<div class="card"><div class="cal-h">' +
      '<button class="icon-btn" id="wPrev">‹</button><b>' + y + ' 年 ' + mo + ' 月</b>' +
      '<button class="icon-btn" id="wNext">›</button></div>' +
      '<div class="cal-grid">' + U.WD.map(function (x) { return '<div class="cal-w">' + x + '</div>'; }).join('') + cells + '</div>' +
      '<p class="tiny muted" style="margin-top:8px">当日创作字数 ≥ 2000 字，自动浇灌「一壶水」（+10 滴水）。点击日期查看当天更新的章节。</p></div>';
  }

  function daySheet(ds) {
    var w = S.get().writer;
    var chs = w.chapters.filter(function (c) { return c.updatedAt === ds; });
    UI.sheet({
      title: ds + ' 创作记录',
      body: (w.log[ds] ? '<div class="rv-auto">当日创作 <b>' + w.log[ds] + '</b> 字' +
        (w.log[ds] >= 2000 ? ' · 🪣 已浇灌一壶水 +10 滴水' : '') + '</div>' : '') +
        (chs.length ? chs.map(function (c) {
          return '<div class="task"><div class="t-body"><div class="t-title">' + U.esc(c.title || '未命名') + '</div>' +
            '<div class="tiny muted">' + (c.words || 0) + ' 字</div></div></div>';
        }).join('') : UI.empty('📝', '当天没有更新章节')),
      footer: '<button class="btn" data-x>关闭</button>'
    });
  }

  /* ---------------- 下载 Word（.doc） ---------------- */
  function downloadDoc() {
    var w = S.get().writer;
    if (!w.chapters.length) { UI.toast('还没有章节可下载', 'err'); return; }
    var e = U.esc;
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
      'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
      'xmlns="http://www.w3.org/TR/REC-html40"><head>' +
      '<meta charset="utf-8"><title>' + e(w.title) + '</title></head><body ' +
      'style="font-family:\'Microsoft YaHei\',SimSun,\'宋体\';line-height:1.9;max-width:800px;margin:0 auto;padding:24px">' +
      '<h1 style="text-align:center">' + e(w.title) + '</h1>';
    w.chapters.forEach(function (c, i) {
      html += '<h2 style="margin-top:28px">第 ' + (i + 1) + ' 章 ' + e(c.title || '') + '</h2>';
      html += '<div style="text-indent:2em">' + e(c.content || '').replace(/\n/g, '<br>') + '</div>';
    });
    html += '</body></html>';
    var blob = new Blob(['﻿' + html], { type: 'application/msword;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (w.title || '我的小说') + '.doc';
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 200);
    UI.toast('已生成 Word 文档 ⬇', 'ok');
  }

  function shiftM(m, n) { var a = m.split('-'); return U.mstr(new Date(+a[0], +a[1] - 1 + n, 1)); }

  g.Writer = W;
})(window);
