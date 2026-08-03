/* ========== 阅读者：书单 · 读书笔记 · 金句摘抄 · 书签生成分享 ========== */
(function (g) {
  var R = {};
  var ui = { tab: 'books', openId: null, sub: 'notes', calMonth: U.mstr() };
  var curEl = null;
  var STATUS = ['想读', '在读', '已读'];
  var CATS = ['文学小说', '公考/时政', '历史人文', '自我成长', '专业工具', '其他'];

  function books() { return S.get().reader.books; }
  function book(id) { return books().filter(function (x) { return x.id === id; })[0]; }

  /* ---------------- 主渲染 ---------------- */
  R.render = function (el) {
    curEl = el;
    var bs = books();
    var cnt = function (s) { return bs.filter(function (b) { return b.status === s; }).length; };

    if (ui.openId && book(ui.openId)) { el.innerHTML = detail(book(ui.openId)); bindDetail(el); return; }

    var h = '<div class="card rd-head"><div class="rd-stats">' +
      '<div class="rd-st"><b>' + bs.length + '</b><span>总藏书</span></div>' +
      '<div class="rd-st"><b class="pos">' + cnt('在读') + '</b><span>在读</span></div>' +
      '<div class="rd-st"><b class="ok">' + cnt('已读') + '</b><span>已读</span></div>' +
      '<div class="rd-st"><b>' + cnt('想读') + '</b><span>想读</span></div>' +
      '</div></div>';

    h += '<div class="row" style="margin-bottom:12px">' +
      UI.seg([{ v: 'books', l: '📚 书单' }, { v: 'quotes', l: '✨ 金句摘抄' }], ui.tab, 'rtab') +
      '<span class="spacer"></span>' +
      (ui.tab === 'books' ? '<button class="btn btn-primary btn-sm" id="addBook">＋ 加书</button>'
        : '<button class="btn btn-primary btn-sm" id="addQuote">＋ 摘抄</button>') + '</div>';

    if (ui.tab === 'books') h += booksView(bs);
    else h += quotesView(bs);

    el.innerHTML = h;

    UI.bindSeg(el, 'rtab', function (v) { ui.tab = v; ui.openId = null; R.render(el); });
    if (ui.tab === 'quotes') bindQuotesView(el);
    var ab = el.querySelector('#addBook'); if (ab) ab.onclick = function () { bookForm(null); };
    var aq = el.querySelector('#addQuote'); if (aq) aq.onclick = function () { quoteForm(null, firstBookId()); };
    U.$$('[data-ob]', el).forEach(function (b) { b.onclick = function () { ui.openId = b.dataset.ob; R.render(el); }; });
  };

  /* ---------------- 书单视图 ---------------- */
  function booksView(bs) {
    if (!bs.length) return UI.empty('📚', '书架还空空的<br>点「＋ 加书」添加第一本书，可上传电子书随时阅读');
    return bs.map(function (b) {
      var notes = (b.notes || []).length, quotes = (b.quotes || []).length;
      var cov = b.cover ? '<img class="rd-cov" src="' + b.cover + '" alt="">'
        : '<div class="rd-cov rd-cov-ph">' + (b.title ? b.title.slice(0, 1) : '📖') + '</div>';
      return '<div class="rd-book" data-ob="' + b.id + '">' +
        cov +
        '<div class="rd-b-body">' +
        '<div class="rd-b-t">' + U.esc(b.title || '未命名') + '</div>' +
        '<div class="rd-b-a">' + U.esc(b.author || '佚名') + '</div>' +
        '<div class="t-tags">' +
        '<span class="chip ' + statusCls(b.status) + '">' + b.status + '</span>' +
        (b.category ? '<span class="chip mute">' + U.esc(b.category) + '</span>' : '') +
        (b.file ? '<span class="chip ok">📎 电子书</span>' : '') +
        (notes ? '<span class="chip mute">📝 ' + notes + '</span>' : '') +
        (quotes ? '<span class="chip mute">✨ ' + quotes + '</span>' : '') +
        '</div></div>' +
        '<div class="rd-b-arrow">›</div></div>';
    }).join('');
  }

  function statusCls(s) { return s === '已读' ? 'ok' : s === '在读' ? 'doing' : 'mute'; }

  /* ---------------- 书籍详情 ---------------- */
  function detail(b) {
    var h = '<div class="card rd-detail">' +
      '<div class="row" style="margin-bottom:8px"><button class="btn btn-sm" id="backBk">‹ 返回书架</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-sm" id="editBk">编辑</button>' +
      '<button class="btn btn-sm btn-danger" id="delBk" style="margin-left:8px">删除</button></div>' +
      '<div class="rd-d-head">' +
      (b.cover ? '<img class="rd-cov" src="' + b.cover + '">' : '<div class="rd-cov rd-cov-ph">' + (b.title ? b.title.slice(0, 1) : '📖') + '</div>') +
      '<div><div class="rd-b-t" style="font-size:16px">' + U.esc(b.title || '未命名') + '</div>' +
      '<div class="rd-b-a">' + U.esc(b.author || '佚名') + '</div>' +
      '<div class="t-tags"><span class="chip ' + statusCls(b.status) + '">' + b.status + '</span>' +
      (b.category ? '<span class="chip mute">' + U.esc(b.category) + '</span>' : '') + '</div>' +
      (b.file ? '<button class="btn btn-sm btn-primary" id="dlEbook" style="margin-top:8px">⬇ 下载电子书</button>' : '') +
      '</div></div>';

    h += '<div class="row" style="margin:12px 0">' +
      UI.seg([{ v: 'notes', l: '读书笔记' }, { v: 'quotes', l: '金句摘抄' }], ui.sub, 'bsub') + '</div>';

    if (ui.sub === 'notes') h += notesBlock(b);
    else h += quotesBlock(b);

    h += '</div>';
    return h;
  }

  function notesBlock(b) {
    var list = b.notes || [];
    var head = '<div class="toolbar"><b style="font-size:14px">读书笔记</b><span class="spacer"></span>' +
      '<button class="btn btn-primary btn-sm" id="addNote">＋ 写笔记</button></div>';
    if (!list.length) return head + UI.empty('📝', '还没有笔记<br>读有所得，随手记一笔');
    return head + list.slice().reverse().map(function (n) {
      return '<div class="rd-note">' +
        '<div class="rd-note-h"><span class="chip mute">📅 ' + n.date + '</span>' +
        (n.chapter ? '<span class="chip mute">' + U.esc(n.chapter) + '</span>' : '') +
        '<span class="spacer"></span><button class="icon-btn sm" data-dn="' + n.id + '">✕</button></div>' +
        '<div class="rd-note-t">' + U.esc(n.text || '').replace(/\n/g, '<br>') + '</div></div>';
    }).join('');
  }

  function quotesBlock(b) {
    var list = b.quotes || [];
    var head = '<div class="toolbar"><b style="font-size:14px">金句摘抄</b><span class="spacer"></span>' +
      '<button class="btn btn-primary btn-sm" id="addQuote2">＋ 摘抄</button></div>';
    if (!list.length) return head + UI.empty('✨', '读到触动的话，摘抄下来<br>还能一键生成书签分享');
    return head + list.slice().reverse().map(function (q) {
      return '<div class="rd-q' + (q.fav ? ' fav' : '') + '">' +
        '<div class="rd-q-t">“' + U.esc(q.text || '') + '”</div>' +
        '<div class="rd-q-meta">' +
        (q.page ? '<span class="chip mute">P' + U.esc(q.page) + '</span>' : '') +
        (q.fav ? '<span class="chip ok">★ 收藏</span>' : '') +
        '<span class="spacer"></span>' +
        '<button class="btn btn-sm" data-bm="' + q.id + '">🏷 生成书签</button>' +
        '<button class="icon-btn sm" data-fq="' + q.id + '">' + (q.fav ? '★' : '☆') + '</button>' +
        '<button class="icon-btn sm" data-dq="' + q.id + '">✕</button>' +
        '</div></div>';
    }).join('');
  }

  function bindDetail(el) {
    var b = book(ui.openId); if (!b) return;
    var back = el.querySelector('#backBk'); if (back) back.onclick = function () { ui.openId = null; R.render(el); };
    var edit = el.querySelector('#editBk'); if (edit) edit.onclick = function () { bookForm(b); };
    var del = el.querySelector('#delBk'); if (del) del.onclick = function () {
      UI.confirm('删除《' + (b.title || '未命名') + '》？', '该书及其笔记、金句都会一并删除，不可恢复。', function () {
        S.get().reader.books = books().filter(function (x) { return x.id !== b.id; });
        ui.openId = null; S.commit(); UI.toast('已删除'); R.render(el);
      }, true);
    };
    var dl = el.querySelector('#dlEbook'); if (dl) dl.onclick = function () { downloadEbook(b); };
    UI.bindSeg(el, 'bsub', function (v) { ui.sub = v; R.render(el); });
    var an = el.querySelector('#addNote'); if (an) an.onclick = function () { noteForm(b); };
    var aq = el.querySelector('#addQuote2'); if (aq) aq.onclick = function () { quoteForm(b, b.id); };

    U.$$('[data-dn]', el).forEach(function (x) {
      x.onclick = function () { b.notes = (b.notes || []).filter(function (n) { return n.id !== x.dataset.dn; }); S.commit(); R.render(el); };
    });
    U.$$('[data-dq]', el).forEach(function (x) {
      x.onclick = function () { b.quotes = (b.quotes || []).filter(function (q) { return q.id !== x.dataset.dq; }); S.commit(); R.render(el); };
    });
    U.$$('[data-fq]', el).forEach(function (x) {
      x.onclick = function () {
        var q = (b.quotes || []).filter(function (q) { return q.id === x.dataset.fq; })[0];
        if (q) { q.fav = !q.fav; S.commit(); R.render(el); }
      };
    });
    U.$$('[data-bm]', el).forEach(function (x) {
      x.onclick = function () {
        var q = (b.quotes || []).filter(function (qq) { return qq.id === x.dataset.bm; })[0];
        if (q) genBookmark(q, b);
      };
    });
  }

  /* ---------------- 全部金句视图 ---------------- */
  function quotesView(bs) {
    var all = [];
    bs.forEach(function (b) { (b.quotes || []).forEach(function (q) { all.push({ b: b, q: q }); }); });
    if (!all.length) return UI.empty('✨', '还没有金句<br>在书里读到触动的话，摘抄下来吧');
    all.sort(function (a, b) { return a.q.date < b.q.date ? 1 : -1; });
    return all.map(function (it) {
      var q = it.q, b = it.b;
      return '<div class="rd-q' + (q.fav ? ' fav' : '') + '">' +
        '<div class="rd-q-t">“' + U.esc(q.text || '') + '”</div>' +
        '<div class="rd-q-meta"><span class="chip mute">《' + U.esc(b.title || '') + '》</span>' +
        (q.page ? '<span class="chip mute">P' + U.esc(q.page) + '</span>' : '') +
        (q.fav ? '<span class="chip ok">★</span>' : '') +
        '<span class="spacer"></span>' +
        '<button class="btn btn-sm" data-bm2="' + b.id + '|' + q.id + '">🏷 生成书签</button>' +
        '<button class="icon-btn sm" data-fq2="' + b.id + '|' + q.id + '">' + (q.fav ? '★' : '☆') + '</button></div></div>';
    }).join('');
  }

  function bindQuotesView(el) {
    U.$$('[data-bm2]', el).forEach(function (x) {
      x.onclick = function () {
        var p = x.dataset.bm2.split('|'); var b = book(p[0]);
        var q = b && (b.quotes || []).filter(function (qq) { return qq.id === p[1]; })[0];
        if (b && q) genBookmark(q, b);
      };
    });
    U.$$('[data-fq2]', el).forEach(function (x) {
      x.onclick = function () {
        var p = x.dataset.fq2.split('|'); var b = book(p[0]);
        var q = b && (b.quotes || []).filter(function (qq) { return qq.id === p[1]; })[0];
        if (q) { q.fav = !q.fav; S.commit(); R.render(el); }
      };
    });
  }

  /* ---------------- 新增 / 编辑书 ---------------- */
  function bookForm(bk) {
    var isNew = !bk;
    var v = bk || { title: '', author: '', category: CATS[0], status: '想读', cover: '', file: null, page: '' };
    var st = S.get();
    var e = U.esc;
    var body = '<div class="f"><label>书名 <i class="req">*</i></label><input data-k="title" value="' + e(v.title) + '" placeholder="例：百年孤独"></div>' +
      '<div class="f"><label>作者</label><input data-k="author" value="' + e(v.author) + '" placeholder="例：加西亚·马尔克斯"></div>' +
      '<div class="f-row">' +
      '<div class="f"><label>分类</label><select data-k="category">' + CATS.map(function (c) {
        return '<option value="' + c + '"' + (c === v.category ? ' selected' : '') + '>' + c + '</option>';
      }).join('') + '</select></div>' +
      '<div class="f"><label>阅读状态</label><select data-k="status">' + STATUS.map(function (s) {
        return '<option value="' + s + '"' + (s === v.status ? ' selected' : '') + '>' + s + '</option>';
      }).join('') + '</select></div></div>' +
      '<div class="f"><label>阅读进度（看到第几页）</label><input data-k="page" type="number" inputmode="numeric" value="' + e(v.page) + '" placeholder="选填"></div>' +
      '<div class="f"><label>封面图（选填）</label><input type="file" id="covFile" accept="image/*"><div class="hint">也可稍后在编辑时上传</div>' +
      (v.cover ? '<div style="margin-top:6px"><img src="' + v.cover + '" style="height:84px;border-radius:8px"></div>' : '') + '</div>' +
      '<div class="f"><label>电子书文件（选填 · 可下载）</label><input type="file" id="ebFile" accept=".epub,.pdf,.mobi,.txt,.azw3,application/epub+zip,application/pdf">' +
      '<div class="hint">文件将保存在本机，仅你可见；过大文件可能受存储空间限制。</div>' +
      (v.file ? '<div style="margin-top:6px" class="tiny muted">当前已存：' + e(v.file.name) + '</div>' : '') + '</div>';

    UI.sheet({
      title: isNew ? '加一本书' : '编辑书籍',
      body: body,
      footer: (isNew ? '<button class="btn" data-x>取消</button>' : '<button class="btn btn-danger" data-del>删除</button>') +
        '<button class="btn btn-primary" data-ok>保存</button>',
      onMount: function (m, close) {
        var ok = m.querySelector('[data-ok]');
        ok.onclick = function () {
          var title = m.querySelector('[data-k="title"]').value.trim();
          if (!title) { UI.toast('请填写书名', 'err'); return; }
          var oldStatus = bk ? bk.status : '';
          var obj = {
            title: title,
            author: m.querySelector('[data-k="author"]').value.trim(),
            category: m.querySelector('[data-k="category"]').value,
            status: m.querySelector('[data-k="status"]').value,
            page: m.querySelector('[data-k="page"]').value
          };
          readFile(m.querySelector('#covFile'), function (cov) {
            if (isNew) {
              var nb = { id: U.uid(), cover: cov || '', file: null, updatedAt: U.today(), notes: [], quotes: [] };
              Object.assign(nb, obj);
              st.reader.books.push(nb);
              ui.openId = nb.id;
              UI.toast('已加入书架 📚', 'ok');
            } else {
              Object.assign(bk, obj);
              if (cov) bk.cover = cov;
              bk.updatedAt = U.today();
              UI.toast('已保存', 'ok');
            }
            attachEbook(m.querySelector('#ebFile'), function (eb) {
              if (isNew) st.reader.books[st.reader.books.length - 1].file = eb;
              else bk.file = eb;
              // 读完一本书的奖励
              if (obj.status === '已读' && oldStatus !== '已读') {
                S.drop(3, '读完《' + title + '》', '阅读', '📖');
              }
              S.commit();
              close(); if (curEl) R.render(curEl);
            });
          });
        };
        var del = m.querySelector('[data-del]');
        if (del) del.onclick = function () {
          UI.confirm('删除《' + (bk.title || '未命名') + '》？', '该书及其笔记、金句都会一并删除。', function () {
            st.reader.books = books().filter(function (x) { return x.id !== bk.id; });
            ui.openId = null; S.commit(); close(); if (curEl) R.render(curEl);
          }, true);
        };
      }
    });
  }

  /* ---------------- 读书笔记 ---------------- */
  function noteForm(b) {
    UI.form({
      title: '写读书笔记',
      fields: [
        { key: 'chapter', label: '章节 / 位置', type: 'text', placeholder: '例：第三章 / 第 50 页（选填）' },
        { key: 'text', label: '笔记内容', type: 'textarea', rows: 5, required: true, placeholder: '记录你的思考、灵感或摘抄……' }
      ],
      onSubmit: function (val) {
        b.notes = b.notes || [];
        b.notes.push({ id: U.uid(), date: U.today(), chapter: val.chapter.trim(), text: val.text });
        b.updatedAt = U.today();
        S.commit(); UI.toast('已记录笔记 📝', 'ok'); if (curEl) R.render(curEl);
      }
    });
  }

  /* ---------------- 金句摘抄 ---------------- */
  function quoteForm(b, defBookId) {
    var opts = books().map(function (x) { return { v: x.id, l: x.title }; });
    if (!opts.length) { UI.toast('请先在书单里加一本书', 'err'); return; }
    UI.form({
      title: '摘抄金句',
      fields: [
        { key: 'bookId', label: '来自书籍', type: 'select', value: defBookId || opts[0].v, options: opts },
        { key: 'page', label: '页码（选填）', type: 'text', placeholder: '例：120' },
        { key: 'text', label: '金句内容', type: 'textarea', rows: 4, required: true, placeholder: '抄下打动你的那句话……' },
        { key: 'fav', label: '标记为收藏', type: 'checkbox', text: '★ 加入我的收藏金句' }
      ],
      onSubmit: function (val) {
        var bk = book(val.bookId); if (!bk) return;
        bk.quotes = bk.quotes || [];
        bk.quotes.push({ id: U.uid(), date: U.today(), page: val.page.trim(), text: val.text, fav: !!val.fav });
        bk.updatedAt = U.today();
        S.commit(); UI.toast('已摘抄 ✨', 'ok'); if (curEl) R.render(curEl);
      }
    });
  }

  /* ---------------- 电子书：上传 + 下载 ---------------- */
  function readFile(input, cb) {
    var f = input && input.files && input.files[0];
    if (!f) { cb(''); return; }
    if (f.size > 4 * 1024 * 1024) { UI.toast('文件超过 4MB，可能无法存储', 'err'); cb(''); return; }
    var r = new FileReader();
    r.onload = function () { cb(r.result); };
    r.onerror = function () { cb(''); };
    r.readAsDataURL(f);
  }
  function attachEbook(input, cb) {
    var f = input && input.files && input.files[0];
    if (!f) { cb(null); return; }
    if (f.size > 6 * 1024 * 1024) { UI.toast('电子书超过 6MB，本机存储可能不足', 'err'); cb(null); return; }
    var r = new FileReader();
    r.onload = function () { cb({ name: f.name, mime: f.type || 'application/octet-stream', data: r.result }); };
    r.onerror = function () { cb(null); };
    r.readAsDataURL(f);
  }
  function downloadEbook(b) {
    if (!b.file) { UI.toast('没有电子书文件', 'err'); return; }
    var a = document.createElement('a');
    a.href = b.file.data; a.download = b.file.name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); }, 200);
    UI.toast('已开始下载电子书 ⬇', 'ok');
  }

  /* ---------------- 生成书签（canvas 图片）并分享 ---------------- */
  function genBookmark(q, b) {
    var W = 600, H = 1500;
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    // 背景渐变（莫兰迪淡紫）
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#efe9f6'); grad.addColorStop(1, '#d9cfe8');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    // 装饰竖纹
    ctx.globalAlpha = 0.06; ctx.fillStyle = '#7c5aa6';
    for (var i = 0; i < W; i += 24) ctx.fillRect(i, 0, 12, H);
    ctx.globalAlpha = 1;
    // 顶部品牌
    ctx.fillStyle = '#7c5aa6'; ctx.font = '30px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 植物生长日记 · 阅读者', W / 2, 86);
    // 顶部分隔线
    ctx.strokeStyle = '#b9a6d9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(70, 120); ctx.lineTo(W - 70, 120); ctx.stroke();
    // 引号
    ctx.fillStyle = '#9b8bb4'; ctx.font = '120px Georgia,serif'; ctx.textAlign = 'left';
    ctx.fillText('“', 60, 260);
    // 金句正文（自动换行）
    ctx.fillStyle = '#3a3346'; ctx.font = '40px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    var lines = wrap(ctx, '“' + q.text + '”', W - 120);
    var y = 320;
    lines.forEach(function (ln) { ctx.fillText(ln, 60, y); y += 62; });
    // 出处
    ctx.fillStyle = '#6f5b8e'; ctx.font = '30px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('—— 《' + (b.title || '') + '》' + (b.author ? ' ' + b.author : ''), 60, y + 24);
    if (q.page) { ctx.fillText('P' + q.page, 60, y + 70); }
    // 底部水印
    ctx.fillStyle = '#b9a6d9'; ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('读过的每一页，都在浇灌我的生命之树', W / 2, H - 70);
    // 书签顶部打孔
    ctx.fillStyle = '#efe9f6'; ctx.beginPath(); ctx.arc(W / 2, 30, 14, 0, Math.PI * 2); ctx.fill();

    var url = c.toDataURL('image/png');
    var fname = ('书签_' + (b.title || '阅读') + '_' + (U.today()) + '.png').replace(/[\\/:*?"<>|]/g, '_');

    UI.sheet({
      title: '书签预览',
      body: '<div style="text-align:center"><img src="' + url + '" style="width:150px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.18)"></div>' +
        '<p class="tiny muted" style="text-align:center;margin:10px 0 0">长按图片可保存；或用下方按钮下载 / 分享</p>',
      footer: '<button class="btn" data-x>关闭</button>' +
        (navigator.canShare ? '<button class="btn" data-share>分享</button>' : '') +
        '<button class="btn btn-primary" data-dl2>⬇ 下载图片</button>',
      onMount: function (m, close) {
        m.querySelector('[data-dl2]').onclick = function () {
          var a = document.createElement('a'); a.href = url; a.download = fname;
          document.body.appendChild(a); a.click(); setTimeout(function () { document.body.removeChild(a); }, 200);
          UI.toast('书签已下载 ⬇', 'ok');
        };
        var sh = m.querySelector('[data-share]');
        if (sh) sh.onclick = function () {
          c.toBlob(function (blob) {
            var file = new File([blob], fname, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              navigator.share({ files: [file], title: '阅读书签', text: '《' + (b.title || '') + '》金句摘抄' })
                .catch(function () { });
            }
          });
        };
      }
    });
  }

  function wrap(ctx, text, maxW) {
    var out = [], line = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; }
      else line += ch;
    }
    if (line) out.push(line);
    return out;
  }

  function firstBookId() { var b = books()[0]; return b ? b.id : ''; }

  R.bookForm = bookForm;
  R.quoteForm = quoteForm;
  g.Reader = R;
})(window);
