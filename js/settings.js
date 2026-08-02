/* ========== 设置与数据备份 ========== */
(function (g) {
  var St = {};

  St.render = function (el) {
    var st = S.get(), s = st.settings;
    var size = 0;
    try { size = Math.round((localStorage.getItem('shangan.workbench.v1') || '').length / 1024); } catch (e) { }

    var h = '<div class="card"><div class="card-h"><h3>考试设置</h3><span class="hint">影响首页倒计时</span></div>' +
      '<div class="kv"><span>' + U.esc(s.gkName) + '</span><b>' + (s.gkDate || '未设置') + '</b></div>' +
      '<div class="kv"><span>' + U.esc(s.jlName) + '</span><b>' + (s.jlDate || '未设置') + '</b></div>' +
      '<button class="btn btn-sm btn-block" style="margin-top:10px" id="setExam">修改考试信息</button></div>';

    h += '<div class="card"><div class="card-h"><h3>提醒与目标</h3></div>' +
      '<div class="kv"><span>每日打卡提醒</span><b>' + (s.reminderTime || '22:30') + '</b></div>' +
      '<div class="kv"><span>系统通知</span><b>' + (s.notify ? '已开启' : '未开启') + '</b></div>' +
      '<div class="kv"><span>每日学习目标</span><b>' + U.mins(s.dailyStudyGoal) + '</b></div>' +
      '<div class="kv"><span>固定复盘日</span><b>每周日</b></div>' +
      '<button class="btn btn-sm btn-block" style="margin-top:10px" id="setRemind">修改提醒设置</button>' +
      '<p class="tiny muted" style="margin-top:8px">提醒逻辑：到达设定时间后，只要打开应用且当日未打卡，就会在首页顶部弹出提醒条；开启系统通知后（需授权），应用在后台运行时也会推送。</p></div>';

    h += '<div class="card"><div class="card-h"><h3>数据管理</h3><span class="hint">本机占用约 ' + size + ' KB</span></div>' +
      '<div class="kv"><span>学习任务</span><b>' + st.tasks.length + ' 条</b></div>' +
      '<div class="kv"><span>学习打卡</span><b>' + st.checkins.length + ' 条</b></div>' +
      '<div class="kv"><span>收支流水</span><b>' + st.finance.txns.length + ' 条</b></div>' +
      '<div class="kv"><span>复盘记录</span><b>' + st.reviews.length + ' 条</b></div>' +
      '<div class="row" style="margin-top:12px;gap:8px">' +
      '<button class="btn btn-sm" id="expJson" style="flex:1">导出备份</button>' +
      '<button class="btn btn-sm" id="impJson" style="flex:1">导入恢复</button>' +
      '<button class="btn btn-sm btn-danger" id="clr" style="flex:1">清空数据</button></div>' +
      '<p class="tiny muted" style="margin-top:8px">所有数据只保存在这台设备的浏览器里，不会上传。建议每月导出一次备份文件。</p></div>';

    h += '<div class="card"><div class="card-h"><h3>装到手机桌面</h3></div>' +
      '<p style="font-size:13px;line-height:1.9;color:var(--text-2)">' +
      '<b>安卓 / 鸿蒙</b>：用浏览器打开本页 → 菜单 →「添加到主屏幕 / 安装应用」<br>' +
      '<b>iPhone</b>：用 Safari 打开 → 分享按钮 →「添加到主屏幕」<br>' +
      '安装后图标与普通 App 一样，<b>断网也能用</b>，永久免费无订阅。</p>' +
      '<button class="btn btn-primary btn-block" style="margin-top:10px" id="doInstall">📲 立即安装到桌面</button></div>';

    h += '<div class="card"><div class="card-h"><h3>关于</h3></div>' +
      '<p class="tiny muted" style="line-height:1.9">上岸计划 · 个人目标工作台 v1.0<br>' +
      '三大板块：公考备考（国考 + 吉林省考双线）· 攒钱财务规划 · 长期生活配套<br>' +
      '纯本地离线应用，数据自主可控。</p></div>';

    el.innerHTML = h;

    el.querySelector('#setExam').onclick = function () {
      UI.form({
        title: '考试设置',
        fields: [
          { key: 'gkName', label: '考试一名称', type: 'text', value: s.gkName, half: true },
          { key: 'gkDate', label: '笔试日期', type: 'date', value: s.gkDate, half: true },
          { key: 'jlName', label: '考试二名称', type: 'text', value: s.jlName, half: true },
          { key: 'jlDate', label: '笔试日期', type: 'date', value: s.jlDate, half: true },
          { type: 'static', key: '_h', label: '', html: '若官方公告时间有变，随时回来修改即可，倒计时会自动更新。' }
        ],
        onSubmit: function (v) {
          s.gkName = v.gkName; s.gkDate = v.gkDate; s.jlName = v.jlName; s.jlDate = v.jlDate;
          S.commit(); UI.toast('已保存', 'ok'); App.refreshTop();
        }
      });
    };

    el.querySelector('#setRemind').onclick = function () {
      UI.form({
        title: '提醒与目标',
        fields: [
          { key: 'reminderTime', label: '每日打卡提醒时间', type: 'time', value: s.reminderTime, half: true },
          { key: 'dailyStudyGoal', label: '每日学习目标（分钟）', type: 'number', value: s.dailyStudyGoal, inputmode: 'numeric', half: true },
          { key: 'notify', label: '', type: 'checkbox', value: s.notify, text: '开启系统通知（需要授权）' }
        ],
        onSubmit: function (v) {
          s.reminderTime = v.reminderTime || '22:30';
          s.dailyStudyGoal = Number(v.dailyStudyGoal) || 240;
          if (v.notify && !s.notify && 'Notification' in window) {
            Notification.requestPermission().then(function (p) {
              s.notify = (p === 'granted');
              if (!s.notify) UI.toast('通知权限被拒绝，仅使用应用内提醒', 'err');
              S.commit();
            });
          } else { s.notify = v.notify; }
          S.commit(); UI.toast('已保存', 'ok');
        }
      });
    };

    el.querySelector('#expJson').onclick = function () {
      U.download('上岸计划备份_' + U.today() + '.json', S.exportJSON());
      UI.toast('备份已导出', 'ok');
    };
    el.querySelector('#impJson').onclick = function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try { S.importJSON(r.result); UI.toast('导入成功', 'ok'); App.render(); }
          catch (e) { UI.toast('文件格式不正确', 'err'); }
        };
        r.readAsText(f);
      };
      inp.click();
    };
    el.querySelector('#clr').onclick = function () {
      UI.confirm('清空所有数据？', '将删除全部任务、打卡、流水与复盘记录，且无法恢复。建议先导出备份。', function () {
        S.reset(); UI.toast('已清空'); App.render();
      }, true);
    };
    el.querySelector('#doInstall').onclick = function () { App.install(); };
  };

  g.Settings = St;
})(window);
