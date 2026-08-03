/* ========== 公考备考 · 每日时政打卡 10 题 ========== */
(function (g) {
  var Politics = {};

  // 题库：依据历年国考 / 吉林省考常识与时政考情整理（单选）
  // exam: 国考 | 吉林省考 | 通用 ；cat: 模块分类
  var BANK = [
    { id: 'p01', cat: '政治理论', exam: '国考', q: '我们推进的现代化，是中国共产党领导的社会主义现代化，必须坚持以（ ）为中心。',
      opts: ['经济建设', '人民', '发展速度', '城市化率'], ans: 1, exp: '中国式现代化坚持人民至上，以人民为中心是本质要求。' },
    { id: 'p02', cat: '政治理论', exam: '国考', q: '“新质生产力”特点是创新，关键在质优，本质是（ ）。',
      opts: ['传统生产力', '先进生产力', '劳动密集型生产力', '资源型生产力'], ans: 1, exp: '新质生产力由技术革命性突破、生产要素创新性配置而催生，本质是先进生产力。' },
    { id: 'p03', cat: '政治理论', exam: '通用', q: '党的二十大指出，（ ）是全面建设社会主义现代化国家的首要任务。',
      opts: ['高速增长', '高质量发展', '科技创新', '共同富裕'], ans: 1, exp: '高质量发展是全面建设社会主义现代化国家的首要任务。' },
    { id: 'p04', cat: '重要会议', exam: '国考', q: '2024 年 7 月召开的党的二十届三中全会，研究部署了（ ）。',
      opts: ['全面从严治党', '进一步全面深化改革、推进中国式现代化', '全面依法治国', '乡村振兴战略'], ans: 1, exp: '二十届三中全会主题为进一步全面深化改革、推进中国式现代化。' },
    { id: 'p05', cat: '重要会议', exam: '国考', q: '做好经济工作，中央经济工作会议强调要坚持（ ）的工作总基调。',
      opts: ['稳中求进', '突飞猛进', '扩大内需', '大干快上'], ans: 0, exp: '“坚持稳中求进工作总基调”是做好经济工作的方法论。' },
    { id: 'p06', cat: '乡村振兴', exam: '通用', q: '2024 年中央一号文件聚焦（ ）。',
      opts: ['推进乡村全面振兴', '科技创新突破', '国企改革', '城市更新'], ans: 0, exp: '2024 年中央一号文件《关于学习运用“千村示范、万村整治”工程经验有力有效推进乡村全面振兴的意见》。' },
    { id: 'p07', cat: '政治理论', exam: '国考', q: '全过程人民民主是社会主义民主政治的（ ）。',
      opts: ['本质属性', '根本保证', '组织形式', '一种手段'], ans: 0, exp: '全过程人民民主是社会主义民主政治的本质属性。' },
    { id: 'p08', cat: '生态文明', exam: '通用', q: '我国力争（ ）年前实现碳达峰、（ ）年前实现碳中和。',
      opts: ['2025 / 2050', '2030 / 2060', '2035 / 2060', '2030 / 2050'], ans: 1, exp: '“双碳”目标：2030 年前碳达峰、2060 年前碳中和。' },
    { id: 'p09', cat: '生态文明', exam: '通用', q: '“绿水青山就是金山银山”理念的发源地是（ ）。',
      opts: ['福建武夷山', '浙江安吉', '江西井冈山', '陕西延安'], ans: 1, exp: '该理念源于浙江安吉余村。' },
    { id: 'p10', cat: '科技成就', exam: '国考', q: '我国空间站的名称为（ ）。',
      opts: ['天宫', '神舟', '天问', '嫦娥'], ans: 0, exp: '中国空间站名为“天宫”。' },
    { id: 'p11', cat: '科技成就', exam: '国考', q: '嫦娥六号任务实现了人类首次（ ）。',
      opts: ['载人登月', '月球背面自动采样返回', '火星着陆', '建立月球基地'], ans: 1, exp: '嫦娥六号实现人类首次月球背面采样返回。' },
    { id: 'p12', cat: '科技成就', exam: '国考', q: 'C919 是我国自主研制的（ ）。',
      opts: ['大型客机', '武装直升机', '隐形战斗机', '货运无人机'], ans: 0, exp: 'C919 是国产大型喷气式客机。' },
    { id: 'p13', cat: '科技成就', exam: '国考', q: '我国自主研发的通用处理器“龙芯”系列主要由（ ）研制。',
      opts: ['中科院计算所', '某手机厂商', '传统车企', '房地产企业'], ans: 0, exp: '龙芯由中科院计算所龙芯团队研制。' },
    { id: 'p14', cat: '科技成就', exam: '通用', q: '2024 年《政府工作报告》将（ ）作为发展新动能的重点方向。',
      opts: ['房地产投资', '人工智能+', '煤炭扩产', '传统制造'], ans: 1, exp: '“人工智能+”是 2024 年政府工作报告重点部署的新增长引擎。' },
    { id: 'p15', cat: '科技成就', exam: '国考', q: '我国量子计算原型机“九章”属于（ ）路线的重要突破。',
      opts: ['超导量子', '光量子', '生物计算', '类脑计算'], ans: 1, exp: '“九章”是基于光量子的量子计算原型机。' },
    { id: 'p16', cat: '法律', exam: '通用', q: '《中华人民共和国民法典》自（ ）起施行，是新中国第一部以“法典”命名的法律。',
      opts: ['2020-01-01', '2021-01-01', '2021-05-28', '2020-05-28'], ans: 1, exp: '民法典 2020 年 5 月 28 日通过，2021 年 1 月 1 日施行。' },
    { id: 'p17', cat: '法律', exam: '国考', q: '新修订的《行政复议法》自（ ）起施行。',
      opts: ['2023-01-01', '2024-01-01', '2024-07-01', '2025-01-01'], ans: 1, exp: '新修订行政复议法 2024 年 1 月 1 日施行。' },
    { id: 'p18', cat: '法律', exam: '国考', q: '新修订的《保守国家秘密法》自（ ）起施行。',
      opts: ['2024-05-01', '2024-10-01', '2024-12-01', '2025-01-01'], ans: 0, exp: '新修订保密法 2024 年 5 月 1 日施行。' },
    { id: 'p19', cat: '法律', exam: '通用', q: '国家宪法日是每年的（ ）。',
      opts: ['3 月 15 日', '12 月 4 日', '10 月 1 日', '9 月 30 日'], ans: 1, exp: '12 月 4 日为国家宪法日。' },
    { id: 'p20', cat: '经济', exam: '通用', q: '共同富裕是中国特色社会主义的（ ）。',
      opts: ['本质要求', '短期目标', '对外承诺', '临时政策'], ans: 0, exp: '共同富裕是中国特色社会主义的本质要求。' },
    { id: 'p21', cat: '经济', exam: '国考', q: '构建新发展格局，要坚持（ ）为主体、国内国际双循环相互促进。',
      opts: ['内需', '出口', '投资', '外资'], ans: 0, exp: '新发展格局以国内大循环为主体。' },
    { id: 'p22', cat: '乡村振兴', exam: '通用', q: '乡村全面振兴总要求是：产业兴旺、生态宜居、乡风文明、治理有效、（ ）。',
      opts: ['生活富裕', '收入倍增', '教育均衡', '医疗全覆盖'], ans: 0, exp: '乡村振兴总要求“二十字”：产业兴旺、生态宜居、乡风文明、治理有效、生活富裕。' },
    { id: 'p23', cat: '粮食安全', exam: '通用', q: '我国把（ ）作为治国理政的头等大事。',
      opts: ['能源安全', '粮食安全', '网络安全', '金融安全'], ans: 1, exp: '粮食安全是“国之大者”，是治国理政头等大事。' },
    { id: 'p24', cat: '吉林省情', exam: '吉林省考', q: '（ ）是我国沿边开发开放的重要区域，也是吉林省对外开放的先导区。',
      opts: ['长吉图开发开放先导区', '哈长城市群', '辽中南工业区', '京津冀协同区'], ans: 0, exp: '长吉图开发开放先导区是吉林省沿边开放先导区。' },
    { id: 'p25', cat: '吉林省情', exam: '吉林省考', q: '中国一汽总部位于（ ）。',
      opts: ['沈阳', '长春', '哈尔滨', '大连'], ans: 1, exp: '中国一汽总部位于吉林长春。' },
    { id: 'p26', cat: '吉林省情', exam: '吉林省考', q: '长白山位于我国（ ）东南部，是松花江、图们江、鸭绿江的发源地。',
      opts: ['黑龙江', '吉林', '辽宁', '内蒙古'], ans: 1, exp: '长白山位于吉林省东南部。' },
    { id: 'p27', cat: '吉林省情', exam: '吉林省考', q: '查干湖以（ ）闻名，是吉林重要的生态与渔业资源。',
      opts: ['冬捕', '龙舟赛', '温泉', '红叶'], ans: 0, exp: '查干湖冬捕是吉林特色渔猎文化。' },
    { id: 'p28', cat: '吉林省情', exam: '吉林省考', q: '吉林省的省会是（ ），简称“吉”。',
      opts: ['吉林市', '长春', '四平', '延吉'], ans: 1, exp: '吉林省会为长春。' },
    { id: 'p29', cat: '吉林省情', exam: '吉林省考', q: '吉林省地处世界“黄金玉米带”和“黄金水稻带”，是全国重要的（ ）。',
      opts: ['商品粮基地', '畜牧区', '渔场', '矿区'], ans: 0, exp: '吉林是国家重要的商品粮基地。' },
    { id: 'p30', cat: '吉林省情', exam: '吉林省考', q: '中车长客股份有限公司（长春客车厂）是我国重要的（ ）研发制造基地。',
      opts: ['高铁 / 动车组', '汽车整车', '民用飞机', '船舶'], ans: 0, exp: '中车长客是国内高铁/动车组龙头制造企业。' },
    { id: 'p31', cat: '吉林省情', exam: '吉林省考', q: '新时代推动东北全面振兴，要把（ ）作为主攻方向之一。',
      opts: ['发展现代化大农业', '扩张房地产', '扩大采矿', '单纯出口加工'], ans: 0, exp: '吉林、东北优势在现代化大农业，是国家大粮仓。' },
    { id: 'p32', cat: '政治理论', exam: '国考', q: '“两个结合”是指把马克思主义基本原理同中国具体实际相结合、同（ ）相结合。',
      opts: ['中华优秀传统文化', '西方现代化理论', '苏联经验', '市场经济'], ans: 0, exp: '“两个结合”的第二个结合是同中华优秀传统文化相结合。' },
    { id: 'p33', cat: '基层治理', exam: '通用', q: '加强基层治理，要健全（ ）的基层群众自治机制。',
      opts: ['党组织包办一切', '共建共治共享', '政府全权管理', '市场主导'], ans: 1, exp: '基层治理强调党组织领导下共建共治共享。' },
    { id: 'p34', cat: '民生', exam: '通用', q: '强化（ ）政策，是稳就业、保民生的关键。',
      opts: ['就业优先', '投资拉动', '出口导向', '消费券补贴'], ans: 0, exp: '就业是最基本的民生，坚持就业优先。' },
    { id: 'p35', cat: '吉林省情', exam: '吉林省考', q: '吉林省“一主六双”高质量发展战略中，“一主”指（ ）。',
      opts: ['长春现代化都市圈', '吉林市', '延边州', '松原市'], ans: 0, exp: '“一主”即构建以长春为核心的现代化都市圈。' },
    { id: 'p36', cat: '吉林省情', exam: '吉林省考', q: '吉林省依托生态与气候优势，将（ ）作为高质量发展的重要方向。',
      opts: ['冰雪经济与生态旅游', '重化工', '煤炭开采', '房地产'], ans: 0, exp: '吉林“冰天雪地也是金山银山”，冰雪经济与生态旅游是特色优势。' }
  ];

  var ui = { started: false, picked: [], answers: {} };

  function seed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shuffle(arr, s) {
    arr = arr.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
      var j = s % (i + 1), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function dailySet(date) { return shuffle(BANK, seed(date)).slice(0, 10); }

  function todayRec() {
    var st = S.get();
    return (st.politics.records || []).filter(function (r) { return r.date === U.today(); })[0] || null;
  }
  function allRecs() { return (S.get().politics.records || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }

  function saveRecord(date, picked, answers) {
    var total = picked.length, right = 0, wrong = [];
    picked.forEach(function (q, i) {
      if (String(answers['q' + i]) === String(q.ans)) right++;
      else wrong.push(q.id);
    });
    var st = S.get();
    if (!st.politics.records) st.politics.records = [];
    st.politics.records = st.politics.records.filter(function (r) { return r.date !== date; });
    st.politics.records.unshift({ date: date, total: total, right: right, wrong: wrong, ts: Date.now() });
    S.commit();
    return st.politics.records[0];
  }

  function qHTML(q, idx) {
    var ec = q.exam === '吉林省考' ? 'jl' : (q.exam === '国考' ? 'gk' : '');
    return '<div class="quiz" data-qi="' + idx + '">' +
      '<div class="q-top"><span class="q-no">第 ' + (idx + 1) + ' 题</span>' +
      '<span class="chip ' + ec + '">' + U.esc(q.cat) + '</span></div>' +
      '<div class="q-t">' + U.esc(q.q) + '</div>' +
      '<div class="opts" data-k="q' + idx + '">' + q.opts.map(function (o, i) {
        return '<div class="opt" data-v="' + i + '">' + String.fromCharCode(65 + i) + '. ' + U.esc(o) + '</div>';
      }).join('') + '</div>' +
      '<div class="q-exp"><b>解析：</b>' + U.esc(q.exp) + '</div></div>';
  }

  function bindQuiz(el) {
    U.$$('.quiz .opts', el).forEach(function (box) {
      box.addEventListener('click', function (e) {
        var o = e.target.closest('.opt'); if (!o) return;
        if (box.closest('.quiz').classList.contains('done')) return;
        U.$$('.opt', box).forEach(function (x) { x.className = 'opt'; });
        o.className = 'opt on';
      });
    });
  }

  Politics.render = function (el) {
    var st = S.get();
    if (!st.politics) st.politics = { records: [] };
    var rec = todayRec();

    if (ui.started) { renderQuiz(el); return; }

    var h = '';
    h += '<div class="pol-intro">' +
      '<h3>📅 每日时政打卡 · 10 题</h3>' +
      '<p>依据历年国考、吉林省考常识与时政考情整理，每天自动抽取 10 题，覆盖政治理论、重要会议、科技成就、法律、经济、乡村振兴、吉林省情等。' +
      '题目仅供日常积累，请以最新官方表述为准。</p>' +
      (rec
        ? '<button class="btn btn-primary btn-block" id="polRedo">🔁 重做今日 10 题</button>'
        : '<button class="btn btn-primary btn-block" id="polStart">✅ 开始今日 10 题</button>') +
      '</div>';

    if (rec) {
      var rate = Math.round(rec.right / rec.total * 100);
      h += '<div class="result-banner"><div class="rb-pct">' + rate + '<span style="font-size:16px">%</span></div>' +
        '<div class="rb-sub">今日已完成 · 正确 ' + rec.right + ' / ' + rec.total + ' 题</div>' +
        '<div class="rb-actions"><button class="btn" id="polWrong">📒 看看错题</button>' +
        '<button class="btn" id="polRedo2">重做</button></div></div>';
    }

    // 历史记录
    var recs = allRecs().slice(0, 12);
    h += '<div class="sec-t">近期打卡记录</div>';
    if (!recs.length) h += UI.empty('📊', '还没有打卡记录，今天来做第一套吧');
    else {
      h += '<div class="rec-grid">' + recs.map(function (r) {
        var rt = Math.round(r.right / r.total * 100);
        var cls = rt >= 80 ? 'ok' : (rt >= 60 ? '' : 'danger');
        return '<div class="rec"><div class="rec-d">' + r.date.slice(5) + (r.date === U.today() ? ' · 今天' : '') + '</div>' +
          '<div class="rec-s ' + cls + '">' + rt + '%<small> &nbsp;' + r.right + '/' + r.total + '</small></div></div>';
      }).join('') + '</div>';
    }
    el.innerHTML = h;

    var qs = el.querySelector('#polStart');
    if (qs) qs.onclick = function () { ui.started = true; ui.answers = {}; ui.picked = dailySet(U.today()); Politics.render(el); };
    var qr = el.querySelector('#polRedo'), qr2 = el.querySelector('#polRedo2');
    function redo() {
      var s = S.get(); if (s.politics.records) s.politics.records = s.politics.records.filter(function (r) { return r.date !== U.today(); });
      S.commit(); ui.started = true; ui.answers = {}; ui.picked = dailySet(U.today()); Politics.render(el);
    }
    if (qr) qr.onclick = redo;
    if (qr2) qr2.onclick = redo;
    var qw = el.querySelector('#polWrong');
    if (qw) qw.onclick = function () { showWrong(rec, el); };
  };

  function renderQuiz(el) {
    var h = '<div class="card-h"><h3>今日时政 10 题</h3><span class="hint">做完点底部提交</span></div>' +
      ui.picked.map(qHTML).join('') +
      '<button class="btn btn-primary btn-block" id="polSubmit" style="margin-top:6px">提交并查看解析</button>';
    el.innerHTML = h;
    bindQuiz(el);
    el.querySelector('#polSubmit').onclick = function () {
      var miss = [];
      ui.picked.forEach(function (q, i) {
        var box = el.querySelector('.quiz[data-qi="' + i + '"] .opts');
        if (!box.querySelector('.opt.on')) miss.push(i + 1);
      });
      if (miss.length) { UI.toast('还有第 ' + miss.join('、') + ' 题未作答', 'err'); return; }
      ui.picked.forEach(function (q, i) {
        var box = el.querySelector('.quiz[data-qi="' + i + '"] .opts');
        var sel = box.querySelector('.opt.on').dataset.v;
        ui.answers['q' + i] = sel;
        var card = box.closest('.quiz');
        card.classList.add('done', 'show');
        U.$$('.opt', box).forEach(function (o, oi) {
          if (oi === q.ans) o.className = 'opt correct';
          else if (oi === +sel) o.className = 'opt wrong';
        });
      });
      var rec = saveRecord(U.today(), ui.picked, ui.answers);
      ui.started = false;
      // 显示结果条 + 错题入错题本入口
      var rate = Math.round(rec.right / rec.total * 100);
      var banner = document.createElement('div');
      banner.className = 'result-banner';
      banner.innerHTML = '<div class="rb-pct">' + rate + '<span style="font-size:16px">%</span></div>' +
        '<div class="rb-sub">本次正确 ' + rec.right + ' / ' + rec.total + ' 题</div>' +
        (rec.wrong.length ? '<div class="rb-actions"><button class="btn" id="polToWrong">📒 错题库加入错题本（' + rec.wrong.length + '）</button>' +
          '<button class="btn" id="polBack">返回</button></div>'
          : '<div class="rb-actions"><button class="btn" id="polBack">返回</button></div>');
      el.insertBefore(banner, el.firstChild);
      var bt = el.querySelector('#polToWrong');
      if (bt) bt.onclick = function () {
        var n = 0;
        ui.picked.forEach(function (q, i) {
          if (String(ui.answers['q' + i]) !== String(q.ans)) {
            WrongQ.addExternal({ q: q.q, module: '时政', exam: q.exam === '吉林省考' ? '吉林省考专项' : (q.exam === '国考' ? '国考专项' : '通用'),
              reason: '时政打卡答错', solution: q.exp, source: '时政打卡' });
            n++;
          }
        });
        UI.toast('已加入错题本 ' + n + ' 题', 'ok');
        App.go('wrong');
      };
      var bb = el.querySelector('#polBack');
      if (bb) bb.onclick = function () { Politics.render(el); };
      UI.toast('提交成功，本次正确率 ' + rate + '%', 'ok');
    };
  }

  function showWrong(rec, el) {
    var wrongQs = ui.picked.length ? ui.picked : BANK;
    var list = BANK.filter(function (q) { return rec.wrong.indexOf(q.id) >= 0; });
    if (!list.length) { UI.toast('今天没有错题，太棒了！', 'ok'); return; }
    UI.sheet({
      title: '今日错题 · ' + rec.date,
      body: list.map(function (q, i) {
        return '<div class="quiz done show" style="pointer-events:none"><div class="q-top"><span class="q-no">错 ' + (i + 1) + '</span>' +
          '<span class="chip ' + (q.exam === '吉林省考' ? 'jl' : q.exam === '国考' ? 'gk' : '') + '">' + U.esc(q.cat) + '</span></div>' +
          '<div class="q-t">' + U.esc(q.q) + '</div>' +
          '<div class="opts">' + q.opts.map(function (o, k) {
            var c = k === q.ans ? 'correct' : '';
            return '<div class="opt ' + c + '">' + String.fromCharCode(65 + k) + '. ' + U.esc(o) + '</div>';
          }).join('') + '</div>' +
          '<div class="q-exp" style="display:block"><b>解析：</b>' + U.esc(q.exp) + '</div></div>';
      }).join(''),
      footer: '<button class="btn" data-x>关闭</button>'
    });
  }

  Politics.reset = function () { ui.started = false; ui.picked = []; ui.answers = {}; };
  g.Politics = Politics;
})(window);
