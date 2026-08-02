/* ========== 数据层：全部保存在本机 localStorage ========== */
(function (g) {
  var KEY = 'shangan.workbench.v1';

  var C = {
    MODULES: ['行测模块', '申论专项', '真题套卷', '时政积累', '理论复习'],
    MODULE_ICON: { '行测模块': '🧮', '申论专项': '✍️', '真题套卷': '📄', '时政积累': '📰', '理论复习': '📚' },
    STATUS: ['未开始', '进行中', '已完成'],
    EXAMS: ['国考专项', '吉林省考专项', '通用'],
    PHASES: ['基础夯实', '强化刷题', '真题模考', '考前冲刺'],
    EXP: { fixed: '固定支出', flex: '弹性消费', study: '公考学习资料', other: '其他支出' },
    INC: { salary: '工资收入', bonus: '奖金/年终', side: '兼职副业', other: '其他收入' },
    HEALTH: ['作息', '运动', '体检', '其他']
  };

  function defaults() {
    var t = U.today();
    return {
      v: 1,
      createdAt: t,
      settings: {
        gkName: '2026 国考',
        gkDate: '2026-11-29',
        jlName: '吉林省考',
        jlDate: '2027-03-14',
        reminderTime: '22:30',
        notify: false,
        reviewDay: 7,           // 每周日
        dailyStudyGoal: 240     // 每日学习目标（分钟）
      },
      // 首页今日三件要事
      top3: { date: t, items: [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }] },
      // 公考备考
      tasks: [],
      checkins: [],
      phases: {
        '国考专项': mkPhases('2026-11-29'),
        '吉林省考专项': mkPhases('2027-03-14')
      },
      weeklyDigests: [],
      // 攒钱规划
      finance: {
        savings: { name: '总存款目标', target: 60000, balance: 0 },
        medical: { name: '医疗备用金', target: 20000, balance: 0, locked: true },
        budget: { fixed: 2000, flex: 800, study: 300, incomeExpect: 6000 },
        txns: [],
        moves: [],     // 账户资金变动
        avoid: []      // 消费避雷清单
      },
      // 长期生活配套
      life: {
        items: [],     // 健康事项 / 长期目标
        logs: []       // 每日生活打卡
      },
      reviews: [],
      _lastRemind: ''
    };
  }

  function mkPhases(examDate) {
    return C.PHASES.map(function (n, i) {
      return { name: n, progress: 0, start: '', end: '', note: '', done: false };
    });
  }

  var state = null;
  var subs = [];

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) { state = defaults(); save(); return; }
      var d = JSON.parse(raw);
      state = merge(defaults(), d);
    } catch (e) {
      console.warn('数据读取失败，已重置', e);
      state = defaults();
    }
  }

  function merge(base, patch) {
    if (patch === undefined || patch === null) return base;
    if (Array.isArray(base) || typeof base !== 'object') return patch;
    if (typeof patch !== 'object') return base;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = merge(base[k], patch[k]); });
    Object.keys(patch).forEach(function (k) { if (!(k in out)) out[k] = patch[k]; });
    return out;
  }

  var timer = null;
  function save() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { alert('保存失败：本机存储空间不足或被限制'); }
    }, 60);
  }

  var S = {
    C: C,
    get: function () { return state; },
    save: save,
    commit: function () { save(); subs.forEach(function (f) { f(); }); },
    sub: function (f) { subs.push(f); },
    reset: function () { state = defaults(); save(); },
    exportJSON: function () { return JSON.stringify(state, null, 2); },
    importJSON: function (txt) {
      var d = JSON.parse(txt);
      state = merge(defaults(), d);
      save();
      return true;
    }
  };

  /* ---------- 备考：派生计算 ---------- */
  S.q = {
    tasks: function (f) {
      f = f || {};
      return state.tasks.filter(function (t) {
        if (f.module && t.module !== f.module) return false;
        if (f.exam && t.exam !== f.exam) return false;
        if (f.status && t.status !== f.status) return false;
        if (f.phase && t.phase !== f.phase) return false;
        if (f.jlFeature && !t.jlFeature) return false;
        if (f.kw) {
          var k = f.kw.toLowerCase();
          if ((t.title + ' ' + (t.note || '')).toLowerCase().indexOf(k) < 0) return false;
        }
        return true;
      });
    },
    checkinsBetween: function (a, b) {
      var sa = U.dstr(a), sb = U.dstr(b);
      return state.checkins.filter(function (c) { return c.date >= sa && c.date <= sb; });
    },
    weekStudy: function (ref) {
      var cs = S.q.checkinsBetween(U.sow(ref), U.eow(ref));
      var mins = U.sum(cs, function (c) { return c.minutes; });
      var qs = U.sum(cs, function (c) { return c.qCount; });
      var qr = U.sum(cs, function (c) { return c.qRight; });
      return { list: cs, minutes: mins, days: cs.length, qCount: qs, qRight: qr, rate: qs ? Math.round(qr / qs * 1000) / 10 : 0 };
    },
    todayCheckin: function () {
      var t = U.today();
      return state.checkins.filter(function (c) { return c.date === t; })[0] || null;
    },
    studyProgress: function () {
      // 综合进度 = 双线四阶段平均
      var all = [];
      ['国考专项', '吉林省考专项'].forEach(function (e) {
        (state.phases[e] || []).forEach(function (p) { all.push(Number(p.progress) || 0); });
      });
      return all.length ? Math.round(U.sum(all) / all.length) : 0;
    },
    examProgress: function (exam) {
      var ps = state.phases[exam] || [];
      return ps.length ? Math.round(U.sum(ps, function (p) { return Number(p.progress) || 0; }) / ps.length) : 0;
    },
    dLeft: function (dateStr) {
      if (!dateStr) return null;
      return U.diffDays(U.today(), dateStr);
    }
  };

  /* ---------- 财务：派生计算 ---------- */
  S.f = {
    monthTxns: function (m) {
      m = m || U.mstr();
      return state.finance.txns.filter(function (t) { return String(t.date).slice(0, 7) === m; });
    },
    monthStat: function (m) {
      var ts = S.f.monthTxns(m);
      var inc = U.sum(ts.filter(function (t) { return t.kind === 'income'; }), function (t) { return t.amount; });
      var byCat = { fixed: 0, flex: 0, study: 0, other: 0 };
      ts.filter(function (t) { return t.kind === 'expense'; }).forEach(function (t) {
        byCat[t.cat] = (byCat[t.cat] || 0) + (Number(t.amount) || 0);
      });
      var exp = byCat.fixed + byCat.flex + byCat.study + byCat.other;
      return { income: inc, expense: exp, byCat: byCat, surplus: inc - exp, list: ts };
    },
    recentSurplusAvg: function (n) {
      n = n || 3;
      var now = new Date(), tot = 0, cnt = 0;
      for (var i = 0; i < n; i++) {
        var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        var st = S.f.monthStat(U.mstr(d));
        if (st.income || st.expense) { tot += st.surplus; cnt++; }
      }
      if (!cnt) return null;
      return tot / cnt;
    },
    eta: function () {
      var s = state.finance.savings;
      var need = (Number(s.target) || 0) - (Number(s.balance) || 0);
      if (need <= 0) return { done: true };
      var avg = S.f.recentSurplusAvg(3);
      if (avg === null || avg <= 0) {
        var b = state.finance.budget;
        avg = (Number(b.incomeExpect) || 0) - ((Number(b.fixed) || 0) + (Number(b.flex) || 0) + (Number(b.study) || 0));
        if (avg <= 0) return { done: false, unknown: true };
        var months0 = Math.ceil(need / avg);
        return { done: false, months: months0, avg: avg, date: addMonths(months0), est: true };
      }
      var months = Math.ceil(need / avg);
      return { done: false, months: months, avg: avg, date: addMonths(months) };
    },
    flexAlert: function () {
      var st = S.f.monthStat();
      var b = Number(state.finance.budget.flex) || 0;
      if (!b) return null;
      var used = st.byCat.flex;
      var r = used / b;
      if (r >= 1) return { level: 'over', used: used, budget: b, pct: Math.round(r * 100) };
      if (r >= 0.8) return { level: 'near', used: used, budget: b, pct: Math.round(r * 100) };
      return null;
    },
    savingsProgress: function () {
      var s = state.finance.savings;
      return U.pct(Number(s.balance) || 0, Number(s.target) || 0);
    }
  };

  function addMonths(n) {
    var d = new Date(); d.setMonth(d.getMonth() + n);
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月';
  }

  /* ---------- 生活：派生计算 ---------- */
  S.l = {
    weekLogs: function (ref) {
      var a = U.dstr(U.sow(ref)), b = U.dstr(U.eow(ref));
      return state.life.logs.filter(function (x) { return x.date >= a && x.date <= b; });
    },
    weekScore: function () {
      var logs = S.l.weekLogs();
      var sportGoal = 3, sleepGoal = 5;
      var sport = logs.filter(function (l) { return (Number(l.sportMin) || 0) > 0; }).length;
      var sleepOk = logs.filter(function (l) { return l.sleepOk; }).length;
      var items = state.life.items.filter(function (i) { return !i.done; });
      var s1 = U.pct(Math.min(sport, sportGoal), sportGoal);
      var s2 = U.pct(Math.min(sleepOk, sleepGoal), sleepGoal);
      var doneItems = state.life.items.length
        ? U.pct(state.life.items.filter(function (i) { return i.done; }).length, state.life.items.length) : 0;
      return {
        score: Math.round((s1 + s2 + doneItems) / 3),
        sport: sport, sportGoal: sportGoal, sleepOk: sleepOk, sleepGoal: sleepGoal,
        pending: items.length, logs: logs
      };
    },
    nextCheckup: function () {
      var list = state.life.items.filter(function (i) { return i.type === '体检' && i.date && !i.done; })
        .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      return list[0] || null;
    }
  };

  load();
  g.S = S;
})(window);
