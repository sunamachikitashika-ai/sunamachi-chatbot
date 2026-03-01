(function () {
  const API_URL = 'https://sunamachi-chatbot.vercel.app/api/chat';
  const PRIMARY = '#0077B6';
  const PRIMARY_DARK = '#005F8E';

  const css = `
    #sc-chat-wrapper * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', sans-serif; }
    #sc-chat-btn {
      position: fixed; bottom: 100px; right: 24px; z-index: 9999;
      height: 52px; padding: 0 18px; border-radius: 26px;
      background: ${PRIMARY}; color: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,119,182,0.4);
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.2s, transform 0.2s;
      white-space: nowrap;
    }
    #sc-chat-btn:hover { background: ${PRIMARY_DARK}; transform: scale(1.03); }
    #sc-chat-btn svg { width: 22px; height: 22px; flex-shrink: 0; }
    #sc-chat-btn .sc-btn-text { font-size: 13px; font-weight: bold; line-height: 1.3; text-align: left; }
    #sc-chat-btn .sc-btn-text span { display: block; font-size: 10px; font-weight: normal; opacity: 0.9; }
    #sc-chat-window {
      position: fixed; bottom: 172px; right: 24px; z-index: 9998;
      width: 360px; height: 520px; border-radius: 16px;
      background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex; flex-direction: column; overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
    }
    #sc-chat-window.sc-hidden { opacity: 0; pointer-events: none; transform: translateY(12px); }
    #sc-chat-header {
      background: ${PRIMARY}; color: #fff; padding: 14px 16px;
      display: flex; align-items: center; gap: 10px;
    }
    #sc-chat-header .sc-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    #sc-chat-header .sc-info { flex: 1; }
    #sc-chat-header .sc-name { font-weight: bold; font-size: 15px; }
    #sc-chat-header .sc-status { font-size: 12px; opacity: 0.85; }
    #sc-chat-header .sc-close {
      background: none; border: none; color: #fff; cursor: pointer;
      font-size: 20px; padding: 0; line-height: 1; opacity: 0.8;
    }
    #sc-chat-header .sc-close:hover { opacity: 1; }
    #sc-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex;
      flex-direction: column; gap: 10px; background: #F4F7FA;
    }
    .sc-msg { display: flex; flex-direction: column; max-width: 80%; }
    .sc-msg.sc-user { align-self: flex-end; align-items: flex-end; }
    .sc-msg.sc-bot { align-self: flex-start; align-items: flex-start; }
    .sc-bubble {
      padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.6;
      white-space: pre-wrap; word-break: break-word;
    }
    .sc-msg.sc-user .sc-bubble { background: ${PRIMARY}; color: #fff; border-bottom-right-radius: 4px; }
    .sc-msg.sc-bot .sc-bubble { background: #fff; color: #333; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .sc-typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; }
    .sc-typing span {
      width: 7px; height: 7px; border-radius: 50%; background: #aaa;
      animation: sc-bounce 1.2s infinite;
    }
    .sc-typing span:nth-child(2) { animation-delay: 0.2s; }
    .sc-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes sc-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
    #sc-chat-input-area {
      padding: 12px; border-top: 1px solid #eee;
      display: flex; gap: 8px; background: #fff;
    }
    #sc-chat-input {
      flex: 1; border: 1px solid #ddd; border-radius: 24px;
      padding: 9px 16px; font-size: 14px; outline: none; resize: none;
      max-height: 80px; line-height: 1.5;
    }
    #sc-chat-input:focus { border-color: ${PRIMARY}; }
    #sc-send-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: ${PRIMARY}; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.2s;
    }
    #sc-send-btn:hover { background: ${PRIMARY_DARK}; }
    #sc-send-btn:disabled { background: #ccc; cursor: not-allowed; }
    #sc-send-btn svg { width: 18px; height: 18px; }
    @media (max-width: 480px) {
      #sc-chat-window { width: calc(100vw - 32px); right: 16px; bottom: 160px; }
      #sc-chat-btn { right: 16px; bottom: 100px; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const wrapper = document.createElement('div');
  wrapper.id = 'sc-chat-wrapper';
  wrapper.innerHTML = `
    <button id="sc-chat-btn" aria-label="AIチャットを開く">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <div class="sc-btn-text">
        AIチャット
        <span>ご質問・お問い合わせ</span>
      </div>
    </button>
    <div id="sc-chat-window" class="sc-hidden">
      <div id="sc-chat-header">
        <div class="sc-avatar">🦷</div>
        <div class="sc-info">
          <div class="sc-name">砂町北歯科 AIアシスタント</div>
          <div class="sc-status">何でもお気軽にご質問ください</div>
        </div>
        <button class="sc-close" aria-label="閉じる">✕</button>
      </div>
      <div id="sc-chat-messages"></div>
      <div id="sc-chat-input-area">
        <textarea id="sc-chat-input" placeholder="メッセージを入力..." rows="1"></textarea>
        <button id="sc-send-btn" aria-label="送信">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const btn = document.getElementById('sc-chat-btn');
  const win = document.getElementById('sc-chat-window');
  const msgs = document.getElementById('sc-chat-messages');
  const input = document.getElementById('sc-chat-input');
  const sendBtn = document.getElementById('sc-send-btn');
  const closeBtn = win.querySelector('.sc-close');

  let isOpen = false;
  let isLoading = false;
  let history = [];

  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle('sc-hidden', !isOpen);
    if (isOpen && history.length === 0) {
      addMessage('bot', 'こんにちは！砂町北歯科のAIアシスタントです。\n診療時間・予約・治療内容など、お気軽にご質問ください。');
    }
    if (isOpen) input.focus();
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `sc-msg sc-${role}`;
    div.innerHTML = `<div class="sc-bubble">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'sc-msg sc-bot';
    div.id = 'sc-typing';
    div.innerHTML = `<div class="sc-bubble sc-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('sc-typing');
    if (el) el.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    input.style.height = 'auto';
    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      removeTyping();
      const reply = data.content || 'エラーが発生しました。お電話でお問い合わせください。(03-5683-0234)';
      addMessage('bot', reply);
      history.push({ role: 'assistant', content: reply });
    } catch {
      removeTyping();
      addMessage('bot', '通信エラーが発生しました。お電話でお問い合わせください。(03-5683-0234)');
    }

    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  btn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });
})();
