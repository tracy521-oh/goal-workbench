/* ========== 第二板块：攒钱财务规划专区 ========== */
(function (g) {
  var F = {};
  var C = S.C;
  var ui = { tab: 'assets', month: U.mstr() };

  var CAT_ICON = { fixed: '🏠', flex: '🛍', study: '📚', other: '💠' };
  var CAT_COLOR = { fixed: '#3b6fd4', flex: '#e8880c', study: '#7c4ddb', other: '#8b94a3' };

  /* ---------------- 表单 ---------------- */
  F.txnForm = function (rec, presetKind) {
    var st = S.get();
    var isNew = !rec;
    var t = rec || { id: '', date: U.today(), kind: presetKind || 'expense', cat: 'flex', incCat: 'salary', amount: '', note: '', toSavings: false };

    var sh = UI.form({
      title: isNew ? '登记收支' : '编辑流水',
      fields: [
        { key: 'kind', label: '类型', type: 'options', value: t.kind, options: [{ v: 'expense', l: '支出' }, { v: 'income', l: '收入', cls: 'money' }] },
        { key: 'amount', label: '金额（元）', type: 'number', value: t.amount, required: true, step: '0.01', inputmode: 'decimal', half: true },
        { key: 'date', label: '日期', type: 'date', value: t.date, half: true },
        {
          key: 'cat', label: '支出分类', type: 'options', value: t.cat,
          options: [{ v: 'fixed', l: '🏠 固定支出' }, { v: 'flex', l: '🛍 弹性消费' }, { v: 'study', l: '📚 公考学习资料' }, { v: 'other', l: '💠 其他' }]
        },
        {
          key: 'incCat', label: '收入分类', type: 'select', value: t.incCat,
          options: Object.keys(C.INC).map(function (k) { return { v: k, l: C.INC[k] }; })
        },
        { key: 'note', label: '备注', type: 'text', value: t.note, placeholder: '例：粉笔980系统班 / 房租 / 8月工资' },
        { key: 'toSavings', label: '', type: 'checkbox', value: t.toSavings, text: '💰 同时把这笔收入计入「总存款」余额' }
      ],
      onMount: function (m) {
        function sync() {
          var kind = m.querySelector('.opts[data-k=kind] .opt.on').dataset.v;
          m.querySelector('[data-f=cat]').style.display = kind === 'expense' ? '' : 'none';
          m.querySelector('[data-f=incCat]').style.display = kind === 'income' ? '' : 'none';
          m.querySelector('[data-f=toSavings]').style.display = kind === 'income' ? '' : 'none';
        }
        sync();
        m.addEventListener('optchange', sync);
      },
      onDelete: isNew ? null : function () {
        st.finance.txns = st.finance.txns.filter(function (x) { return x.id !== t.id; });
        S.commit(); UI.toast('已删除');
      },
      onSubmit: function (v) {
        v.amount = Number(v.amount) || 0;
        if (v.amount <= 0) { UI.toast('金额需大于 0', 'err'); return false; }
        if (isNew) {
          v.id = U.uid();
          st.finance.txns.unshift(v);
          if (v.kind === 'income' && v.toSavings) {
            st.finance.savings.balance = (Number(st.finance.savings.balance) || 0) + v.amount;
            st.finance.moves.unshift({ id: U.uid(), date: v.date, acct: 'savings', dir: 'in', amount: v.amount, note: '收入自动转入：' + (v.note || '') });
          }
          UI.toast('已登记', 'ok');
        } else {
          var i = st.finance.txns.findIndex(function (x) { return x.id === t.id; });
          v.id = t.id; st.finance.txns[i] = v; UI.toast('已保存', 'ok');
        }
        st.finance.txns.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
        S.commit();
        var al = S.f.flexAlert();
        if (al && al.level === 'over') UI.toast('⚠️ 本月弹性消费已超预算 ' + al.pct + '%', 'err');
        else if (al && al.level === 'near') UI.toast('本月弹性消费已用 ' + al.pct + '%，注意控制', 'err');
      }
    });
    return sh;
  };

  F.moveForm = function (acct, dir) {
    var st = S.get();
    var a = st.finance[acct];
    var isMed = acct === 'medical';
    if (isMed && dir === 'out') return F.medicalOut();
    UI.form({
      title: (dir === 'in' ? '存入 · ' : '支取 · ') + a.name,
      fields: [
        { key: 'amount', label: '金额（元）', type: 'number', value: '', required: true, step: '0.01', inputmode: 'decimal', half: true },
        { key: 'date', label: '日期', type: 'date', value: U.today(), half: true },
        { key: 'note', label: '说明', type: 'text', value: '', placeholder: dir === 'in' ? '本月结余转存' : '用途说明' }
      ],
      onSubmit: function (v) {
        var amt = Number(v.amount) || 0;
        if (amt <= 0) { UI.toast('金额需大于 0', 'err'); return false; }
        if (dir === 'out' && amt > (Number(a.balance) || 0)) { UI.toast('余额不足', 'err'); return false; }
        a.balance = (Number(a.balance) || 0) + (dir === 'in' ? amt : -amt);
        st.finance.moves.unshift({ id: U.uid(), date: v.date, acct: acct, dir: dir, amount: amt, note: v.note });
        S.commit();
        UI.toast(dir === 'in' ? '已存入 ' + U.money(amt) : '已支取 ' + U.money(amt), 'ok');
      }
    });
  };

  /* 医疗备用金支取：仅限医疗用途，双重确认 */
  F.medicalOut = function () {
    var st = S.get(), a = st.finance.medical;
    UI.form({
      title: '🔒 医疗备用金支取',
      okText: '确认支取',
      okClass: 'btn-danger',
      fields: [
        {
          type: 'static', key: '_w', label: '',
          html: '<div style="background:var(--danger-soft);border:1px solid #f6cdc9;border-radius:10px;padding:10px;color:#a3231a">' +
            '医疗备用金为<b>专款专用</b>资金，规则设定为<b>不得挪作他用</b>。只有勾选「确属医疗支出」后才能支取。</div>'
        },
        { key: 'amount', label: '支取金额（元）', type: 'number', value: '', required: true, step: '0.01', inputmode: 'decimal', half: true },
        { key: 'date', label: '日期', type: 'date', value: U.today(), half: true },
        { key: 'reason', label: '医疗事由', type: 'text', value: '', required: true, placeholder: '例：门诊检查 / 牙科治疗 / 购药' },
        { key: 'isMed', label: '', type: 'checkbox', value: false, text: '我确认这笔支出确属医疗用途' }
      ],
      onSubmit: function (v) {
        if (!v.isMed) { UI.toast('非医疗用途不可动用备用金', 'err'); return false; }
        var amt = Number(v.amount) || 0;
        if (amt <= 0) { UI.toast('金额需大于 0', 'err'); return false; }
        if (amt > (Number(a.balance) || 0)) { UI.toast('备用金余额不足', 'err'); return false; }
        a.balance -= amt;
        st.finance.moves.unshift({ id: U.uid(), date: v.date, acct: 'medical', dir: 'out', amount: amt, note: '【医疗】' + v.reason });
        st.finance.txns.unshift({ id: U.uid(), date: v.date, kind: 'expense', cat: 'other', amount: amt, note: '医疗支出：' + v.reason });
        S.commit(); UI.toast('已支取并记入流水', 'ok');
      }
    });
  };

  F.acctForm = function (acct) {
    var st = S.get(), a = st.finance[acct];
    UI.form({
      title: '设置 · ' + a.name,
      fields: [
        { key: 'name', label: '账户名称', type: 'text', value: a.name },
        { key: 'target', label: '目标金额（元）', type: 'number', value: a.target, step: '100', inputmode: 'decimal', half: true },
        { key: 'balance', label: '当前余额（元）', type: 'number', value: a.balance, step: '0.01', inputmode: 'decimal', half: true }
      ],
      onSubmit: function (v) {
        a.name = v.name || a.name; a.target = Number(v.target) || 0; a.balance = Number(v.balance) || 0;
        S.commit(); UI.toast('已保存', 'ok');
      }
    });
  };

  F.budgetForm = function () {
    var st = S.get(), b = st.finance.budget;
    UI.form({
      title: '月度预算设置',
      fields: [
        { key: 'incomeExpect', label: '预计月收入（元）', type: 'number', value: b.incomeExpect, inputmode: 'decimal' },
        { key: 'fixed', label: '固定支出预算', type: 'number', value: b.fixed, inputmode: 'decimal', half: true },
        { key: 'flex', label: '弹性消费预算', type: 'number', value: b.flex, inputmode: 'decimal', half: true },
        { key: 'study', label: '公考学习资料预算', type: 'number', value: b.study, inputmode: 'decimal' }
      ],
      onSubmit: function (v) {
        b.incomeExpect = Number(v.incomeExpect) || 0;
        b.fixed = Number(v.fixed) || 0; b.flex = Number(v.flex) || 0; b.study = Number(v.study) || 0;
        S.commit(); UI.toast('预算已更新', 'ok');
      }
    });
  };

  F.avoidForm = function (rec) {
    var st = S.get(), isNew = !rec;
    var a = rec || { id: '', date: U.today(), item: '', amount: '', trigger: '直播间/推荐', reflect: '', level: '中', refunded: false };
    UI.form({
      title: isNew ? '记一笔「消费避雷」' : '编辑避雷记录',
      fields: [
        { key: 'item', label: '消费内容', type: 'text', value: a.item, required: true, placeholder: '例：又买了一套用不上的申论模板书' },
        { key: 'amount', label: '金额（元）', type: 'number', value: a.amount, step: '0.01', inputmode: 'decimal', half: true },
        { key: 'date', label: '日期', type: 'date', value: a.date, half: true },
        { key: 'trigger', label: '冲动诱因', type: 'options', value: a.trigger, options: ['直播间/推荐', '促销打折', '焦虑上头', '社交攀比', '无聊闲逛'] },
        { key: 'level', label: '后悔程度', type: 'options', value: a.level, options: ['低', '中', '高'] },
        { key: 'reflect', label: '复盘反思', type: 'textarea', value: a.reflect, placeholder: '下次遇到同样情况我会怎么做？' },
        { key: 'refunded', label: '', type: 'checkbox', value: a.refunded, text: '已退货 / 已止损' }
      ],
      onDelete: isNew ? null : function () {
        st.finance.avoid = st.finance.avoid.filter(function (x) { return x.id !== a.id; });
        S.commit(); UI.toast('已删除');
      },
      onSubmit: function (v) {
        v.amount = Number(v.amount) || 0;
        if (isNew) { v.id = U.uid(); st.finance.avoid.unshift(v); UI.toast('已记录，下次注意 👀', 'ok'); S.drop(1, '记录消费避雷', '攒钱', '💰'); }
        else { var i = st.finance.avoid.findIndex(function (x) { return x.id === a.id; }); v.id = a.id; st.finance.avoid[i] = v; UI.toast('已保存', 'ok'); }
        S.commit();
      }
    });
  };

  /* ---------------- 页面 ---------------- */
  function assetsPage() {
    var st = S.get(), fin = st.finance;
    var sp = S.f.savingsProgress();
    var mp = U.pct(fin.medical.balance, fin.medical.target);
    var eta = S.f.eta();
    var etaTxt = eta.done ? '🎉 已达成目标！'
      : eta.unknown ? '按当前收支暂无法预估，请先登记收支或设置预算'
        : '按月均结余 ' + U.money0(eta.avg) + ' 计算，约需 <b>' + eta.months + ' 个月</b>，预计 <b>' + eta.date + '</b> 达成' + (eta.est ? '（按预算估算）' : '');

    var h = '<div class="acct save">' +
      '<div class="a-t">💰 ' + U.esc(fin.savings.name) + '</div>' +
      '<div class="a-v">' + U.money(fin.savings.balance) + '</div>' +
      '<div class="a-g">目标 ' + U.money0(fin.savings.target) + ' · 还差 ' + U.money0(Math.max(0, fin.savings.target - fin.savings.balance)) + '</div>' +
      UI.progressBar(sp) +
      '<div class="a-g" style="margin-top:5px">已完成 ' + sp + '%</div>' +
      '<div class="a-btns"><button class="btn btn-sm" data-mv="savings|in">＋ 存入</button>' +
      '<button class="btn btn-sm" data-mv="savings|out">－ 支取</button>' +
      '<button class="btn btn-sm" data-acct="savings">设置</button></div></div>';

    h += '<div class="acct med">' +
      '<div class="a-t">🏥 ' + U.esc(fin.medical.name) + ' <span class="lock">🔒 专款专用</span></div>' +
      '<div class="a-v">' + U.money(fin.medical.balance) + '</div>' +
      '<div class="a-g">目标 ' + U.money0(fin.medical.target) + ' · 该笔资金不参与日常开支</div>' +
      UI.progressBar(mp) +
      '<div class="a-g" style="margin-top:5px">已完成 ' + mp + '%</div>' +
      '<div class="a-btns"><button class="btn btn-sm" data-mv="medical|in">＋ 存入</button>' +
      '<button class="btn btn-sm" data-mv="medical|out">医疗支取</button>' +
      '<button class="btn btn-sm" data-acct="medical">设置</button></div></div>';

    h += '<div class="card"><div class="card-h"><h3>存款达成预估</h3></div>' +
      '<p style="font-size:13.5px;line-height:1.8">' + etaTxt + '</p></div>';

    h += '<div class="card"><div class="card-h"><h3>资金变动记录</h3><span class="hint">最近 20 条</span></div>' +
      (fin.moves.length ? fin.moves.slice(0, 20).map(function (m) {
        return '<div class="txn"><div class="txn-ic" style="background:' + (m.dir === 'in' ? 'var(--money-soft);color:var(--money)' : 'var(--danger-soft);color:var(--danger)') + '">' +
          (m.dir === 'in' ? '↓' : '↑') + '</div><div class="txn-b"><div class="n">' +
          (m.acct === 'savings' ? '总存款' : '医疗备用金') + ' · ' + U.esc(m.note || (m.dir === 'in' ? '存入' : '支取')) +
          '</div><div class="m">' + m.date + '</div></div>' +
          '<div class="txn-a ' + (m.dir === 'in' ? 'pos' : 'neg') + '">' + (m.dir === 'in' ? '+' : '-') + U.money(m.amount) + '</div></div>';
      }).join('') : '<p class="tiny muted">暂无记录</p>') + '</div>';
    return h;
  }

  function txnPage() {
    var st = S.get();
    var stat = S.f.monthStat(ui.month);
    var list = stat.list.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var h = '<div class="card"><div class="card-h"><h3>' + ui.month.replace('-', ' 年 ') + ' 月收支</h3>' +
      '<div class="row"><button class="icon-btn" id="mPrev">‹</button><button class="icon-btn" id="mNext">›</button></div></div>' +
      '<div class="grid3">' +
      box('收入', U.money0(stat.income), 'var(--money)') +
      box('支出', U.money0(stat.expense), 'var(--danger)') +
      box('结余', U.money0(stat.surplus), stat.surplus >= 0 ? 'var(--money)' : 'var(--danger)') +
      '</div><div style="height:12px"></div>' +
      ['fixed', 'flex', 'study', 'other'].map(function (k) {
        var v = stat.byCat[k] || 0;
        if (!v) return '';
        return '<div class="kv"><span>' + CAT_ICON[k] + ' ' + C.EXP[k] + '</span><b>' + U.money(v) + '</b></div>';
      }).join('') + '</div>';

    h += '<div class="toolbar"><button class="btn btn-money btn-sm" id="addInc">＋ 收入</button>' +
      '<button class="btn btn-primary btn-sm" id="addExp">＋ 支出</button><span class="spacer"></span>' +
      '<span class="tiny muted">' + list.length + ' 条流水</span></div>';

    if (!list.length) h += UI.empty('🧾', '本月还没有流水记录');
    else {
      var byDay = U.groupBy(list, function (t) { return t.date; });
      h += Object.keys(byDay).sort().reverse().map(function (d) {
        return '<div class="card" style="padding:11px 13px"><div class="row" style="margin-bottom:4px">' +
          '<b class="tiny">' + d.slice(5) + ' 周' + U.wdOf(d) + '</b><span class="spacer"></span>' +
          '<span class="tiny muted">支出 ' + U.money0(U.sum(byDay[d].filter(function (x) { return x.kind === 'expense'; }), function (x) { return x.amount; })) + '</span></div>' +
          byDay[d].map(function (t) {
            var isInc = t.kind === 'income';
            var cat = isInc ? (C.INC[t.incCat] || '收入') : C.EXP[t.cat];
            return '<div class="txn" data-txn="' + t.id + '" style="cursor:pointer">' +
              '<div class="txn-ic" style="background:' + (isInc ? 'var(--money-soft)' : '#f1f3f7') + ';color:' + (isInc ? 'var(--money)' : CAT_COLOR[t.cat]) + '">' +
              (isInc ? '💵' : CAT_ICON[t.cat]) + '</div>' +
              '<div class="txn-b"><div class="n">' + U.esc(t.note || cat) + '</div><div class="m">' + cat + '</div></div>' +
              '<div class="txn-a ' + (isInc ? 'pos' : '') + '">' + (isInc ? '+' : '-') + U.money(t.amount) + '</div></div>';
          }).join('') + '</div>';
      }).join('');
    }
    return h;
  }
  function box(l, v, c) {
    return '<div style="background:var(--surface-2);border-radius:10px;padding:10px;text-align:center">' +
      '<div class="tiny muted">' + l + '</div><b class="num" style="font-size:17px;color:' + c + '">' + v + '</b></div>';
  }

  function budgetPage() {
    var st = S.get(), b = st.finance.budget;
    var stat = S.f.monthStat();
    var al = S.f.flexAlert();
    var planSurplus = b.incomeExpect - (b.fixed + b.flex + b.study);
    var h = '<div class="card"><div class="card-h"><h3>本月预算执行</h3>' +
      '<button class="btn btn-sm" id="editBgt">编辑预算</button></div>' +
      [['fixed', '🏠 固定支出'], ['flex', '🛍 弹性消费'], ['study', '📚 公考学习资料']].map(function (p) {
        var used = stat.byCat[p[0]] || 0, bud = Number(b[p[0]]) || 0;
        var pc = U.pct(used, bud);
        var over = bud && used > bud;
        return '<div class="bgt"><div class="bgt-h"><span>' + p[1] + '</span>' +
          '<b class="' + (over ? 'neg' : '') + '">' + U.money0(used) + ' / ' + U.money0(bud) + '</b></div>' +
          '<div class="bar sm"><i style="width:' + U.clamp(pc, 0, 100) + '%;background:' + (over ? 'var(--danger)' : pc >= 80 ? 'var(--warn)' : 'var(--money)') + '"></i></div>' +
          (over ? '<div class="tiny neg" style="margin-top:4px">已超支 ' + U.money0(used - bud) + '</div>' : '') +
          '</div>';
      }).join('') + '</div>';

    if (al) {
      h += '<div class="alert ' + (al.level === 'over' ? 'danger' : 'warn') + '" style="margin:0 0 12px">' +
        (al.level === 'over' ? '⚠️ 弹性消费已超预算！已用 ' + U.money0(al.used) + '，预算 ' + U.money0(al.budget) + '（' + al.pct + '%）'
          : '🔔 弹性消费已用 ' + al.pct + '%，本月剩余额度 ' + U.money0(al.budget - al.used)) + '</div>';
    }

    h += '<div class="card"><div class="card-h"><h3>结余核算</h3></div>' +
      '<div class="kv"><span>计划月结余（按预算）</span><b class="' + (planSurplus >= 0 ? 'pos' : 'neg') + '">' + U.money(planSurplus) + '</b></div>' +
      '<div class="kv"><span>本月实际结余</span><b class="' + (stat.surplus >= 0 ? 'pos' : 'neg') + '">' + U.money(stat.surplus) + '</b></div>' +
      '<div class="kv"><span>与计划差额</span><b class="' + (stat.surplus - planSurplus >= 0 ? 'pos' : 'neg') + '">' + U.money(stat.surplus - planSurplus) + '</b></div>' +
      '<div class="kv"><span>近 3 月平均结余</span><b>' + (S.f.recentSurplusAvg(3) === null ? '—' : U.money(S.f.recentSurplusAvg(3))) + '</b></div>' +
      '</div>';

    h += '<div class="card"><div class="card-h"><h3>近 6 个月结余趋势</h3></div>' + trend() + '</div>';

    // 月度结余达标奖励
    var cm = U.mstr();
    if (stat.surplus > 0 && st.finance.claimedMonth !== cm) {
      h += '<div class="card" style="border-color:#e0d2f8;background:linear-gradient(180deg,#faf7ff,#fff)">' +
        '<div class="card-h"><h3>🪙 本月结余达标奖励</h3></div>' +
        '<p class="tiny muted" style="margin-bottom:10px">本月当前结余为正（' + U.money(stat.surplus) + '），坚持攒钱也是在浇灌你的生命之树。</p>' +
        '<button class="btn btn-primary btn-block" id="claimMonth">领取 +3 滴水 💧</button></div>';
    }
    return h;
  }

  function trend() {
    var rows = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(); d.setMonth(d.getMonth() - i);
      var m = U.mstr(d), s = S.f.monthStat(m);
      rows.push({ m: m, s: s.surplus, has: !!(s.income || s.expense) });
    }
    var max = Math.max(1, Math.max.apply(null, rows.map(function (r) { return Math.abs(r.s); })));
    return '<div style="display:flex;align-items:flex-end;gap:8px;height:110px">' + rows.map(function (r) {
      var hgt = Math.max(4, Math.round(Math.abs(r.s) / max * 78));
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end">' +
        '<span class="tiny num" style="color:' + (r.s >= 0 ? 'var(--money)' : 'var(--danger)') + '">' + (r.has ? Math.round(r.s / 100) / 10 + 'k' : '') + '</span>' +
        '<div style="width:100%;max-width:34px;height:' + hgt + 'px;border-radius:6px 6px 0 0;background:' +
        (r.has ? (r.s >= 0 ? 'var(--money)' : 'var(--danger)') : '#e7e9ee') + '"></div>' +
        '<span class="tiny muted">' + (+r.m.split('-')[1]) + '月</span></div>';
    }).join('') + '</div>';
  }

  function avoidPage() {
    var st = S.get(), list = st.finance.avoid;
    var mth = list.filter(function (a) { return a.date.slice(0, 7) === U.mstr(); });
    var total = U.sum(mth, function (a) { return a.amount; });
    var h = '<div class="card"><div class="card-h"><h3>消费避雷清单</h3>' +
      '<button class="btn btn-sm btn-primary" id="addAvoid">＋ 记一笔</button></div>' +
      '<div class="grid2">' + box('本月冲动消费', U.money0(total), 'var(--danger)') + box('累计记录', list.length + ' 笔', 'var(--text)') + '</div>' +
      '<p class="tiny muted" style="margin-top:9px">记录下来的每一笔冲动消费，都会在每周复盘时自动汇总，帮你看清钱漏在哪。</p></div>';
    if (!list.length) h += UI.empty('🛒', '还没有避雷记录，保持住！');
    else h += list.map(function (a) {
      return '<div class="task" data-av="' + a.id + '"><div class="t-body">' +
        '<div class="row"><b style="font-size:14px">' + U.esc(a.item) + '</b><span class="spacer"></span>' +
        '<span class="txn-a neg">' + U.money(a.amount) + '</span></div>' +
        '<div class="t-tags"><span class="chip mute">' + a.date.slice(5) + '</span>' +
        '<span class="chip">' + U.esc(a.trigger) + '</span>' +
        '<span class="chip ' + (a.level === '高' ? 'danger' : a.level === '中' ? 'warn' : '') + '">后悔度 ' + a.level + '</span>' +
        (a.refunded ? '<span class="chip ok">已止损</span>' : '') + '</div>' +
        (a.reflect ? '<div class="t-note">' + U.esc(a.reflect) + '</div>' : '') +
        '</div></div>';
    }).join('');
    return h;
  }

  /* ---------------- 渲染 ---------------- */
  F.render = function (el) {
    var h = '<div class="row" style="margin-bottom:12px">' +
      UI.seg([{ v: 'assets', l: '资产台账' }, { v: 'txn', l: '收支流水' }, { v: 'budget', l: '月度预算' }, { v: 'avoid', l: '消费避雷' }], ui.tab, 'ftab') + '</div>';
    h += ui.tab === 'assets' ? assetsPage() : ui.tab === 'txn' ? txnPage() : ui.tab === 'budget' ? budgetPage() : avoidPage();
    el.innerHTML = h;

    UI.bindSeg(el, 'ftab', function (v) { ui.tab = v; F.render(el); });
    U.$$('[data-mv]', el).forEach(function (b) {
      b.onclick = function () { var a = b.dataset.mv.split('|'); F.moveForm(a[0], a[1]); };
    });
    U.$$('[data-acct]', el).forEach(function (b) { b.onclick = function () { F.acctForm(b.dataset.acct); }; });
    U.$$('[data-txn]', el).forEach(function (b) {
      b.onclick = function () {
        var t = S.get().finance.txns.filter(function (x) { return x.id === b.dataset.txn; })[0];
        if (t) F.txnForm(t);
      };
    });
    U.$$('[data-av]', el).forEach(function (b) {
      b.onclick = function () {
        var a = S.get().finance.avoid.filter(function (x) { return x.id === b.dataset.av; })[0];
        if (a) F.avoidForm(a);
      };
    });
    var q;
    if ((q = el.querySelector('#addInc'))) q.onclick = function () { F.txnForm(null, 'income'); };
    if ((q = el.querySelector('#addExp'))) q.onclick = function () { F.txnForm(null, 'expense'); };
    if ((q = el.querySelector('#editBgt'))) q.onclick = function () { F.budgetForm(); };
    if ((q = el.querySelector('#claimMonth'))) q.onclick = function () {
      st.finance.claimedMonth = U.mstr(); S.commit();
      S.drop(3, '本月结余达标', '攒钱', '💰');
    };
    if ((q = el.querySelector('#addAvoid'))) q.onclick = function () { F.avoidForm(); };
    if ((q = el.querySelector('#mPrev'))) q.onclick = function () { ui.month = shiftM(ui.month, -1); F.render(el); };
    if ((q = el.querySelector('#mNext'))) q.onclick = function () { ui.month = shiftM(ui.month, 1); F.render(el); };
  };
  function shiftM(m, n) { var a = m.split('-'); return U.mstr(new Date(+a[0], +a[1] - 1 + n, 1)); }

  F.goto = function (tab) { ui.tab = tab || 'assets'; };
  g.Fin = F;
})(window);
