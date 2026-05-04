/* ============================================
   $ALLIN — script.js
   ============================================ */

(function () {
  'use strict';

  // ---------- CONFIG ----------

  var DEFAULTS = {
    ca: 'coming soon',
    twitterUrl: 'https://x.com',
    communityUrl: 'https://x.com',
    buyUrl: 'https://pump.fun',
    elonTweetUrl: 'https://x.com/elonmusk/status/2051022381976781173',
    buffettTweetUrl: 'https://x.com/cryptorover/status/2051241172354425024',
    trendingUrl: 'https://x.com/i/trending/2051053180490850746'
  };

  function applyConfig(cfg) {
    var ca = cfg.ca || DEFAULTS.ca;
    var caShort = formatCa(ca);
    var caTextEl = document.getElementById('caText');
    var caTextFooterEl = document.getElementById('caTextFooter');
    if (caTextEl) caTextEl.textContent = 'CA: ' + caShort;
    if (caTextFooterEl) caTextFooterEl.textContent = 'CA: ' + caShort;

    setHref('navTwitter', cfg.twitterUrl || DEFAULTS.twitterUrl);
    setHref('navCommunity', cfg.communityUrl || DEFAULTS.communityUrl);
    setHref('navBuy', cfg.buyUrl || DEFAULTS.buyUrl);
    setHref('heroBuy', cfg.buyUrl || DEFAULTS.buyUrl);
    setHref('heroTrending', cfg.trendingUrl || DEFAULTS.trendingUrl);

    // CA copy
    var fullCa = ca && ca !== 'coming soon' ? ca : '';
    document.getElementById('navCa').addEventListener('click', function () {
      copyCa(fullCa);
    });
    document.getElementById('footerCa').addEventListener('click', function () {
      copyCa(fullCa);
    });

    // Tweet embeds
    renderTweet('elonTweetWrap', cfg.elonTweetUrl || DEFAULTS.elonTweetUrl);
    renderTweet('buffettTweetWrap', cfg.buffettTweetUrl || DEFAULTS.buffettTweetUrl);
  }

  function formatCa(ca) {
    if (!ca || ca === 'coming soon') return 'coming soon';
    if (ca.length <= 16) return ca;
    return ca.slice(0, 6) + '...' + ca.slice(-4);
  }

  function setHref(id, url) {
    var el = document.getElementById(id);
    if (el && url) el.setAttribute('href', url);
  }

  function copyCa(ca) {
    if (!ca) {
      showToast('chips not yet on the table.');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ca).then(function () {
        showToast('chips stacked.');
      }).catch(function () {
        fallbackCopy(ca);
      });
    } else {
      fallbackCopy(ca);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('chips stacked.');
    } catch (e) {
      showToast('copy failed. fold.');
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.classList.remove('show');
    }, 1800);
  }

  // ---------- TWEET EMBED ----------

  function renderTweet(wrapId, tweetUrl) {
    var wrap = document.getElementById(wrapId);
    if (!wrap || !tweetUrl) return;

    // Strip query params (e.g. ?s=20) — they break some embeds
    var cleanUrl = tweetUrl.split('?')[0];

    var bq = document.createElement('blockquote');
    bq.className = 'twitter-tweet';
    bq.setAttribute('data-theme', 'dark');
    bq.setAttribute('data-dnt', 'true');
    var a = document.createElement('a');
    a.href = cleanUrl;
    a.textContent = 'View on X';
    a.target = '_blank';
    a.rel = 'noopener';
    bq.appendChild(a);

    wrap.innerHTML = '';
    wrap.appendChild(bq);
    wrap.classList.add('tweet-loading');

    var rendered = false;

    function doLoad() {
      if (window.twttr && window.twttr.widgets && window.twttr.widgets.load) {
        var p = window.twttr.widgets.load(wrap);
        if (p && p.then) {
          p.then(function () {
            rendered = true;
            wrap.classList.remove('tweet-loading');
          });
        } else {
          rendered = true;
          wrap.classList.remove('tweet-loading');
        }
      }
    }

    if (window.twttr && window.twttr.ready) {
      window.twttr.ready(doLoad);
    } else {
      var tries = 0;
      var interval = setInterval(function () {
        tries++;
        if (window.twttr && window.twttr.widgets) {
          clearInterval(interval);
          doLoad();
        } else if (tries > 40) {
          clearInterval(interval);
        }
      }, 200);
    }

    // Fallback after 9s — show plain link card if embed failed
    setTimeout(function () {
      if (rendered) return;
      if (wrap.querySelector('iframe')) {
        rendered = true;
        wrap.classList.remove('tweet-loading');
        return;
      }
      wrap.classList.remove('tweet-loading');
      wrap.innerHTML = '<a class="tweet-fallback-link" href="' + cleanUrl + '" target="_blank" rel="noopener">View tweet on X →</a>';
    }, 9000);
  }

  // ---------- LOAD CONFIG ----------

  function loadConfig() {
    fetch('/api/config')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (cfg) { applyConfig(cfg || {}); })
      .catch(function () { applyConfig({}); });
  }

  // ---------- CHIP PARTICLES ----------

  function spawnChips() {
    var layer = document.getElementById('chipsLayer');
    if (!layer) return;
    var colors = ['#FFD43B', '#FF2D8A', '#3B82F6', '#2EC85F', '#E64545', '#9D55F2'];
    var count = window.innerWidth < 700 ? 8 : 12;
    for (var i = 0; i < count; i++) {
      var c = document.createElement('div');
      c.className = 'chip-particle';
      var color = colors[Math.floor(Math.random() * colors.length)];
      c.style.background = color;
      c.style.borderColor = 'rgba(255,255,255,0.35)';
      c.style.left = (Math.random() * 100) + '%';
      var dur = 14 + Math.random() * 14;
      var delay = -Math.random() * dur;
      var drift = (Math.random() * 60 - 30) + 'px';
      var maxOp = 0.08 + Math.random() * 0.08;
      c.style.setProperty('--x-drift', drift);
      c.style.setProperty('--max-op', maxOp);
      c.style.animation = 'chipFall ' + dur.toFixed(2) + 's linear ' + delay.toFixed(2) + 's infinite';
      layer.appendChild(c);
    }
  }

  // ---------- SCROLL REVEAL ----------

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---------- BIG QUOTE WORD STAGGER ----------

  function staggerBigQuote() {
    var q = document.querySelector('.big-quote');
    if (!q) return;
    // Wrap each word in a span with delay
    var nodes = Array.from(q.childNodes);
    var wordIdx = 0;
    var newHtml = '';
    nodes.forEach(function (n) {
      if (n.nodeType === Node.TEXT_NODE) {
        var words = n.textContent.split(/(\s+)/);
        words.forEach(function (w) {
          if (w.trim().length === 0) {
            newHtml += w;
          } else {
            newHtml += '<span class="qw" style="--qd:' + (wordIdx * 0.04) + 's">' + escapeHtml(w) + '</span>';
            wordIdx++;
          }
        });
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        var inner = n.textContent.split(/(\s+)/);
        var cls = n.className;
        var wrapped = '';
        inner.forEach(function (w) {
          if (w.trim().length === 0) {
            wrapped += w;
          } else {
            wrapped += '<span class="qw" style="--qd:' + (wordIdx * 0.04) + 's">' + escapeHtml(w) + '</span>';
            wordIdx++;
          }
        });
        newHtml += '<span class="' + cls + '">' + wrapped + '</span>';
      }
    });
    q.innerHTML = newHtml;
    // Inject style for word stagger if not present
    if (!document.getElementById('qw-style')) {
      var s = document.createElement('style');
      s.id = 'qw-style';
      s.textContent = '.qw{display:inline-block;opacity:0;transform:translateY(12px);transition:opacity .6s ease,transform .6s ease;transition-delay:var(--qd,0s);} .big-quote.in .qw{opacity:1;transform:translateY(0);}';
      document.head.appendChild(s);
    }
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- TWEET FALLBACK HIDE-ON-ERROR ----------

  function hideBrokenImages() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        // For tweet fallbacks, hide if missing
        if (img.classList.contains('tweet-fallback')) {
          img.style.display = 'none';
          var wrap = img.closest('.tweet-wrap');
          if (wrap && !wrap.querySelector('blockquote.twitter-tweet')) {
            wrap.style.display = 'none';
          }
        }
      });
    });
  }

  // ---------- BOOT ----------

  document.addEventListener('DOMContentLoaded', function () {
    spawnChips();
    initReveal();
    staggerBigQuote();
    hideBrokenImages();
    loadConfig();
  });
})();
