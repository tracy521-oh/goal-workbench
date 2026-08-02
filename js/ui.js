/* ========== UI 基础组件：弹窗 / 表单 / 提示 ========== */
(function (g) {
  var UI = {};
  var root = function () { return document.getElementById('modalRoot'); };

  /* ---- Toast ---- */
  UI.toast = function (msg, type) {
    var r = document.getElementById('toastRoot');
    var d = document.createElement('div');
    d.className = 'toast' + (type ? ' ' + type : '');
    d.textContent = msg;
    r.appendChild(d);
    setTimeout(function () { d.style.opacity = '0'; d.style.transition = '.3s'; }, 1900);
    setTimeout(function () { d.remove(); }, 2250);
  };

  /* ---- 通用底部弹窗 ---- */
  UI.sheet = function (opt) {
    var mask = document.createElement('div');
    mask.className = 'mask';
    mask.innerHTML =
      '<div class="sheet">' +
      '<div class="sheet-h"><h3>' + U.esc(opt.title || '') + '</h3>' +
      (opt.headRight || '') +
      '<button class="icon-btn" data-x>✕</button></div>' +
      '<div class="sheet-b">' + (opt.body || '') + '</div>' +
      (opt.footer === null ? '' : '<div class="sheet-f">' + (opt.footer ||
        '<button class="btn" data-x>取消</button><button class="btn btn-primary" data-ok>保存</button>') + '</div>') +
      '</div>';
    root().appendChild(mask);
    document.body.style.overflow = 'hidden';

    function close() {
      mask.style.opacity = '0'; mask.style.transition = '.15s';
      setTimeout(function () { mask.remove(); if (!root().children.length) document.body.style.overflow = ''; }, 150);
    }
    mask.addEventListener('click', function (e) {
      if (e.target === mask || e.target.closest('[data-x]')) { close(); }
    });
    if (opt.onMount) opt.onMount(mask, close);
    return { el: mask, close: close };
  };

  UI.confirm = function (title, msg, onYes, danger) {
    UI.sheet({
      title: title,
      body: '<p style="font-size:14px;line-height:1.7;color:var(--text-2)">' + (msg || '') + '</p>',
      footer: '<button class="btn" data-x>取消</button><button class="btn ' +
        (danger ? 'btn-danger' : 'btn-primary') + '" data-ok>确定</button>',
      onMount: function (m, close) {
        m.querySelector('[data-ok]').onclick = function () { close(); onYes && onYes(); };
      }
    });
  };

  /* ---- 表单渲染 ---- */
  function fieldHTML(f) {
    var v = f.value === undefined || f.value === null ? '' : f.value;
    var lbl = f.label ? '<label>' + U.esc(f.label) + (f.required ? ' <i class="req">*</i>' : '') + '</label>' : '';
    var hint = f.hint ? '<div class="hint">' + f.hint + '</div>' : '';
    var body = '';
    switch (f.type) {
      case 'textarea':
        body = '<textarea data-k="' + f.key + '" placeholder="' + U.esc(f.placeholder || '') + '"' +
          (f.rows ? ' rows="' + f.rows + '"' : '') + '>' + U.esc(v) + '</textarea>';
        break;
      case 'select':
        body = '<select data-k="' + f.key + '">' + (f.options || []).map(function (o) {
          var val = typeof o === 'object' ? o.v : o, lab = typeof o === 'object' ? o.l : o;
          return '<option value="' + U.esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + U.esc(lab) + '</option>';
        }).join('') + '</select>';
        break;
      case 'options':
        body = '<div class="opts" data-k="' + f.key + '" data-type="options">' + (f.options || []).map(function (o) {
          var val = typeof o === 'object' ? o.v : o, lab = typeof o === 'object' ? o.l : o;
          var cls = typeof o === 'object' && o.cls ? ' ' + o.cls : '';
          return '<div class="opt' + (String(val) === String(v) ? ' on' + cls : '') + '" data-v="' + U.esc(val) + '"' +
            (typeof o === 'object' && o.cls ? ' data-cls="' + o.cls + '"' : '') + '>' + U.esc(lab) + '</div>';
        }).join('') + '</div>';
        break;
      case 'checkbox':
        body = '<div class="swt"><input type="checkbox" data-k="' + f.key + '" data-type="check"' + (v ? ' checked' : '') +
          '><span>' + U.esc(f.text || '') + '</span></div>';
        break;
      case 'static':
        body = '<div style="font-size:13.5px;color:var(--text-2);line-height:1.7">' + (f.html || '') + '</div>';
        break;
      default:
        body = '<input type="' + (f.type || 'text') + '" data-k="' + f.key + '" value="' + U.esc(v) + '" placeholder="' +
          U.esc(f.placeholder || '') + '"' +
          (f.step ? ' step="' + f.step + '"' : '') + (f.min !== undefined ? ' min="' + f.min + '"' : '') +
          (f.inputmode ? ' inputmode="' + f.inputmode + '"' : '') + '>';
    }
    return '<div class="f"' + (f.hidden ? ' style="display:none"' : '') + ' data-f="' + (f.key || '') + '">' + lbl + body + hint + '</div>';
  }

  UI.formBody = function (fields) {
    var out = '', i = 0;
    while (i < fields.length) {
      var f = fields[i];
      if (f.type === 'group') { out += '<div class="sec-t">' + U.esc(f.label) + '</div>'; i++; continue; }
      if (f.half && fields[i + 1] && fields[i + 1].half) {
        out += '<div class="f-row">' + fieldHTML(f) + fieldHTML(fields[i + 1]) + '</div>';
        i += 2; continue;
      }
      out += fieldHTML(f); i++;
    }
    return out;
  };

  UI.bindForm = function (scope) {
    U.$$('.opts[data-type=options]', scope).forEach(function (box) {
      box.addEventListener('click', function (e) {
        var o = e.target.closest('.opt'); if (!o) return;
        U.$$('.opt', box).forEach(function (x) { x.className = 'opt'; });
        o.className = 'opt on' + (o.dataset.cls ? ' ' + o.dataset.cls : '');
        box.dispatchEvent(new CustomEvent('optchange', { detail: o.dataset.v, bubbles: true }));
      });
    });
  };

  UI.readForm = function (scope) {
    var o = {};
    U.$$('[data-k]', scope).forEach(function (el) {
      var k = el.dataset.k;
      if (el.dataset.type === 'options') {
        var on = el.querySelector('.opt.on');
        o[k] = on ? on.dataset.v : '';
      } else if (el.dataset.type === 'check') {
        o[k] = el.checked;
      } else if (el.type === 'number') {
        o[k] = el.value === '' ? '' : Number(el.value);
      } else {
        o[k] = el.value;
      }
    });
    return o;
  };

  /* 快捷表单弹窗 */
  UI.form = function (opt) {
    var body = UI.formBody(opt.fields) + (opt.extraBody || '');
    var footer = opt.footer;
    if (footer === undefined) {
      footer = (opt.onDelete ? '<button class="btn btn-danger" data-del>删除</button>' : '<button class="btn" data-x>取消</button>') +
        '<button class="btn ' + (opt.okClass || 'btn-primary') + '" data-ok>' + (opt.okText || '保存') + '</button>';
    }
    var sh = UI.sheet({
      title: opt.title, body: body, footer: footer, headRight: opt.headRight,
      onMount: function (m, close) {
        UI.bindForm(m);
        if (opt.onMount) opt.onMount(m, close);
        var ok = m.querySelector('[data-ok]');
        if (ok) ok.onclick = function () {
          var vals = UI.readForm(m);
          var bad = null;
          (opt.fields || []).forEach(function (f) {
            if (f.required && (vals[f.key] === '' || vals[f.key] === undefined)) bad = bad || f.label;
          });
          if (bad) { UI.toast('请填写：' + bad, 'err'); return; }
          if (opt.onSubmit(vals, m) !== false) close();
        };
        var del = m.querySelector('[data-del]');
        if (del) del.onclick = function () {
          UI.confirm('确认删除？', '删除后不可恢复。', function () { opt.onDelete(); close(); }, true);
        };
      }
    });
    return sh;
  };

  /* 多视图切换按钮组 */
  UI.seg = function (items, cur, name) {
    return '<div class="seg" data-seg="' + name + '">' + items.map(function (it) {
      var v = typeof it === 'object' ? it.v : it, l = typeof it === 'object' ? it.l : it;
      return '<button data-v="' + U.esc(v) + '" class="' + (v === cur ? 'active' : '') + '">' + U.esc(l) + '</button>';
    }).join('') + '</div>';
  };

  UI.bindSeg = function (scope, name, cb) {
    var box = scope.querySelector('[data-seg="' + name + '"]');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      cb(b.dataset.v);
    });
  };

  UI.progressBar = function (pct, cls) {
    return '<div class="bar ' + (cls || '') + '"><i style="width:' + U.clamp(pct, 0, 100) + '%"></i></div>';
  };

  UI.empty = function (icon, text, btn) {
    return '<div class="empty"><span class="big">' + icon + '</span>' + text +
      (btn ? '<div style="margin-top:12px">' + btn + '</div>' : '') + '</div>';
  };

  g.UI = UI;
})(window);
