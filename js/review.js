/* ========== 每周复盘（固定模板） + 自动周小结 ========== */
(function (g) {
  var R = {};
  var C = S.C;
  var ui = { tab: 'reviews' };

  /* ---------- 采集某周的自动数据 ---------- */
  R.collect = function (ref) {
    var st = S.get();
    var a = U.dstr(U.sow(ref)), b = U.dstr(U.eow(ref));
    var cs = st.checkins.filter(function (c) { return c.date >= a && c.date <= b; });
    var minutes = U.sum(cs, function (c) { return c.minutes; });
    var qc = U.sum(cs, function (c) { return c.qCount; });
    var qr = U.sum(cs, function (c) { return c.qRight; });

    // 按模块统计本周完成任务
    var doneTasks = st.tasks.filter(function (t) { return t.status === '已完成' && t.doneAt >= a && t.doneAt <= b; });
    var byModule = {};
    C.MODULES.forEach(function (m) { byModule[m] = doneTasks.filter(function (t) { return t.module === m; }).length; });
    var byExam = {
      '国考专项': doneTasks.filter(function (t) { return t.exam === '国考专项'; }).length,
      '吉林省考专项': doneTasks.filter(function (t) { return t.exam === '吉林省考专项'; }).length,
      '通用': doneTasks.filter(function (t) { return t.exam === '通用'; }).length
    };
    var weak = cs.filter(function (c) { return c.weak; }).map(function (c) { return c.date.slice(5) + '：' + c.weak; });
    var minByExam = { '国考专项': 0, '吉林省考专项': 0, '通用': 0 };
    cs.forEach(function (c) { minByExam[c.exam || '通用'] = (minByExam[c.exam || '通用'] || 0) + (c.minutes || 0); });

    // 财务
    var txns = st.finance.txns.filter(function (t) { return t.date >= a && t.date <= b; });
    var wInc = U.sum(txns.filter(function (t) { return t.kind === 'income'; }), function (t) { return t.amount; });
    var wExp = U.sum(txns.filter(function (t) { return t.kind === 'expense'; }), function (t) { return t.amount; });
    var wFlex = U.sum(txns.filter(function (t) { return t.kind === 'expense' && t.cat === 'flex'; }), function (t) { return t.amount; });
    var wStudy = U.sum(txns.filter(function (t) { return t.kind === 'expense' && t.cat === 'study'; }), function (t) { return t.amount; });
    var mStat = S.f.monthStat(b.slice(0, 7));
    var avoid = st.finance.avoid.filter(function (x) { return x.date >= a && x.date <= b; });

    // 生活
    var logs = st.life.logs.filter(function (l) { return l.date >= a && l.date <= b; });
    var sleepOk = logs.filter(function (l) { return l.sleepOk; }).length;
    var sportN = logs.filter(function (l) { return (l.sportMin || 0) > 0; }).length;
    var sportMin = U.sum(logs, function (l) { return l.sportMin; });
    var energy = logs.length ? Math.round(U.sum(logs, function (l) { return l.energy; }) / logs.length * 10) / 10 : 0;

    return {
      weekStart: a, weekEnd: b, label: U.wkLabel(ref),
      minutes: minutes, days: cs.length, qCount: qc, qRight: qr,
      rate: qc ? Math.round(qr / qc * 1000) / 10 : 0,
      minByExam: minByExam, byModule: byModule, byExam: byExam,
      doneCount: doneTasks.length, weak: weak,
      wInc: wInc, wExp: wExp, wFlex: wFlex, wStudy: wStudy,
      mIncome: mStat.income, mExpense: mStat.expense, mSurplus: mStat.surplus,
      savings: st.finance.savings.balance, savingsTarget: st.finance.savings.target,
      medical: st.finance.medical.balance,
      avoid: avoid.map(function (x) { return { item: x.item, amount: x.amount, trigger: x.trigger }; }),
      avoidTotal: U.sum(avoid, function (x) { return x.amount; }),
      sleepOk: sleepOk, sportN: sportN, sportMin: sportMin, energy: energy, logDays: logs.length
    };
  };

  function autoBlock(d) {
    var mods = C.MODULES.filter(function (m) { return d.byModule[m]; })
      .map(function (m) { return m + ' ' + d.byModule[m] + ' 项'; }).join('、') || '无';
    return {
      study: '📊 本周自动统计：学习 <b>' + U.hrs(d.minutes) + ' 小时</b>（打卡 ' + d.days + '/7 天，日均 ' +
        (d.days ? U.hrs(d.minutes / d.days) : '0.0') + ' h）<br>' +
        '刷题 <b>' + d.qCount + ' 题</b>，正确 ' + d.qRight + ' 题，正确率 <b>' + d.rate + '%</b><br>' +
        '完成任务 ' + d.doneCount + ' 项：' + mods + '<br>' +
        '时长分配：国考 ' + U.hrs(d.minByExam['国考专项']) + 'h · 吉林省考 ' + U.hrs(d.minByExam['吉林省考专项']) + 'h · 通用 ' + U.hrs(d.minByExam['通用']) + 'h<br>' +
        '完成任务分布：国考 ' + d.byExam['国考专项'] + ' 项 · 吉林省考 ' + d.byExam['吉林省考专项'] + ' 项' +
        (d.weak.length ? '<br>本周记录的薄弱考点：' + U.esc(d.weak.join('；').slice(0, 160)) : ''),
      money: '💰 本周自动统计：收入 <b>' + U.money0(d.wInc) + '</b>，支出 <b>' + U.money0(d.wExp) + '</b>（弹性消费 ' +
        U.money0(d.wFlex) + '，学习资料 ' + U.money0(d.wStudy) + '）<br>' +
        '本月累计：收入 ' + U.money0(d.mIncome) + ' · 支出 ' + U.money0(d.mExpense) + ' · 结余 <b>' + U.money0(d.mSurplus) + '</b><br>' +
        '总存款 ' + U.money0(d.savings) + ' / ' + U.money0(d.savingsTarget) + '（' + U.pct(d.savings, d.savingsTarget) + '%）· 医疗备用金 ' + U.money0(d.medical) + '<br>' +
        '本周避雷记录 ' + d.avoid.length + ' 笔，合计 ' + U.money0(d.avoidTotal) +
        (d.avoid.length ? '：' + U.esc(d.avoid.map(function (x) { return x.item + '(' + x.amount + '元)'; }).join('、').slice(0, 120)) : ''),
      life: '🌙 本周自动统计：生活打卡 ' + d.logDays + ' 天，作息达标 <b>' + d.sleepOk + ' 天</b>，' +
        '运动 <b>' + d.sportN + ' 次 / ' + d.sportMin + ' 分钟</b>，平均精力 ' + d.energy + '/5'
    };
  }

  /* ---------- 复盘表单（固定模板） ---------- */
  R.open = function (rec, refDate) {
    var st = S.get();
    var isNew = !rec;
    var ref = rec ? U.pd(rec.weekStart) : (refDate || new Date());
    var d = rec && rec.data ? rec.data : R.collect(ref);
    var ab = autoBlock(d);
    var v = rec || {
      id: '', weekStart: d.weekStart, weekEnd: d.weekEnd, createdAt: U.today(),
      s1a: '', s1b: '', s1c: '', s2a: '', s2b: '', s3: '', mood: ''
    };

    var body =
      '<div class="rv-sec"><h4>1. 学习板块复盘</h4>' +
      '<div class="rv-auto">' + ab.study + '</div>' +
      '<div class="rv-q">① 本周行测、申论完成情况，刷题正确率数据</div>' +
      ta('s1a', v.s1a, '行测：…（模块 / 题量 / 正确率）\n申论：…（篇数 / 批改与得分）\n真题套卷：…') +
      '<div class="rv-q">② 核心薄弱模块（区分国考 / 吉林省考）</div>' +
      ta('s1b', v.s1b, '国考薄弱：…\n吉林省考薄弱（含特色考点）：…') +
      '<div class="rv-q">③ 下周补强计划，调整学习时长分配</div>' +
      ta('s1c', v.s1c, '补强重点：…\n下周时长分配：行测 __h / 申论 __h / 真题 __h / 时政 __h\n国考 : 吉林省考 = __ : __') +
      '</div>' +

      '<div class="rv-sec"><h4>2. 财务攒钱复盘</h4>' +
      '<div class="rv-auto">' + ab.money + '</div>' +
      '<div class="rv-q">① 本周收支汇总，本月累计储蓄进度</div>' +
      ta('s2a', v.s2a, '收支情况：…\n储蓄进度评价：…（是否跟得上目标节奏）') +
      '<div class="rv-q">② 非必要消费清单，下月节约方案</div>' +
      ta('s2b', v.s2b, '非必要消费：…\n下月节约方案：…') +
      '</div>' +

      '<div class="rv-sec"><h4>3. 状态调整</h4>' +
      '<div class="rv-auto">' + ab.life + '</div>' +
      '<div class="rv-q">作息 / 精力问题、干扰因素、下周优化策略</div>' +
      ta('s3', v.s3, '作息与精力：…\n干扰因素：…\n下周优化策略：…') +
      '</div>';

    UI.form({
      title: (isNew ? '新建每周复盘 · ' : '编辑复盘 · ') + d.label,
      fields: [],
      extraBody: body,
      onDelete: isNew ? null : function () {
        st.reviews = st.reviews.filter(function (x) { return x.id !== v.id; });
        S.commit(); UI.toast('已删除');
      },
      onSubmit: function (vals) {
        var out = Object.assign({}, v, vals);
        out.weekStart = d.weekStart; out.weekEnd = d.weekEnd; out.data = d;
        if (isNew) {
          var dup = st.reviews.filter(function (x) { return x.weekStart === d.weekStart; })[0];
          if (dup) { UI.toast('本周已有复盘，请直接编辑', 'err'); return false; }
          out.id = U.uid(); out.createdAt = U.today();
          st.reviews.unshift(out); UI.toast('复盘已保存 🎯', 'ok');
        } else {
          var i = st.reviews.findIndex(function (x) { return x.id === v.id; });
          st.reviews[i] = out; UI.toast('已保存', 'ok');
        }
        st.reviews.sort(function (a, b) { return a.weekStart < b.weekStart ? 1 : -1; });
        S.commit();
        if (isNew) S.drop(3, '完成每周复盘', '复盘', '🗓');
      }
    });
  };
  function ta(k, val, ph) {
    return '<div class="f"><textarea data-k="' + k + '" rows="4" placeholder="' + U.esc(ph) + '">' + U.esc(val || '') + '</textarea></div>';
  }

  /* ---------- 自动周小结 ---------- */
  R.ensureDigests = function () {
    var st = S.get();
    var changed = false;
    for (var i = 1; i <= 6; i++) {
      var ref = U.addDays(new Date(), -7 * i);
      var ws = U.dstr(U.sow(ref));
      var we = U.dstr(U.eow(ref));
      if (we >= U.today()) continue;
      if (st.weeklyDigests.some(function (x) { return x.weekStart === ws; })) continue;
      var d = R.collect(ref);
      if (!d.minutes && !d.doneCount && !d.wExp && !d.logDays) continue;
      st.weeklyDigests.push({ id: U.uid(), weekStart: ws, weekEnd: we, label: d.label, data: d, createdAt: U.today() });
      changed = true;
    }
    if (changed) {
      st.weeklyDigests.sort(function (a, b) { return a.weekStart < b.weekStart ? 1 : -1; });
      S.save();
    }
  };

  /* ---------- 页面 ---------- */
  function reviewsPage() {
    var st = S.get();
    var thisWeek = U.dstr(U.sow(new Date()));
    var has = st.reviews.some(function (r) { return r.weekStart === thisWeek; });
    var isSun = new Date().getDay() === 0;

    var h = '<div class="card" style="border-color:#e0d2f8;background:linear-gradient(180deg,#faf7ff,#fff)">' +
      '<div class="card-h"><h3>🗓 本周复盘 · ' + U.wkLabel(new Date()) + '</h3>' +
      '<span class="chip ' + (has ? 'ok' : isSun ? 'warn' : 'mute') + '">' + (has ? '已完成' : isSun ? '今天该复盘了' : '未开始') + '</span></div>' +
      '<p class="tiny muted" style="margin-bottom:10px">固定每周日复盘。新建时会自动加载三段式模板，并把本周学习、财务、状态数据自动统计好。</p>' +
      '<button class="btn btn-primary btn-block" id="newReview">' + (has ? '查看/编辑本周复盘' : '＋ 新建本周复盘（自动加载模板）') + '</button>' +
      '</div>';

    h += '<div class="sec-t">历史复盘</div>';
    if (!st.reviews.length) h += UI.empty('📓', '还没有复盘记录');
    else h += st.reviews.map(function (r) {
      var d = r.data || {};
      return '<div class="rv-item" data-rv="' + r.id + '"><div class="h"><b>' + U.esc(r.data ? r.data.label : r.weekStart) + '</b>' +
        '<span class="tiny muted">' + r.weekStart + ' ~ ' + r.weekEnd + '</span></div>' +
        '<div class="row wrap" style="gap:6px;margin-top:7px">' +
        '<span class="chip">📚 ' + U.hrs(d.minutes || 0) + 'h</span>' +
        '<span class="chip">✅ 正确率 ' + (d.rate || 0) + '%</span>' +
        '<span class="chip ' + ((d.mSurplus || 0) >= 0 ? 'ok' : 'danger') + '">💰 月结余 ' + U.money0(d.mSurplus || 0) + '</span>' +
        '<span class="chip">🏃 运动 ' + (d.sportN || 0) + ' 次</span>' +
        '</div>' +
        '<div class="p">' + U.esc([r.s1b, r.s1c, r.s3].filter(Boolean).join(' / ').slice(0, 90) || '（未填写文字复盘）') + '</div>' +
        '</div>';
    }).join('');
    return h;
  }

  function digestPage() {
    var st = S.get();
    if (!st.weeklyDigests.length) return UI.empty('🤖', '暂无自动周小结<br><span class="tiny">每周结束后会自动汇总学习时长与刷题情况</span>');
    return st.weeklyDigests.map(function (w) {
      var d = w.data;
      var mods = C.MODULES.filter(function (m) { return d.byModule[m]; }).map(function (m) { return m + '×' + d.byModule[m]; }).join(' · ') || '无完成任务';
      return '<div class="card"><div class="card-h"><h3>' + U.esc(d.label) + '</h3><span class="hint">自动生成</span></div>' +
        '<div class="grid3">' + kb('学习时长', U.hrs(d.minutes) + ' h') + kb('打卡', d.days + '/7 天') + kb('刷题', d.qCount + ' 题') + '</div>' +
        '<div style="height:8px"></div><div class="grid3">' + kb('正确率', d.rate + '%') + kb('完成任务', d.doneCount + ' 项') + kb('周结余', U.money0(d.wInc - d.wExp)) + '</div>' +
        '<div class="kv" style="margin-top:8px"><span>模块分布</span><b class="tiny">' + U.esc(mods) + '</b></div>' +
        '<div class="kv"><span>国考 / 吉林省考 时长</span><b>' + U.hrs(d.minByExam['国考专项']) + 'h / ' + U.hrs(d.minByExam['吉林省考专项']) + 'h</b></div>' +
        '</div>';
    }).join('');
  }
  function kb(l, v) {
    return '<div style="background:var(--surface-2);border-radius:10px;padding:9px;text-align:center">' +
      '<div class="tiny muted">' + l + '</div><b class="num" style="font-size:16px">' + v + '</b></div>';
  }

  R.render = function (el) {
    R.ensureDigests();
    var h = '<div class="row" style="margin-bottom:12px">' +
      UI.seg([{ v: 'reviews', l: '每周复盘' }, { v: 'digest', l: '自动周小结' }], ui.tab, 'rtab') + '</div>';
    h += ui.tab === 'reviews' ? reviewsPage() : digestPage();
    el.innerHTML = h;

    UI.bindSeg(el, 'rtab', function (v) { ui.tab = v; R.render(el); });
    var st = S.get(), q;
    if ((q = el.querySelector('#newReview'))) q.onclick = function () {
      var tw = U.dstr(U.sow(new Date()));
      var ex = st.reviews.filter(function (r) { return r.weekStart === tw; })[0];
      R.open(ex || null);
    };
    U.$$('[data-rv]', el).forEach(function (b) {
      b.onclick = function () { var r = st.reviews.filter(function (x) { return x.id === b.dataset.rv; })[0]; if (r) R.open(r); };
    });
  };

  R.goto = function (t) { ui.tab = t || 'reviews'; };
  g.Review = R;
})(window);
