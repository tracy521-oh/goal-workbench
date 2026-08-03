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
      // 公考备考 · 时政打卡
      politics: { records: [] },
      // 公考备考 · 错题本
      wrongQs: [],
      // 公考备考 · 申论精读已读标记
      reading: { read: {} },
      // 作家成长路
      writer: {
        title: '我的小说',
        chapters: [],          // {id, title, content, words, updatedAt}
        log: {},               // 'YYYY-MM-DD': 当日累计创作字数
        potMark: ''            // 已发放「一壶水」奖励的日期（防重复）
      },
      // 阅读者
      reader: {
        books: []              // 见 reader.js：{id,title,author,category,status,cover,file,page,updatedAt,notes[],quotes[]}
      },
      // 全局奖励 · 浇灌大树
      rewards: {
        drops: 0,              // 累计水滴（用于大树成长）
        claimedMonth: '',      // 已领取月度结余奖励的月份
        log: []                // {date, amount, reason, project, icon}
      },
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
    },

    /* ---------- 奖励：水滴 → 浇灌大树 ---------- */
    drop: function (amount, reason, project, icon) {
      amount = Number(amount) || 0;
      if (amount <= 0) return;
      var st = state;
      st.rewards.drops = (st.rewards.drops || 0) + amount;
      st.rewards.log.unshift({
        date: U.today(), amount: amount, reason: reason || '',
        project: project || '', icon: icon || '💧'
      });
      if (st.rewards.log.length > 400) st.rewards.log.length = 400;
      save();
      if (typeof UI !== 'undefined' && UI.toast) UI.toast('💧 +' + amount + ' 滴水 · ' + reason, 'ok');
    },
    // 大树成长阶段
    treeStage: function () {
      var d = (state.rewards.drops) || 0;
      var stages = [
        { min: 0, name: '一粒种子', icon: '🌰', desc: '一切才刚刚开始' },
        { min: 30, name: '破土发芽', icon: '🌱', desc: '冒出第一片嫩芽' },
        { min: 80, name: '幼苗舒展', icon: '🌿', desc: '枝叶开始舒展开' },
        { min: 160, name: '小树成型', icon: '🌳', desc: '初具大树的模样' },
        { min: 300, name: '枝繁叶茂', icon: '🌲', desc: '正茁壮地成长' },
        { min: 500, name: '参天大树', icon: '🌴', desc: '目标达成，生命之树长成！' }
      ];
      var cur = stages[0], next = null, idx = 0;
      for (var i = 0; i < stages.length; i++) {
        if (d >= stages[i].min) { cur = stages[i]; idx = i; if (i + 1 < stages.length) next = stages[i + 1]; }
      }
      var pct = next ? Math.round((d - cur.min) / (next.min - cur.min) * 100) : 100;
      return { drops: d, cur: cur, next: next, pct: pct, done: !next, idx: idx, total: stages.length };
    },
    // 任务完成：按难度给含水量
    completeTask: function (id) {
      var st = state;
      var t = st.tasks.filter(function (x) { return x.id === id; })[0];
      if (!t || t.status === '已完成') return;
      t.status = '已完成'; t.doneAt = U.today();
      var map = { '简单': 1, '普通': 2, '困难': 3, '挑战': 5 };
      var amt = map[t.difficulty] || 1;
      if (t.jlFeature) amt += 1;
      S.drop(amt, '完成任务：' + t.title, '公考', '📚');
      S.commit();
    },
    // 作家当日创作字数累计；满 2000 字浇灌一壶水（10 滴）
    writerAddWords: function (n) {
      n = Number(n) || 0;
      if (n <= 0) return;
      var st = state, today = U.today();
      st.writer.log[today] = (st.writer.log[today] || 0) + n;
      if (st.writer.log[today] >= 2000 && st.writer.potMark !== today) {
        st.writer.potMark = today;
        S.drop(10, '当日创作破 2000 字 · 浇灌一壶水', '作家', '🪣');
      }
      save();
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
