/* ========== 第三板块：长期生活配套目标 ========== */
(function (g) {
  var L = {};
  var C = S.C;
  var ui = { tab: 'board' };
  var TYPE_ICON = { '作息': '🌙', '运动': '🏃', '体检': '🩺', '其他': '🎯' };

  /* ---------------- 表单 ---------------- */
  L.itemForm = function (rec) {
    var st = S.get(), isNew = !rec;
    var it = rec || { id: '', name: '', type: '作息', date: '', cycle: '每周', target: '', note: '', done: false };
    UI.form({
      title: isNew ? '新增生活配套目标' : '编辑目标',
      fields: [
        { key: 'name', label: '事项名称', type: 'text', value: it.name, required: true, placeholder: '例：23:30 前上床睡觉 / 每周跑步 3 次 / 年度体检' },
        { key: 'type', label: '类别', type: 'options', value: it.type, options: C.HEALTH },
        { key: 'cycle', label: '周期', type: 'select', value: it.cycle, options: ['每日', '每周', '每月', '每季度', '每年', '一次性'] },
        { key: 'target', label: '目标描述', type: 'text', value: it.target, placeholder: '例：每周 3 次，每次 30 分钟', half: true },
        { key: 'date', label: '关键日期', type: 'date', value: it.date, half: true },
        { key: 'note', label: '备注', type: 'textarea', value: it.note, placeholder: '医院、项目、注意事项…' },
        { key: 'done', label: '', type: 'checkbox', value: it.done, text: '已完成 / 已达成' }
      ],
      onDelete: isNew ? null : function () {
        st.life.items = st.life.items.filter(function (x) { return x.id !== it.id; });
        S.commit(); UI.toast('已删除');
      },
      onSubmit: function (v) {
        if (isNew) { v.id = U.uid(); st.life.items.unshift(v); UI.toast('已添加', 'ok'); }
        else { var i = st.life.items.findIndex(function (x) { return x.id === it.id; }); v.id = it.id; st.life.items[i] = v; UI.toast('已保存', 'ok'); }
        S.commit();
      }
    });
  };

  L.logForm = function (rec) {
    var st = S.get(), isNew = !rec;
    var today = U.today();
    var ex = rec || st.life.logs.filter(function (l) { return l.date === today; })[0];
    if (ex && !rec) isNew = false;
    var l = ex || { id: '', date: today, sleepAt: '23:30', wakeAt: '07:00', sleepOk: true, sport: '', sportMin: 0, energy: 3, note: '' };
    UI.form({
      title: isNew ? '生活打卡' : '编辑生活打卡 · ' + l.date,
      fields: [
        { key: 'date', label: '日期', type: 'date', value: l.date, half: true },
        { key: 'energy', label: '精力评分', type: 'select', value: String(l.energy), options: ['1', '2', '3', '4', '5'], half: true },
        { key: 'sleepAt', label: '入睡时间', type: 'time', value: l.sleepAt, half: true },
        { key: 'wakeAt', label: '起床时间', type: 'time', value: l.wakeAt, half: true },
        { key: 'sleepOk', label: '', type: 'checkbox', value: l.sleepOk, text: '🌙 今日作息达标' },
        { key: 'sport', label: '运动内容', type: 'text', value: l.sport, placeholder: '例：慢跑 / 跳绳 / 拉伸', half: true },
        { key: 'sportMin', label: '运动时长（分钟）', type: 'number', value: l.sportMin, min: 0, inputmode: 'numeric', half: true },
        { key: 'note', label: '状态备注', type: 'textarea', value: l.note, placeholder: '今天精力如何？有什么干扰因素？' }
      ],
      onDelete: isNew ? null : function () {
        st.life.logs = st.life.logs.filter(function (x) { return x.id !== l.id; });
        S.commit(); UI.toast('已删除');
      },
      onSubmit: function (v) {
        v.sportMin = Number(v.sportMin) || 0;
        v.energy = Number(v.energy) || 3;
        var dup = st.life.logs.filter(function (x) { return x.date === v.date && x.id !== l.id; })[0];
        if (dup && isNew) { UI.toast('当天已有记录，请编辑', 'err'); return false; }
        if (isNew) { v.id = U.uid(); st.life.logs.unshift(v); UI.toast('已记录', 'ok'); }
        else { var i = st.life.logs.findIndex(function (x) { return x.id === l.id; }); v.id = l.id; if (i < 0) st.life.logs.unshift(v); else st.life.logs[i] = v; UI.toast('已保存', 'ok'); }
        st.life.logs.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
        S.commit();
        if (isNew) {
          if (v.sleepOk) S.drop(1, '今日作息达标', '生活', '🌙');
          if ((Number(v.sportMin) || 0) > 0) S.drop(1, '完成今日运动', '生活', '🏃');
        }
      }
    });
  };

  /* ---------------- 页面 ---------------- */
  function boardPage() {
    var st = S.get(), w = S.l.weekScore();
    var nc = S.l.nextCheckup();
    var todayLog = st.life.logs.filter(function (l) { return l.date === U.today(); })[0];

    var h = '<div class="card"><div class="card-h"><h3>本周生活状态</h3><span class="hint">' + U.wkLabel(new Date()) + '</span></div>' +
      '<div class="row" style="margin-bottom:10px"><b style="font-size:27px;color:var(--life)" class="num">' + w.score + '%</b>' +
      '<span class="tiny muted">综合达成率</span></div>' + UI.progressBar(w.score) +
      '<div style="height:12px"></div><div class="grid3">' +
      cell('🏃 运动', w.sport + '/' + w.sportGoal + ' 次') +
      cell('🌙 作息达标', w.sleepOk + '/' + w.sleepGoal + ' 天') +
      cell('🩺 下次体检', nc ? nc.date.slice(5) : '未设置') +
      '</div></div>';

    h += '<div class="card"><div class="card-h"><h3>今日生活打卡</h3></div>' +
      (todayLog
        ? '<div class="row wrap" style="gap:8px;margin-bottom:9px">' +
        '<span class="chip">🌙 ' + todayLog.sleepAt + ' → ' + todayLog.wakeAt + '</span>' +
        '<span class="chip ' + (todayLog.sleepOk ? 'ok' : 'warn') + '">' + (todayLog.sleepOk ? '作息达标' : '作息未达标') + '</span>' +
        (todayLog.sportMin ? '<span class="chip ok">🏃 ' + U.esc(todayLog.sport || '运动') + ' ' + todayLog.sportMin + '分</span>' : '<span class="chip mute">今日未运动</span>') +
        '<span class="chip">⚡ 精力 ' + todayLog.energy + '/5</span></div>' +
        (todayLog.note ? '<div class="t-note">' + U.nl2br(todayLog.note) + '</div>' : '') +
        '<button class="btn btn-sm btn-block" style="margin-top:9px" id="editLog">编辑今日记录</button>'
        : '<button class="btn btn-primary btn-block" id="addLog">🌙 记录今日作息与运动</button>') +
      '</div>';

    h += '<div class="toolbar"><b style="font-size:14px">长期目标清单</b><span class="spacer"></span>' +
      '<button class="btn btn-sm btn-primary" id="addItem">＋ 新目标</button></div>';
    if (!st.life.items.length) {
      h += UI.empty('🌱', '还没有生活配套目标<br>建议先加：固定作息、每周运动、年度体检');
    } else {
      C.HEALTH.forEach(function (tp) {
        var items = st.life.items.filter(function (i) { return i.type === tp; });
        if (!items.length) return;
        h += '<div class="sec-t">' + TYPE_ICON[tp] + ' ' + tp + '</div>' + items.map(function (i) {
          return '<div class="task ' + (i.done ? 'done' : '') + '"><div class="tick ' + (i.done ? 'on' : '') + '" data-ltick="' + i.id + '">' + (i.done ? '✓' : '') + '</div>' +
            '<div class="t-body" data-litem="' + i.id + '"><div class="t-title">' + U.esc(i.name) + '</div>' +
            '<div class="t-tags"><span class="chip">' + U.esc(i.cycle) + '</span>' +
            (i.target ? '<span class="chip mute">' + U.esc(i.target) + '</span>' : '') +
            (i.date ? '<span class="chip ' + (i.date < U.today() && !i.done ? 'danger' : 'mute') + '">📅 ' + i.date + '</span>' : '') +
            '</div>' + (i.note ? '<div class="t-note">' + U.esc(i.note.slice(0, 50)) + '</div>' : '') +
            '</div></div>';
        }).join('');
      });
    }
    return h;
  }
  function cell(l, v) {
    return '<div style="background:var(--surface-2);border-radius:10px;padding:9px;text-align:center">' +
      '<div class="tiny muted">' + l + '</div><b class="num" style="font-size:15px">' + v + '</b></div>';
  }

  function logsPage() {
    var st = S.get();
    if (!st.life.logs.length) return UI.empty('📔', '暂无生活记录');
    return '<div class="tw"><table class="t"><thead><tr>' +
      ['日期', '入睡', '起床', '作息', '运动', '时长', '精力', '备注'].map(function (x) { return '<th>' + x + '</th>'; }).join('') +
      '</tr></thead><tbody>' + st.life.logs.slice(0, 90).map(function (l) {
        return '<tr data-llog="' + l.id + '" style="cursor:pointer">' +
          '<td><b>' + l.date.slice(5) + '</b> <span class="tiny muted">周' + U.wdOf(l.date) + '</span></td>' +
          '<td class="num">' + (l.sleepAt || '—') + '</td><td class="num">' + (l.wakeAt || '—') + '</td>' +
          '<td>' + (l.sleepOk ? '<span class="chip ok">达标</span>' : '<span class="chip warn">超时</span>') + '</td>' +
          '<td>' + U.esc(l.sport || '—') + '</td><td class="num">' + (l.sportMin || 0) + '分</td>' +
          '<td class="num">' + l.energy + '/5</td>' +
          '<td class="tiny muted">' + U.esc((l.note || '').slice(0, 20)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  L.render = function (el) {
    var h = '<div class="row" style="margin-bottom:12px">' +
      UI.seg([{ v: 'board', l: '目标看板' }, { v: 'logs', l: '打卡记录' }], ui.tab, 'ltab') + '</div>';
    h += ui.tab === 'board' ? boardPage() : logsPage();
    el.innerHTML = h;

    UI.bindSeg(el, 'ltab', function (v) { ui.tab = v; L.render(el); });
    var st = S.get(), q;
    if ((q = el.querySelector('#addItem'))) q.onclick = function () { L.itemForm(); };
    if ((q = el.querySelector('#addLog'))) q.onclick = function () { L.logForm(); };
    if ((q = el.querySelector('#editLog'))) q.onclick = function () { L.logForm(st.life.logs.filter(function (l) { return l.date === U.today(); })[0]); };
    U.$$('[data-litem]', el).forEach(function (b) {
      b.onclick = function () { var i = st.life.items.filter(function (x) { return x.id === b.dataset.litem; })[0]; if (i) L.itemForm(i); };
    });
    U.$$('[data-ltick]', el).forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var i = st.life.items.filter(function (x) { return x.id === b.dataset.ltick; })[0];
        if (!i) return;
        var willDone = !i.done;
        i.done = willDone; S.commit();
        if (willDone) S.drop(i.type === '体检' ? 2 : 1, '达成生活目标：' + (i.name || i.type), '生活', i.type === '体检' ? '🩺' : '🌱');
      };
    });
    U.$$('[data-llog]', el).forEach(function (b) {
      b.onclick = function () { var l = st.life.logs.filter(function (x) { return x.id === b.dataset.llog; })[0]; if (l) L.logForm(l); };
    });
  };

  L.goto = function (t) { ui.tab = t || 'board'; };
  g.Life = L;
})(window);
