/* ASTER · 登录 / 注册 */
(function () {
  'use strict';

  var mode = location.pathname.indexOf('/register') === 0 ? 'register' : 'login';
  var $ = function (s) { return document.querySelector(s); };
  var errBox = $('#authError');
  var form = $('#authForm');
  var btn = $('#submitBtn');

  function setMode(next) {
    mode = next;
    var isReg = mode === 'register';
    $('#tabLogin').classList.toggle('on', !isReg);
    $('#tabRegister').classList.toggle('on', isReg);
    $('#authTitle').textContent = isReg ? '创建账号' : '欢迎回来';
    $('#authSub').textContent = isReg ? '注册即送 ¥1 体验额度，无需绑卡。' : '登录你的 ASTER 账号，继续管理令牌与用量。';
    $('#nameField').style.display = isReg ? 'block' : 'none';
    $('#pwHint').style.display = isReg ? 'block' : 'none';
    btn.textContent = isReg ? '注册并登录' : '登录';
    $('#password').setAttribute('autocomplete', isReg ? 'new-password' : 'current-password');
    hideError();
    if (history.replaceState) history.replaceState(null, '', isReg ? '/register' : '/login');
  }

  function showError(msg) {
    errBox.textContent = msg;
    errBox.style.display = 'block';
  }

  function hideError() { errBox.style.display = 'none'; }

  $('#tabLogin').addEventListener('click', function () { setMode('login'); });
  $('#tabRegister').addEventListener('click', function () { setMode('register'); });

  $('#fillDemo').addEventListener('click', function () {
    setMode('login');
    $('#email').value = 'demo@aster.dev';
    $('#password').value = 'Aster@2026';
    $('#password').focus();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();
    var payload = {
      email: $('#email').value.trim(),
      password: $('#password').value,
      name: $('#name').value.trim(),
    };
    if (!payload.email) return showError('请输入邮箱');
    if (!payload.password) return showError('请输入密码');

    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = '处理中…';

    fetch('/api/auth/' + mode, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (data) { return { ok: r.ok, status: r.status, data: data }; });
    }).then(function (res) {
      if (!res.ok) {
        var msg = (res.data && res.data.error && res.data.error.message) || '操作失败，请稍后重试';
        throw new Error(msg);
      }
      location.href = '/console';
    }).catch(function (err) {
      showError(err.message || '网络异常，请重试');
      btn.disabled = false;
      btn.textContent = label;
    });
  });

  setMode(mode);
})();
