/* ========== 公考备考 · 申论精读素材库 ========== */
(function (g) {
  var Reading = {};

  // 来源：人民日报（人民论坛 / 人民时评）、半月谈（半月评论）等公开优质评论文章
  // 金句/立意为本应用整理，便于申论积累；点击“检索原文”可联网查找该文。
  var READING = [
    { id: 'r01', theme: '乡村振兴', source: '人民日报·人民论坛', title: '民族要复兴，乡村必振兴',
      jinju: '“民族要复兴，乡村必振兴。”全面推进乡村振兴，是新时代建设农业强国的重要任务，要坚持农业农村优先发展。' },
    { id: 'r02', theme: '乡村振兴', source: '人民日报·人民时评', title: '写好新时代乡村振兴这篇大文章',
      jinju: '产业兴旺是重点，生态宜居是关键，治理有效是基础。因地制宜、分类施策，才能让乡村既留得住乡愁，也跟得上时代。' },
    { id: 'r03', theme: '乡村振兴', source: '人民日报·人民论坛', title: '建设宜居宜业和美乡村',
      jinju: '和美乡村，既要“塑形”也要“铸魂”。补齐基础设施与公共服务短板，培育文明乡风，方能实现由表及里的全面提升。' },
    { id: 'r04', theme: '基层治理', source: '人民日报·人民时评', title: '城市治理要下足“绣花”功夫',
      jinju: '天下大事，必作于细。基层治理贵在精准、重在细节，以“绣花”般的耐心绣出群众的获得感、幸福感、安全感。' },
    { id: 'r05', theme: '基层治理', source: '半月谈', title: '让基层治理更有温度',
      jinju: '基层治理不是冷冰冰的管理，而是有温度的服務。把群众的小事当作心头大事，矛盾自然化解在源头。' },
    { id: 'r06', theme: '基层治理', source: '半月谈', title: '把矛盾化解在基层',
      jinju: '“枫桥经验”的核心是依靠群众、就地化解。小事不出村、大事不出镇，把问题解决在基层、化解在萌芽。' },
    { id: 'r07', theme: '科技创新', source: '人民日报·人民论坛', title: '以科技创新引领产业创新',
      jinju: '科技创新是必由之路。以科技创新推动产业创新，加快实现高水平科技自立自强，方能把握发展主动权。' },
    { id: 'r08', theme: '科技创新', source: '人民日报·人民时评', title: '在发展新质生产力上勇争先',
      jinju: '新质生产力特点是创新，关键在质优。突出高科技、高效能、高质量，点燃高质量发展新引擎。' },
    { id: 'r09', theme: '科技创新', source: '半月谈', title: '让人工智能更好造福人民',
      jinju: '技术向善，方可持续。推动人工智能与民生、治理深度融合，让科技成果更多更公平惠及全体人民。' },
    { id: 'r10', theme: '生态文明', source: '人民日报', title: '绿水青山就是金山银山',
      jinju: '“绿水青山就是金山银山。”保护生态环境就是保护生产力，改善生态环境就是发展生产力。' },
    { id: 'r11', theme: '生态文明', source: '半月谈', title: '把生态优势转化为发展优势',
      jinju: '好生态也是生产力。把生态资本转化为发展资本，让保护者受益、使用者付费、破坏者赔偿。' },
    { id: 'r12', theme: '生态文明', source: '人民日报·人民时评', title: '坚决打好污染防治攻坚战',
      jinju: '环境就是民生，青山就是美丽，蓝天也是幸福。不动摇、不松劲，持续改善生态环境质量。' },
    { id: 'r13', theme: '民生保障', source: '人民日报·人民时评', title: '在高质量发展中保障和改善民生',
      jinju: '民生连着民心。坚持在发展中保障和改善民生，用力用情解决群众急难愁盼，夯实共同富裕根基。' },
    { id: 'r14', theme: '民生保障', source: '人民日报·人民时评', title: '把就业这个最大的民生抓紧抓好',
      jinju: '就业是民生之本。就业稳则民心安，要突出就业优先导向，千方百计稳住重点群体就业。' },
    { id: 'r15', theme: '民生保障', source: '半月谈', title: '老有所养，托起幸福“夕阳红”',
      jinju: '养老服务关系千家万户。构建居家社区机构相协调、医养康养相结合的养老服务体系，让老年人安享晚年。' },
    { id: 'r16', theme: '文化自信', source: '人民日报·人民论坛', title: '坚定文化自信 建设文化强国',
      jinju: '文化自信是更基础、更广泛、更深厚的文化力量。守正创新，推动中华优秀传统文化创造性转化、创新性发展。' },
    { id: 'r17', theme: '文化自信', source: '人民日报·人民时评', title: '把中华优秀传统文化传承好',
      jinju: '不忘本来才能开辟未来。在传承中创新，在创新中传承，让古老文明焕发新的生命力。' },
    { id: 'r18', theme: '文化自信', source: '半月谈', title: '让文物“活”起来',
      jinju: '文物承载文明、传承文化。让收藏在博物馆里的文物、书写在古籍里的文字都“活”起来。' },
    { id: 'r19', theme: '改革开放', source: '半月谈', title: '以改革激发新动能',
      jinju: '改革是发展的根本动力。以改革破难题、以开放促发展，不断解放和发展社会生产力。' },
    { id: 'r20', theme: '改革开放', source: '人民日报·人民论坛', title: '把改革开放推向深入',
      jinju: '改革开放只有进行时、没有完成时。坚定不移全面深化改革，扩大高水平对外开放。' },
    { id: 'r21', theme: '吉林省情', source: '人民日报', title: '吉林：把黑土地这个“耕地中的大熊猫”保护好',
      jinju: '“黑土地是耕地中的大熊猫。”吉林地处黄金玉米带，保护好、利用好黑土地，就是守住粮食安全的底气。' },
    { id: 'r22', theme: '吉林省情', source: '半月谈', title: '吉林：冰雪经济借“冬”风起舞',
      jinju: '冰天雪地也是金山银山。吉林做强冰雪经济与生态旅游，把生态冷资源变成发展热产业。' },
    { id: 'r23', theme: '吉林省情', source: '人民日报·人民时评', title: '在吉林看见现代化大农业',
      jinju: '吉林是国家重要商品粮基地。发展现代化大农业，藏粮于地、藏粮于技，当好国家粮食稳产保供“压舱石”。' }
  ];

  var THEME_ICON = { '乡村振兴': '🌾', '基层治理': '🤝', '科技创新': '💡', '生态文明': '🌿', '民生保障': '❤️', '文化自信': '📜', '改革开放': '🔁', '吉林省情': '🏔' };

  function readMap() {
    var st = S.get();
    if (!st.reading) st.reading = { read: {} };
    return st.reading.read || {};
  }

  function linkOf(it) {
    return 'https://www.baidu.com/s?wd=' + encodeURIComponent(it.source + ' ' + it.title);
  }

  Reading.render = function (el) {
    var st = S.get();
    if (!st.reading) st.reading = { read: {} };
    var rm = readMap();
    var readCount = Object.keys(rm).filter(function (k) { return rm[k]; }).length;

    var h = '<div class="pol-intro"><h3>📖 申论精读素材库</h3>' +
      '<p>精选人民日报、半月谈等权威媒体的优秀评论文章，按主题归类，附金句立意，便于申论积累与仿写。' +
      '已读 <b>' + readCount + '</b> / ' + READING.length + ' 篇。</p>' +
      '<button class="btn btn-primary btn-block" id="rdSearch">🔍 检索人民日报 / 半月谈最新评论</button></div>';

    var byTheme = {};
    READING.forEach(function (it) { (byTheme[it.theme] = byTheme[it.theme] || []).push(it); });
    Object.keys(byTheme).forEach(function (th) {
      h += '<div class="sec-t">' + (THEME_ICON[th] || '') + ' ' + th + ' · ' + byTheme[th].length + ' 篇</div>';
      h += byTheme[th].map(function (it) {
        var isRead = !!rm[it.id];
        return '<div class="rd ' + (isRead ? 'open' : '') + '" data-id="' + it.id + '">' +
          '<div class="rd-t">' + U.esc(it.title) + (isRead ? ' ✓' : '') + '</div>' +
          '<div class="rd-meta"><span class="chip">' + U.esc(it.source) + '</span><span class="chip mute">点击展开金句立意</span></div>' +
          '<div class="rd-jinju">' + U.esc(it.jinju) + '</div>' +
          '<div class="rd-foot"><button class="btn btn-sm" data-link="' + it.id + '">🔗 检索原文</button>' +
          '<button class="btn btn-sm ' + (isRead ? '' : 'btn-primary') + '" data-read="' + it.id + '">' + (isRead ? '已读 ✓' : '标记已读') + '</button></div>' +
          '</div>';
      }).join('');
    });
    el.innerHTML = h;

    var qs = el.querySelector('#rdSearch');
    if (qs) qs.onclick = function () { window.open('https://www.people.com.cn/', '_blank'); window.open('https://www.banyuetan.org/', '_blank'); };

    U.$$('.rd', el).forEach(function (card) {
      card.onclick = function (e) {
        if (e.target.closest('[data-link]') || e.target.closest('[data-read]')) return;
        card.classList.toggle('open');
      };
    });
    U.$$('[data-link]', el).forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var it = READING.filter(function (x) { return x.id === b.dataset.link; })[0];
        if (it) window.open(linkOf(it), '_blank');
      };
    });
    U.$$('[data-read]', el).forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var id = b.dataset.read, stt = S.get();
        if (!stt.reading) stt.reading = { read: {} };
        stt.reading.read = stt.reading.read || {};
        stt.reading.read[id] = !stt.reading.read[id];
        S.commit();
        Reading.render(el);
      };
    });
  };

  g.Reading = Reading;
})(window);
