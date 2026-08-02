/* ========== 首页总看板 ========== */
(function (g) {
  var H = {};

  function ensureTop3() {
    var st = S.get(), t = U.today();
    if (st.top3.date !== t) {
      var carry = (st.top3.items || []).filter(function (i) { return i.text && !i.done; });
      st.top3 = {
        date: t,
        items: [0, 1, 2].map(function (i) { return { text: carry[i] ? carry[i].text : '', done: false }; })
      };
      S.save();
    }
  }

  H.render = function (el) {
    ensureTop3();
    var st = S.get();
    var sp = S.q.studyProgress();
    var w = S.q.weekStudy();
    var todo = st.tasks.filter(function (t) { return t.status !== '已完成'; });
    var dueToday = todo.filter(function (t) { return t.due && t.due <= U.today(); });
    var savP = S.f.savingsProgress();
    var mStat = S.f.monthStat();
    var ls = S.l.weekScore();
    var nc = S.l.nextCheckup();
    var ci = S.q.todayCheckin();

    var h = '<div class="goals-3">';

    h += '<div class="goal-card gc-study" data-go="study">' +
      '<div class="gc-h"><div class="gc-ic">📚</div><div><div class="gc-t">公考备考</div>' +
      '<div class="gc-s">国考 ' + S.q.examProgress('国考专项') + '% · 吉林省考 ' + S.q.examProgress('吉林省考专项') + '%</div></div>' +
      '<div class="gc-pct">' + sp + '%</div></div>' +
      UI.progressBar(sp) +
      '<div class="gc-meta"><div>本周学习<b>' + U.hrs(w.minutes) + ' h</b></div>' +
      '<div>本周正确率<b>' + w.rate + '%</b></div>' +
      '<div>待办任务<b>' + todo.length + ' 项</b></div>' +
      '<div>打卡<b>' + w.days + '/7 天</b></div></div></div>';

    h += '<div class="goal-card gc-money" data-go="finance">' +
      '<div class="gc-h"><div class="gc-ic">💰</div><div><div class="gc-t">攒钱规划</div>' +
      '<div class="gc-s">' + U.money0(st.finance.savings.balance) + ' / ' + U.money0(st.finance.savings.target) + '</div></div>' +
      '<div class="gc-pct">' + savP + '%</div></div>' +
      UI.progressBar(savP) +
      '<div class="gc-meta"><div>本月结余<b class="' + (mStat.surplus >= 0 ? 'pos' : 'neg') + '">' + U.money0(mStat.surplus) + '</b></div>' +
      '<div>医疗备用金<b>' + U.money0(st.finance.medical.balance) + '</b></div>' +
      '<div>本月弹性消费<b>' + U.money0(mStat.byCat.flex) + '</b></div></div></div>';

    h += '<div class="goal-card gc-life" data-go="life">' +
      '<div class="gc-h"><div class="gc-ic">🌱</div><div><div class="gc-t">生活配套</div>' +
      '<div class="gc-s">作息 · 运动 · 体检</div></div>' +
      '<div class="gc-pct">' + ls.score + '%</div></div>' +
      UI.progressBar(ls.score) +
      '<div class="gc-meta"><div>本周运动<b>' + ls.sport + '/' + ls.sportGoal + ' 次</b></div>' +
      '<div>作息达标<b>' + ls.sleepOk + ' 天</b></div>' +
      '<div>下次体检<b>' + (nc ? nc.date.slice(5) : '未设置') + '</b></div></div></div>';

    h += '</div>';

    /* 今日三件要事 */
    h += '<div class="card top3"><div class="card-h"><h3>🎯 今日 3 件核心要事</h3>' +
      '<span class="hint">' + U.today() + ' 周' + U.wdOf(U.today()) + '</span></div>' +
      st.top3.items.map(function (it, i) {
        return '<div class="t3 ' + (it.done ? 'done' : '') + '">' +
          '<div class="t3-no" data-t3="' + i + '">' + (it.done ? '✓' : (i + 1)) + '</div>' +
          '<input type="text" data-t3i="' + i + '" value="' + U.esc(it.text) + '" placeholder="第 ' + (i + 1) + ' 件要事，例：行测数量关系 30 题">' +
          '</div>';
      }).join('') +
      '<p class="tiny muted" style="margin-top:8px">未完成的要事会自动顺延到明天</p></div>';

    /* 快捷入口 */
    h += '<div class="card"><div class="card-h"><h3>快捷入口</h3></div><div class="quick">' +
      '<button data-q="task"><span class="i">📝</span>新增学习任务</button>' +
      '<button data-q="txn"><span class="i">💴</span>登记收支</button>' +
      '<button data-q="checkin"><span class="i">✅</span>学习打卡</button>' +
      '<button data-q="review"><span class="i">🗓</span>每周复盘</button>' +
      '</div></div>';

    /* 今日任务 */
    h += '<div class="card"><div class="card-h"><h3>今日 / 逾期任务</h3>' +
      '<span class="hint">' + dueToday.length + ' 项</span></div>';
    if (!dueToday.length) h += '<p class="tiny muted">今天没有到期任务，可以按计划推进长线内容。</p>';
    else h += dueToday.slice(0, 8).map(function (t) {
      var over = t.due < U.today();
      return '<div class="task ' + (over ? 'overdue' : '') + '">' +
        '<div class="tick ' + (t.status === '进行中' ? 'doing' : '') + '" data-htick="' + t.id + '">' + (t.status === '进行中' ? '·' : '') + '</div>' +
        '<div class="t-body"><div class="t-title">' + U.esc(t.title) + '</div>' +
        '<div class="t-tags"><span class="chip">' + (S.C.MODULE_ICON[t.module] || '') + ' ' + t.module + '</span>' +
        (t.exam === '国考专项' ? '<span class="chip gk">国考</span>' : t.exam === '吉林省考专项' ? '<span class="chip jl">吉林省考</span>' : '') +
        (t.jlFeature ? '<span class="chip feat">⭐特色</span>' : '') +
        (over ? '<span class="chip danger">逾期 ' + (-U.diffDays(U.today(), t.due)) + ' 天</span>' : '<span class="chip mute">今天</span>') +
        '</div></div></div>';
    }).join('');
    h += '</div>';

    /* 今日状态 */
    h += '<div class="card"><div class="card-h"><h3>今日状态</h3></div>' +
      '<div class="kv"><span>学习打卡</span><b>' + (ci ? '✅ 已打卡 · ' + U.hrs(ci.minutes) + ' h' : '⏳ 未打卡') + '</b></div>' +
      '<div class="kv"><span>今日学习目标</span><b>' + U.mins(st.settings.dailyStudyGoal) + '</b></div>' +
      '<div class="kv"><span>本月学习资料支出</span><b>' + U.money0(mStat.byCat.study) + '</b></div>' +
      '<div class="kv"><span>⭐ 吉林特色考点任务</span><b>' +
      st.tasks.filter(function (t) { return t.jlFeature && t.status === '已完成'; }).length + ' / ' +
      st.tasks.filter(function (t) { return t.jlFeature; }).length + '</b></div>' +
      '</div>';

    el.innerHTML = h;

    /* 事件 */
    U.$$('[data-go]', el).forEach(function (c) {
      c.onclick = function (e) { if (e.target.closest('input')) return; App.go(c.dataset.go); };
    });
    U.$$('[data-t3]', el).forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.t3;
        st.top3.items[i].done = !st.top3.items[i].done;
        S.commit();
      };
    });
    U.$$('[data-t3i]', el).forEach(function (inp) {
      inp.onchange = inp.onblur = function () {
        st.top3.items[+inp.dataset.t3i].text = inp.value;
        S.save();
      };
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') inp.blur(); });
    });
    U.$$('[data-q]', el).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.q;
        if (k === 'task') Study.taskForm();
        else if (k === 'txn') Fin.txnForm(null, 'expense');
        else if (k === 'checkin') Study.checkinForm();
        else Review.open(S.get().reviews.filter(function (r) { return r.weekStart === U.dstr(U.sow(new Date())); })[0] || null);
      };
    });
    U.$$('[data-htick]', el).forEach(function (b) {
      b.onclick = function () {
        var t = st.tasks.filter(function (x) { return x.id === b.dataset.htick; })[0];
        if (!t) return;
        t.status = '已完成'; t.doneAt = U.today();
        UI.toast('完成 +1 💪', 'ok'); S.commit();
      };
    });
  };

  g.Home = H;
})(window);
