/* ========== 第一板块：公考备考专区 ========== */
(function (g) {
  var Study = {};
  var C = S.C;

  var ui = {
    tab: 'tasks',          // tasks | checkin | phase
    view: 'kanban',        // kanban | list | table | calendar
    groupBy: 'module',     // kanban 分组
    f: { module: '', exam: '', status: '', phase: '', kw: '', jlFeature: false },
    calMonth: U.mstr()
  };

  /* ---------------- 图片附件 ---------------- */
  UI.pickImage = function (cb) {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 900, w = img.width, h = img.height;
          if (w > max || h > max) { var s = max / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
          var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          var data = cv.toDataURL('image/jpeg', 0.68);
          if (data.length > 700000) { UI.toast('图片过大，请换一张更小的图', 'err'); return; }
          cb(data);
        };
        img.src = r.result;
      };
      r.readAsDataURL(f);
    };
    inp.click();
  };

  /* ---------------- 任务表单 ---------------- */
  Study.taskForm = function (task, presets) {
    var isNew = !task;
    var t = task || Object.assign({
      id: '', title: '', module: C.MODULES[0], estMin: 60, due: U.today(),
      status: '未开始', exam: '通用', jlFeature: false, phase: C.PHASES[0],
      note: '', link: '', img: ''
    }, presets || {});
    var img = t.img || '';

    UI.form({
      title: isNew ? '新增学习任务' : '编辑学习任务',
      fields: [
        { key: 'title', label: '任务名称', type: 'text', required: true, value: t.title, placeholder: '例：行测判断推理·图形推理专项 30题' },
        { key: 'module', label: '所属模块', type: 'options', value: t.module, options: C.MODULES },
        {
          key: 'exam', label: '考试标签', type: 'options', value: t.exam,
          options: [{ v: '通用', l: '通用' }, { v: '国考专项', l: '国考专项' }, { v: '吉林省考专项', l: '吉林省考专项', cls: 'jl' }]
        },
        { key: 'phase', label: '所属阶段', type: 'select', value: t.phase, options: C.PHASES },
        { key: 'estMin', label: '预估时长（分钟）', type: 'number', value: t.estMin, half: true, min: 0, inputmode: 'numeric' },
        { key: 'due', label: '截止日期', type: 'date', value: t.due, half: true },
        { key: 'status', label: '完成状态', type: 'options', value: t.status, options: C.STATUS },
        { key: 'jlFeature', label: '', type: 'checkbox', value: t.jlFeature, text: '⭐ 标记为「吉林省考特色考点」任务' },
        { key: 'note', label: '笔记', type: 'textarea', value: t.note, placeholder: '知识点要点、易错提醒…' },
        { key: 'link', label: '附件链接', type: 'url', value: t.link, placeholder: 'https:// 网课 / 题库 / 云笔记 链接' }
      ],
      extraBody:
        '<div class="f"><label>图片附件（错题拍照 / 笔记截图）</label>' +
        '<div id="imgBox">' + (img ? '<img src="' + img + '" style="max-width:100%;border-radius:10px;border:1px solid var(--border)">' : '') + '</div>' +
        '<div class="row" style="margin-top:7px"><button class="btn btn-sm" id="imgPick">选择图片</button>' +
        '<button class="btn btn-sm" id="imgClr">清除</button></div>' +
        '<div class="hint">图片会压缩后存在本机，建议只存关键错题</div></div>',
      onMount: function (m) {
        m.querySelector('#imgPick').onclick = function () {
          UI.pickImage(function (d) {
            img = d;
            m.querySelector('#imgBox').innerHTML = '<img src="' + d + '" style="max-width:100%;border-radius:10px;border:1px solid var(--border)">';
          });
        };
        m.querySelector('#imgClr').onclick = function () { img = ''; m.querySelector('#imgBox').innerHTML = ''; };
      },
      onDelete: isNew ? null : function () {
        var st = S.get();
        st.tasks = st.tasks.filter(function (x) { return x.id !== t.id; });
        S.commit(); UI.toast('已删除');
      },
      onSubmit: function (v) {
        var st = S.get();
        v.img = img;
        v.estMin = Number(v.estMin) || 0;
        if (isNew) {
          v.id = U.uid(); v.createdAt = U.today();
          v.doneAt = v.status === '已完成' ? U.today() : '';
          st.tasks.unshift(v);
          UI.toast('任务已添加', 'ok');
        } else {
          var i = st.tasks.findIndex(function (x) { return x.id === t.id; });
          v.id = t.id; v.createdAt = t.createdAt;
          v.doneAt = v.status === '已完成' ? (t.doneAt || U.today()) : '';
          st.tasks[i] = v;
          UI.toast('已保存', 'ok');
        }
        S.commit();
      }
    });
  };

  /* ---------------- 每日打卡表单 ---------------- */
  Study.checkinForm = function (rec) {
    var st = S.get();
    var isNew = !rec;
    var c = rec || S.q.todayCheckin();
    if (c) isNew = false;
    c = c || {
      id: '', date: U.today(), minutes: 120, content: '', weak: '', wrongLink: '',
      qCount: 0, qRight: 0, exam: '通用', mood: 3, img: ''
    };
    var img = c.img || '';

    UI.form({
      title: isNew ? '学习打卡' : '编辑打卡记录 · ' + c.date,
      fields: [
        { key: 'date', label: '日期', type: 'date', value: c.date, half: true },
        { key: 'minutes', label: '学习时长（分钟）', type: 'number', value: c.minutes, half: true, min: 0, inputmode: 'numeric' },
        {
          key: 'exam', label: '今日主攻', type: 'options', value: c.exam,
          options: [{ v: '通用', l: '通用' }, { v: '国考专项', l: '国考' }, { v: '吉林省考专项', l: '吉林省考', cls: 'jl' }]
        },
        { key: 'content', label: '完成内容', type: 'textarea', value: c.content, required: true, placeholder: '例：行测资料分析 2 套 + 申论归纳概括 1 题 + 时政 20 条' },
        { key: 'qCount', label: '刷题总数', type: 'number', value: c.qCount, half: true, min: 0, inputmode: 'numeric' },
        { key: 'qRight', label: '正确题数', type: 'number', value: c.qRight, half: true, min: 0, inputmode: 'numeric' },
        { key: 'weak', label: '薄弱考点', type: 'textarea', value: c.weak, placeholder: '例：资料分析·增长率速算不熟；申论对策题踩点不全' },
        { key: 'wrongLink', label: '错题链接', type: 'url', value: c.wrongLink, placeholder: 'https:// 错题本 / 题库收藏夹' },
        { key: 'mood', label: '今日状态（1-5）', type: 'options', value: String(c.mood), options: ['1', '2', '3', '4', '5'] }
      ],
      extraBody:
        '<div class="f"><label>错题截图（可选）</label><div id="ciBox">' +
        (img ? '<img src="' + img + '" style="max-width:100%;border-radius:10px;border:1px solid var(--border)">' : '') +
        '</div><div class="row" style="margin-top:7px"><button class="btn btn-sm" id="ciPick">选择图片</button>' +
        '<button class="btn btn-sm" id="ciClr">清除</button></div></div>',
      onMount: function (m) {
        m.querySelector('#ciPick').onclick = function () {
          UI.pickImage(function (d) { img = d; m.querySelector('#ciBox').innerHTML = '<img src="' + d + '" style="max-width:100%;border-radius:10px;border:1px solid var(--border)">'; });
        };
        m.querySelector('#ciClr').onclick = function () { img = ''; m.querySelector('#ciBox').innerHTML = ''; };
      },
      onDelete: isNew ? null : function () {
        st.checkins = st.checkins.filter(function (x) { return x.id !== c.id; });
        S.commit(); UI.toast('已删除');
      },
      onSubmit: function (v) {
        v.img = img;
        v.minutes = Number(v.minutes) || 0;
        v.qCount = Number(v.qCount) || 0;
        v.qRight = Number(v.qRight) || 0;
        if (v.qRight > v.qCount) { UI.toast('正确题数不能大于刷题总数', 'err'); return false; }
        var exist = st.checkins.filter(function (x) { return x.date === v.date && x.id !== c.id; })[0];
        if (exist && isNew) { UI.toast('当天已有打卡记录，请直接编辑', 'err'); return false; }
        if (isNew) { v.id = U.uid(); st.checkins.unshift(v); UI.toast('打卡成功，继续加油！', 'ok'); }
        else {
          var i = st.checkins.findIndex(function (x) { return x.id === c.id; });
          v.id = c.id; if (i < 0) { st.checkins.unshift(v); } else { st.checkins[i] = v; }
          UI.toast('已保存', 'ok');
        }
        st.checkins.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
        st._lastRemind = U.today();
        S.commit();
      }
    });
  };

  /* ---------------- 任务卡片 ---------------- */
  function taskCard(t) {
    var over = t.status !== '已完成' && t.due && t.due < U.today();
    var tickCls = t.status === '已完成' ? 'tick on' : (t.status === '进行中' ? 'tick doing' : 'tick');
    var tickTxt = t.status === '已完成' ? '✓' : (t.status === '进行中' ? '·' : '');
    return '<div class="task ' + (t.status === '已完成' ? 'done' : '') + ' ' + (over ? 'overdue' : '') + '" data-tid="' + t.id + '">' +
      '<div class="' + tickCls + '" data-tick="' + t.id + '">' + tickTxt + '</div>' +
      '<div class="t-body" data-edit="' + t.id + '">' +
      '<div class="t-title">' + U.esc(t.title) + '</div>' +
      '<div class="t-tags">' +
      '<span class="chip">' + (C.MODULE_ICON[t.module] || '') + ' ' + U.esc(t.module) + '</span>' +
      (t.exam === '国考专项' ? '<span class="chip gk">国考</span>' : '') +
      (t.exam === '吉林省考专项' ? '<span class="chip jl">吉林省考</span>' : '') +
      (t.jlFeature ? '<span class="chip feat">⭐吉林特色考点</span>' : '') +
      (t.estMin ? '<span class="chip mute">⏱ ' + t.estMin + '分</span>' : '') +
      (t.due ? '<span class="chip ' + (over ? 'danger' : 'mute') + '">📅 ' + t.due.slice(5) + (over ? ' 逾期' : '') + '</span>' : '') +
      (t.link ? '<span class="chip mute">🔗</span>' : '') +
      (t.img ? '<span class="chip mute">🖼</span>' : '') +
      '</div>' +
      (t.note ? '<div class="t-note">' + U.esc(t.note.slice(0, 60)) + (t.note.length > 60 ? '…' : '') + '</div>' : '') +
      '</div></div>';
  }

  /* ---------------- 视图渲染 ---------------- */
  function filterBar() {
    return '<div class="toolbar">' +
      '<div class="search"><span>🔍</span><input id="kw" placeholder="搜索任务" value="' + U.esc(ui.f.kw) + '"></div>' +
      '<button class="btn btn-primary btn-sm" id="addTask">＋ 新任务</button>' +
      '</div>' +
      '<div class="filters" style="margin-bottom:10px">' +
      sel('fModule', ['全部模块'].concat(C.MODULES), ui.f.module) +
      sel('fExam', ['全部标签', '通用', '国考专项', '吉林省考专项'], ui.f.exam) +
      sel('fStatus', ['全部状态'].concat(C.STATUS), ui.f.status) +
      sel('fPhase', ['全部阶段'].concat(C.PHASES), ui.f.phase) +
      '<button class="btn btn-sm ' + (ui.f.jlFeature ? 'btn-primary' : '') + '" id="fFeat">⭐特色考点</button>' +
      '</div>';
  }
  function sel(id, opts, cur) {
    return '<select id="' + id + '">' + opts.map(function (o, i) {
      var v = i === 0 ? '' : o;
      return '<option value="' + U.esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + U.esc(o) + '</option>';
    }).join('') + '</select>';
  }

  function viewKanban(list) {
    var keys = ui.groupBy === 'module' ? C.MODULES : (ui.groupBy === 'status' ? C.STATUS : C.PHASES);
    var gk = ui.groupBy === 'module' ? 'module' : (ui.groupBy === 'status' ? 'status' : 'phase');
    return '<div class="row" style="margin-bottom:8px"><span class="tiny muted">分组：</span>' +
      UI.seg([{ v: 'module', l: '按模块' }, { v: 'status', l: '按状态' }, { v: 'phase', l: '按阶段' }], ui.groupBy, 'gb') +
      '</div><div class="kanban">' +
      keys.map(function (k) {
        var items = list.filter(function (t) { return t[gk] === k; });
        return '<div class="kcol"><div class="kcol-h"><b>' +
          (gk === 'module' ? (C.MODULE_ICON[k] || '') + ' ' : '') + U.esc(k) +
          '</b><span class="n">' + items.length + '</span></div>' +
          items.map(taskCard).join('') +
          '<button class="kadd" data-add="' + U.esc(k) + '" data-gk="' + gk + '">＋ 添加</button></div>';
      }).join('') + '</div>';
  }

  function viewList(list) {
    if (!list.length) return UI.empty('📝', '暂无任务');
    var byM = U.groupBy(list, function (t) { return t.module; });
    return C.MODULES.filter(function (m) { return byM[m]; }).map(function (m) {
      return '<div class="sec-t">' + (C.MODULE_ICON[m] || '') + ' ' + m + ' · ' + byM[m].length + ' 项</div>' +
        byM[m].map(taskCard).join('');
    }).join('');
  }

  function viewTable(list) {
    if (!list.length) return UI.empty('📊', '暂无任务');
    return '<div class="tw"><table class="t"><thead><tr>' +
      ['任务名称', '模块', '阶段', '预估时长', '截止日期', '状态', '标签', '笔记/附件'].map(function (h) { return '<th>' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' + list.map(function (t) {
        var over = t.status !== '已完成' && t.due && t.due < U.today();
        return '<tr data-edit="' + t.id + '" style="cursor:pointer">' +
          '<td><b>' + U.esc(t.title) + '</b></td>' +
          '<td>' + U.esc(t.module) + '</td>' +
          '<td class="tiny muted">' + U.esc(t.phase || '') + '</td>' +
          '<td class="num">' + (t.estMin || 0) + ' 分</td>' +
          '<td class="num ' + (over ? 'neg' : '') + '">' + U.esc(t.due || '—') + '</td>' +
          '<td><span class="chip ' + (t.status === '已完成' ? 'ok' : t.status === '进行中' ? 'warn' : '') + '">' + t.status + '</span></td>' +
          '<td>' + (t.exam === '国考专项' ? '<span class="chip gk">国考</span>' : t.exam === '吉林省考专项' ? '<span class="chip jl">吉林</span>' : '<span class="chip mute">通用</span>') +
          (t.jlFeature ? ' <span class="chip feat">⭐</span>' : '') + '</td>' +
          '<td class="tiny muted">' + U.esc((t.note || '').slice(0, 24)) + (t.link ? ' 🔗' : '') + (t.img ? ' 🖼' : '') + '</td>' +
          '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  function viewCalendar(list) {
    var ym = ui.calMonth.split('-'), y = +ym[0], mo = +ym[1];
    var first = new Date(y, mo - 1, 1);
    var start = U.sow(first);
    var st = S.get();
    var cells = '';
    for (var i = 0; i < 42; i++) {
      var d = U.addDays(start, i), ds = U.dstr(d);
      var off = d.getMonth() !== mo - 1;
      var isToday = ds === U.today();
      var ts = list.filter(function (t) { return t.due === ds; });
      var ci = st.checkins.filter(function (c) { return c.date === ds; })[0];
      cells += '<div class="cal-d ' + (off ? 'off' : '') + ' ' + (isToday ? 'today' : '') + '" data-day="' + ds + '">' +
        '<div class="dn">' + d.getDate() + '</div>' +
        ts.slice(0, 3).map(function (t) {
          return '<div class="cal-t ' + (t.status === '已完成' ? 'done' : (t.exam === '吉林省考专项' ? 'jl' : '')) + '">' + U.esc(t.title.slice(0, 8)) + '</div>';
        }).join('') +
        (ts.length > 3 ? '<div class="tiny muted">+' + (ts.length - 3) + '</div>' : '') +
        (ci ? '<div class="cal-dot"><i title="已打卡"></i></div>' : '') +
        '</div>';
    }
    return '<div class="card"><div class="cal-h">' +
      '<button class="icon-btn" id="calPrev">‹</button><b>' + y + ' 年 ' + mo + ' 月</b>' +
      '<button class="icon-btn" id="calNext">›</button></div>' +
      '<div class="cal-grid">' + U.WD.map(function (w) { return '<div class="cal-w">' + w + '</div>'; }).join('') + cells + '</div>' +
      '<p class="tiny muted" style="margin-top:8px">绿点 = 当日已完成学习打卡；点击日期查看/添加任务</p></div>';
  }

  /* ---------------- 打卡记录页 ---------------- */
  function checkinPage() {
    var st = S.get();
    var w = S.q.weekStudy();
    var today = S.q.todayCheckin();
    var goal = st.settings.dailyStudyGoal || 240;
    var h = '';
    h += '<div class="card"><div class="card-h"><h3>今日打卡</h3><span class="hint">目标 ' + U.mins(goal) + '</span></div>';
    if (today) {
      h += '<div class="row" style="gap:12px;margin-bottom:8px"><div><div class="tiny muted">学习时长</div><b style="font-size:19px" class="num">' + U.hrs(today.minutes) + ' h</b></div>' +
        '<div><div class="tiny muted">刷题</div><b style="font-size:19px" class="num">' + today.qCount + ' 题</b></div>' +
        '<div><div class="tiny muted">正确率</div><b style="font-size:19px" class="num">' + (today.qCount ? Math.round(today.qRight / today.qCount * 100) : 0) + '%</b></div></div>' +
        UI.progressBar(U.pct(today.minutes, goal)) +
        '<div class="t-note" style="margin-top:8px">' + U.nl2br(today.content) + '</div>' +
        '<button class="btn btn-sm btn-block" style="margin-top:10px" id="editToday">编辑今日打卡</button>';
    } else {
      h += '<p class="tiny muted" style="margin-bottom:10px">今天还没有打卡，记录一下今天学了什么吧。</p>' +
        '<button class="btn btn-primary btn-block" id="doCheckin">✅ 立即打卡</button>';
    }
    h += '</div>';

    h += '<div class="card"><div class="card-h"><h3>本周学习汇总</h3><span class="hint">' + U.wkLabel(new Date()) + '</span></div>' +
      '<div class="grid3">' +
      stat('学习时长', U.hrs(w.minutes) + ' h') + stat('打卡天数', w.days + ' / 7') + stat('刷题量', w.qCount + ' 题') +
      '</div><div style="height:10px"></div><div class="grid3">' +
      stat('正确题数', w.qRight + ' 题') + stat('正确率', w.rate + '%') + stat('日均时长', (w.days ? U.hrs(w.minutes / w.days) : '0.0') + ' h') +
      '</div></div>';

    h += '<div class="sec-t">历史打卡记录</div>';
    if (!st.checkins.length) h += UI.empty('📅', '暂无打卡记录');
    else h += st.checkins.slice(0, 60).map(function (c) {
      var rate = c.qCount ? Math.round(c.qRight / c.qCount * 100) : null;
      return '<div class="task" data-ci="' + c.id + '"><div class="t-body">' +
        '<div class="row"><b style="font-size:13.5px">' + c.date + ' 周' + U.wdOf(c.date) + '</b><span class="spacer"></span>' +
        '<span class="chip ok">' + U.hrs(c.minutes) + ' h</span></div>' +
        '<div class="t-tags">' +
        (c.qCount ? '<span class="chip">刷题 ' + c.qCount + ' · 正确率 ' + rate + '%</span>' : '') +
        (c.exam !== '通用' ? '<span class="chip ' + (c.exam === '国考专项' ? 'gk">国考' : 'jl">吉林省考') + '</span>' : '') +
        (c.weak ? '<span class="chip warn">薄弱：' + U.esc(c.weak.slice(0, 12)) + '</span>' : '') +
        '</div>' +
        '<div class="t-note">' + U.esc((c.content || '').slice(0, 80)) + '</div>' +
        '</div></div>';
    }).join('');
    return h;
  }
  function stat(l, v) {
    return '<div style="background:var(--surface-2);border-radius:10px;padding:9px;text-align:center">' +
      '<div class="tiny muted">' + l + '</div><b class="num" style="font-size:17px">' + v + '</b></div>';
  }

  /* ---------------- 阶段进度页 ---------------- */
  function phasePage() {
    var st = S.get();
    return ['国考专项', '吉林省考专项'].map(function (exam) {
      var isJL = exam === '吉林省考专项';
      var ps = st.phases[exam] || [];
      var ex = isJL ? { n: st.settings.jlName, d: st.settings.jlDate } : { n: st.settings.gkName, d: st.settings.gkDate };
      var dl = S.q.dLeft(ex.d);
      var tasks = st.tasks.filter(function (t) { return t.exam === exam; });
      var done = tasks.filter(function (t) { return t.status === '已完成'; }).length;
      return '<div class="card">' +
        '<div class="card-h"><h3>' + (isJL ? '🟠 ' : '🔵 ') + U.esc(ex.n) + '</h3>' +
        '<span class="chip ' + (isJL ? 'jl' : 'gk') + '">' + (dl === null ? '未设置' : (dl >= 0 ? '还剩 ' + dl + ' 天' : '已过考期')) + '</span></div>' +
        '<div class="row" style="margin-bottom:10px"><b style="font-size:26px;color:' + (isJL ? 'var(--jl)' : 'var(--gk)') + '" class="num">' +
        S.q.examProgress(exam) + '%</b><span class="tiny muted">综合进度</span><span class="spacer"></span>' +
        '<span class="tiny muted">任务 ' + done + '/' + tasks.length + ' 完成</span></div>' +
        ps.map(function (p, i) {
          var cls = p.progress >= 100 ? 'done' : (p.progress > 0 ? 'on' : '');
          return '<div class="phase" data-ph="' + exam + '|' + i + '">' +
            '<div class="ph-ic ' + cls + '">' + (p.progress >= 100 ? '✓' : (i + 1)) + '</div>' +
            '<div class="ph-b"><div class="row"><span class="n">' + p.name + '</span><span class="spacer"></span>' +
            '<b class="num tiny">' + (p.progress || 0) + '%</b></div>' +
            UI.progressBar(p.progress || 0, 'sm') +
            '<div class="s">' + (p.start || p.end ? (p.start || '—') + ' → ' + (p.end || '—') : '未设置时间') +
            (p.note ? ' · ' + U.esc(p.note.slice(0, 20)) : '') + '</div></div>' +
            '<span class="muted">›</span></div>';
        }).join('') +
        '</div>';
    }).join('') +
      '<div class="card"><div class="card-h"><h3>⭐ 吉林省考特色考点</h3><span class="hint">单独标记追踪</span></div>' +
      (function () {
        var fs = st.tasks.filter(function (t) { return t.jlFeature; });
        if (!fs.length) return '<p class="tiny muted">还没有标记特色考点任务。新增任务时勾选「吉林省考特色考点」即可在此集中追踪（如省情省况、吉林时政、特色公文写作等）。</p>';
        var d = fs.filter(function (t) { return t.status === '已完成'; }).length;
        return '<div class="row" style="margin-bottom:8px"><b class="num" style="font-size:20px;color:var(--jl)">' + d + '/' + fs.length + '</b>' +
          '<span class="tiny muted">已完成</span></div>' + UI.progressBar(U.pct(d, fs.length)) +
          '<div style="height:10px"></div>' + fs.map(taskCard).join('');
      })() + '</div>';
  }

  function phaseForm(exam, idx) {
    var st = S.get(), p = st.phases[exam][idx];
    UI.form({
      title: exam.replace('专项', '') + ' · ' + p.name,
      fields: [
        { key: 'progress', label: '完成进度（%）', type: 'number', value: p.progress, min: 0, inputmode: 'numeric' },
        { key: 'start', label: '开始日期', type: 'date', value: p.start, half: true },
        { key: 'end', label: '结束日期', type: 'date', value: p.end, half: true },
        { key: 'note', label: '阶段备注', type: 'textarea', value: p.note, placeholder: '本阶段目标、教材、每日安排…' }
      ],
      onSubmit: function (v) {
        p.progress = U.clamp(Number(v.progress) || 0, 0, 100);
        p.start = v.start; p.end = v.end; p.note = v.note;
        p.done = p.progress >= 100;
        S.commit(); UI.toast('已更新', 'ok');
      }
    });
  }

  /* ---------------- 主渲染 ---------------- */
  Study.render = function (el) {
    var st = S.get();
    if (ui.tab !== 'politics' && typeof Politics !== 'undefined') Politics.reset();
    var h = '<div class="row" style="margin-bottom:12px">' +
      UI.seg([
        { v: 'tasks', l: '任务库' }, { v: 'checkin', l: '每日打卡' }, { v: 'phase', l: '阶段进度' },
        { v: 'politics', l: '时政打卡' }, { v: 'reading', l: '申论精读' }, { v: 'wrong', l: '错题本' }
      ], ui.tab, 'tab') + '</div>';

    if (ui.tab === 'tasks') {
      var list = S.q.tasks(ui.f);
      list = list.slice().sort(function (a, b) {
        if ((a.status === '已完成') !== (b.status === '已完成')) return a.status === '已完成' ? 1 : -1;
        return (a.due || '9999') < (b.due || '9999') ? -1 : 1;
      });
      h += filterBar();
      h += '<div class="row" style="margin-bottom:10px">' +
        UI.seg([{ v: 'kanban', l: '看板' }, { v: 'list', l: '清单' }, { v: 'table', l: '表格' }, { v: 'calendar', l: '日历' }], ui.view, 'view') +
        '<span class="spacer"></span><span class="tiny muted">共 ' + list.length + ' 项</span></div>';
      h += ui.view === 'kanban' ? viewKanban(list)
        : ui.view === 'list' ? viewList(list)
          : ui.view === 'table' ? viewTable(list)
            : viewCalendar(list);
    } else if (ui.tab === 'checkin') {
      h += checkinPage();
    } else if (ui.tab === 'politics') {
      Politics.render(el); return;
    } else if (ui.tab === 'reading') {
      Reading.render(el); return;
    } else if (ui.tab === 'wrong') {
      WrongQ.render(el); return;
    } else {
      h += phasePage();
    }
    el.innerHTML = h;

    UI.bindSeg(el, 'tab', function (v) { ui.tab = v; Study.render(el); });
    UI.bindSeg(el, 'view', function (v) { ui.view = v; Study.render(el); });
    UI.bindSeg(el, 'gb', function (v) { ui.groupBy = v; Study.render(el); });

    var kw = el.querySelector('#kw');
    if (kw) {
      var tm;
      kw.oninput = function () { clearTimeout(tm); tm = setTimeout(function () { ui.f.kw = kw.value; Study.render(el); setTimeout(function () { var k = el.querySelector('#kw'); if (k) { k.focus(); k.setSelectionRange(k.value.length, k.value.length); } }, 0); }, 350); };
    }
    ['fModule|module', 'fExam|exam', 'fStatus|status', 'fPhase|phase'].forEach(function (p) {
      var a = p.split('|'), s = el.querySelector('#' + a[0]);
      if (s) s.onchange = function () { ui.f[a[1]] = s.value; Study.render(el); };
    });
    var ff = el.querySelector('#fFeat');
    if (ff) ff.onclick = function () { ui.f.jlFeature = !ui.f.jlFeature; Study.render(el); };
    var at = el.querySelector('#addTask');
    if (at) at.onclick = function () { Study.taskForm(null, presetFromFilter()); };

    U.$$('[data-add]', el).forEach(function (b) {
      b.onclick = function () {
        var p = presetFromFilter(); p[b.dataset.gk] = b.dataset.add;
        Study.taskForm(null, p);
      };
    });
    U.$$('[data-tick]', el).forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var t = st.tasks.filter(function (x) { return x.id === b.dataset.tick; })[0];
        if (!t) return;
        t.status = t.status === '未开始' ? '进行中' : (t.status === '进行中' ? '已完成' : '未开始');
        t.doneAt = t.status === '已完成' ? U.today() : '';
        if (t.status === '已完成') UI.toast('完成 +1 💪', 'ok');
        S.commit();
      };
    });
    U.$$('[data-edit]', el).forEach(function (b) {
      b.onclick = function () {
        var t = st.tasks.filter(function (x) { return x.id === b.dataset.edit; })[0];
        if (t) Study.taskForm(t);
      };
    });
    U.$$('[data-ci]', el).forEach(function (b) {
      b.onclick = function () {
        var c = st.checkins.filter(function (x) { return x.id === b.dataset.ci; })[0];
        if (c) Study.checkinForm(c);
      };
    });
    U.$$('[data-ph]', el).forEach(function (b) {
      b.onclick = function () { var a = b.dataset.ph.split('|'); phaseForm(a[0], +a[1]); };
    });
    var dc = el.querySelector('#doCheckin'), et = el.querySelector('#editToday');
    if (dc) dc.onclick = function () { Study.checkinForm(); };
    if (et) et.onclick = function () { Study.checkinForm(S.q.todayCheckin()); };

    var cp = el.querySelector('#calPrev'), cn = el.querySelector('#calNext');
    if (cp) cp.onclick = function () { ui.calMonth = shiftMonth(ui.calMonth, -1); Study.render(el); };
    if (cn) cn.onclick = function () { ui.calMonth = shiftMonth(ui.calMonth, 1); Study.render(el); };
    U.$$('[data-day]', el).forEach(function (d) {
      d.onclick = function () { daySheet(d.dataset.day); };
    });
  };

  function presetFromFilter() {
    var p = {};
    if (ui.f.module) p.module = ui.f.module;
    if (ui.f.exam) p.exam = ui.f.exam;
    if (ui.f.phase) p.phase = ui.f.phase;
    if (ui.f.jlFeature) { p.jlFeature = true; p.exam = '吉林省考专项'; }
    return p;
  }
  function shiftMonth(m, n) {
    var a = m.split('-'), d = new Date(+a[0], +a[1] - 1 + n, 1);
    return U.mstr(d);
  }

  function daySheet(ds) {
    var st = S.get();
    var ts = st.tasks.filter(function (t) { return t.due === ds; });
    var ci = st.checkins.filter(function (c) { return c.date === ds; })[0];
    UI.sheet({
      title: ds + ' 周' + U.wdOf(ds),
      body: (ci ? '<div class="rv-auto">✅ 当日已打卡：' + U.hrs(ci.minutes) + ' 小时' +
        (ci.qCount ? ' · 刷题 ' + ci.qCount + ' 题 · 正确率 ' + Math.round(ci.qRight / ci.qCount * 100) + '%' : '') + '</div>' : '') +
        (ts.length ? ts.map(taskCard).join('') : UI.empty('📭', '当天没有截止的任务')),
      footer: '<button class="btn" data-x>关闭</button><button class="btn btn-primary" id="dayAdd">＋ 该日新任务</button>',
      onMount: function (m, close) {
        m.querySelector('#dayAdd').onclick = function () { close(); Study.taskForm(null, { due: ds }); };
        U.$$('[data-edit]', m).forEach(function (b) {
          b.onclick = function () {
            var t = st.tasks.filter(function (x) { return x.id === b.dataset.edit; })[0];
            close(); if (t) Study.taskForm(t);
          };
        });
      }
    });
  }

  Study.goto = function (tab, view) { ui.tab = tab || 'tasks'; if (view) ui.view = view; };
  g.Study = Study;
})(window);
