/* ========== 公考备考 · 错题本 ========== */
(function (g) {
  var WrongQ = {};
  var MODULES = ['行测', '申论', '时政', '其他'];
  var EXAMS = ['通用', '国考专项', '吉林省考专项'];
  var SOURCES = ['真题', '刷题', '时政打卡', '其他'];

  var ui = { module: '', mastered: '' };

  function list() {
    var st = S.get();
    if (!st.wrongQs) st.wrongQs = [];
    return st.wrongQs;
  }

  WrongQ.addExternal = function (o) {
    var st = S.get();
    if (!st.wrongQs) st.wrongQs = [];
    st.wrongQs.unshift({
      id: U.uid(), q: o.q || '', module: o.module || '其他', exam: o.exam || '通用',
      reason: o.reason || '', solution: o.solution || '', source: o.source || '其他',
      link: o.link || '', createdAt: U.today(), mastered: false, review: 0
    });
    S.commit();
  };

  WrongQ.form = function (rec) {
    var isNew = !rec;
    var t = rec || { id: '', q: '', module: '行测', exam: '通用', reason: '', solution: '', source: '其他', link: '', mastered: false };
    UI.form({
      title: isNew ? '添加错题' : '编辑错题',
      fields: [
        { key: 'q', label: '题目 / 错题要点', type: 'textarea', required: true, value: t.q, placeholder: '题干或易错点概括' },
        { key: 'module', label: '所属模块', type: 'options', value: t.module, options: MODULES },
        { key: 'exam', label: '考试标签', type: 'options', value: t.exam, options: EXAMS },
        { key: 'source', label: '来源', type: 'options', value: t.source, options: SOURCES },
        { key: 'reason', label: '错误原因', type: 'textarea', value: t.reason, placeholder: '为什么错？审题 / 知识点 / 计算…' },
        { key: 'solution', label: '正确解析', type: 'textarea', value: t.solution, placeholder: '正确思路与结论' },
        { key: 'link', label: '相关链接（可选）', type: 'url', value: t.link, placeholder: 'https:// 题库 / 笔记链接' }
      ],
      onDelete: isNew ? null : function () {
        var st = S.get(); st.wrongQs = st.wrongQs.filter(function (x) { return x.id !== t.id; }); S.commit(); UI.toast('已删除');
      },
      onSubmit: function (v) {
        var st = S.get();
        if (isNew) { v.id = U.uid(); v.createdAt = U.today(); v.mastered = false; v.review = 0; st.wrongQs.unshift(v); UI.toast('已加入错题本', 'ok'); }
        else {
          var i = st.wrongQs.findIndex(function (x) { return x.id === t.id; });
          v.id = t.id; v.createdAt = t.createdAt; v.mastered = t.mastered; v.review = t.review;
          st.wrongQs[i] = v; UI.toast('已保存', 'ok');
        }
        S.commit();
      }
    });
  };

  WrongQ.render = function (el) {
    var all = list();
    var total = all.length;
    var mastered = all.filter(function (x) { return x.mastered; }).length;
    var pending = total - mastered;

    var h = '<div class="card"><div class="card-h"><h3>📕 错题本</h3><span class="hint">共 ' + total + ' 题</span></div>' +
      '<div class="rec-grid">' +
      '<div class="rec"><div class="rec-d">待攻克</div><div class="rec-s">' + pending + '</div></div>' +
      '<div class="rec"><div class="rec-d">已掌握</div><div class="rec-s ok">' + mastered + '</div></div></div>' +
      '<button class="btn btn-primary btn-block" id="wqAdd" style="margin-top:10px">＋ 添加错题</button></div>';

    // 筛选
    h += '<div class="filters" style="margin:10px 0">' +
      ['全部', '行测', '申论', '时政', '其他'].map(function (m) {
        return '<button class="btn btn-sm ' + (ui.module === m ? 'btn-primary' : '') + '" data-m="' + m + '">' + m + '</button>';
      }).join('') +
      '<span style="width:8px"></span>' +
      ['全部', '待攻克', '已掌握'].map(function (s) {
        var v = s === '全部' ? '' : (s === '待攻克' ? '0' : '1');
        return '<button class="btn btn-sm ' + (ui.mastered === v ? 'btn-primary' : '') + '" data-s="' + v + '">' + s + '</button>';
      }).join('') + '</div>';

    var flt = all.filter(function (x) {
      if (ui.module && ui.module !== '全部' && x.module !== ui.module) return false;
      if (ui.mastered === '0' && x.mastered) return false;
      if (ui.mastered === '1' && !x.mastered) return false;
      return true;
    });
    h += '<div class="tiny muted" style="margin:4px 2px 8px">显示 ' + flt.length + ' 题</div>';

    if (!flt.length) h += UI.empty('📭', '暂无错题，从时政打卡或手动添加吧');
    else h += flt.map(function (x) {
      var ec = x.exam === '吉林省考专项' ? 'jl' : (x.exam === '国考专项' ? 'gk' : 'mute');
      var examLab = x.exam === '吉林省考专项' ? '吉林省考' : (x.exam === '国考专项' ? '国考' : '通用');
      return '<div class="wq ' + (x.mastered ? 'done' : '') + '" data-id="' + x.id + '">' +
        '<div class="wq-q">' + U.esc(x.q) + '</div>' +
        '<div class="wq-meta">' +
        '<span class="chip">' + U.esc(x.module) + '</span>' +
        '<span class="chip ' + ec + '">' + examLab + '</span>' +
        '<span class="chip mute">' + U.esc(x.source) + '</span>' +
        (x.link ? '<span class="chip mute">🔗</span>' : '') +
        '</div>' +
        (x.reason ? '<div class="wq-row wq-reason"><b>错误原因：</b>' + U.esc(x.reason) + '</div>' : '') +
        (x.solution ? '<div class="wq-row wq-sol"><b>正确解析：</b>' + U.esc(x.solution) + '</div>' : '') +
        '<div class="wq-foot">' +
        '<button class="btn btn-sm" data-edit="' + x.id + '">编辑</button>' +
        '<button class="btn btn-sm ' + (x.mastered ? '' : 'btn-primary') + '" data-mas="' + x.id + '">' + (x.mastered ? '↩ 取消掌握' : '✓ 标记已掌握') + '</button>' +
        (x.link ? '<button class="btn btn-sm" data-link="' + x.id + '">打开链接</button>' : '') +
        '</div></div>';
    }).join('');
    el.innerHTML = h;

    el.querySelector('#wqAdd').onclick = function () { WrongQ.form(null); };
    U.$$('[data-m]', el).forEach(function (b) { b.onclick = function () { ui.module = b.dataset.m; WrongQ.render(el); }; });
    U.$$('[data-s]', el).forEach(function (b) { b.onclick = function () { ui.mastered = b.dataset.s; WrongQ.render(el); }; });
    U.$$('[data-edit]', el).forEach(function (b) {
      b.onclick = function () { var r = list().filter(function (x) { return x.id === b.dataset.edit; })[0]; if (r) WrongQ.form(r); };
    });
    U.$$('[data-mas]', el).forEach(function (b) {
      b.onclick = function () {
        var st = S.get(), r = st.wrongQs.filter(function (x) { return x.id === b.dataset.mas; })[0];
        if (r) { r.mastered = !r.mastered; if (r.mastered) r.review = (r.review || 0) + 1; S.commit(); UI.toast(r.mastered ? '已标记掌握 👍' : '已取消', 'ok'); WrongQ.render(el); }
      };
    });
    U.$$('[data-link]', el).forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var r = list().filter(function (x) { return x.id === b.dataset.link; })[0];
        if (r && r.link) window.open(r.link, '_blank');
      };
    });
    U.$$('.wq', el).forEach(function (card) {
      card.onclick = function (e) {
        if (e.target.closest('button')) return;
        var r = list().filter(function (x) { return x.id === card.dataset.id; })[0];
        if (r) WrongQ.form(r);
      };
    });
  };

  g.WrongQ = WrongQ;
})(window);
