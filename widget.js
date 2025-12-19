/**
 * Chat Widget
 * Встраиваемый виджет чата для сайтов
 *
 * Использование:
 * <script src="https://chat.city2city.ru/widget.js"
 *   data-source="vdrugoygorod.ru"
 *   data-brand="VDRUGOY"
 *   data-color="#E53935"
 *   data-bg-color="#1B2B44"
 *   data-tooltip="Не работает WhatsApp/Telegram? Пиши СЮДА!"
 * ></script>
 */
(function() {
  'use strict';
  // Конфигурация
  const CONFIG = {
    apiUrl: 'https://chat.city2city.ru/api',
    chatUrl: 'https://chat.city2city.ru',
  };
  // Получаем параметры из script тега
  const scriptTag = document.currentScript || document.querySelector('script[data-source]');
  const SOURCE = scriptTag?.getAttribute('data-source') || window.location.hostname;
  const PRIMARY_COLOR = scriptTag?.getAttribute('data-color') || '#FF9C00';
  const BG_COLOR = scriptTag?.getAttribute('data-bg-color') || '#121212';
  const POSITION = scriptTag?.getAttribute('data-position') || 'right';
  const GREETING = scriptTag?.getAttribute('data-greeting') || 'Здравствуйте! Чем можем помочь?';
  const BRAND = scriptTag?.getAttribute('data-brand') || 'City2City';
  const TOOLTIP = scriptTag?.getAttribute('data-tooltip') || 'Не работает WhatsApp/Telegram? Пиши СЮДА!';
  // Генерация уникального ID посетителя
  function getVisitorId() {
    let visitorId = localStorage.getItem('c2c_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('c2c_visitor_id', visitorId);
    }
    return visitorId;
  }
  // Получаем сохранённый токен чата
  function getChatToken() {
    return localStorage.getItem('c2c_chat_token_' + SOURCE);
  }
  function setChatToken(token) {
    localStorage.setItem('c2c_chat_token_' + SOURCE, token);
  }
  // Стили виджета
  const styles = `
    #c2c-chat-widget {
      position: fixed;
      bottom: 20px;
      ${POSITION}: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #c2c-chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${PRIMARY_COLOR};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    #c2c-chat-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    #c2c-chat-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    #c2c-chat-button.open svg.chat-icon { display: none; }
    #c2c-chat-button.open svg.close-icon { display: block; }
    #c2c-chat-button:not(.open) svg.chat-icon { display: block; }
    #c2c-chat-button:not(.open) svg.close-icon { display: none; }
    /* Подсказка возле кнопки */
    #c2c-chat-tooltip {
      position: absolute;
      ${POSITION === 'right' ? 'right: 70px' : 'left: 70px'};
      bottom: 5px;
      background: ${BG_COLOR};
      color: white;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: c2c-pulse 2s ease-in-out infinite;
      max-width: 200px;
      white-space: normal;
      text-align: center;
      line-height: 1.3;
    }
    #c2c-chat-tooltip::after {
      content: '';
      position: absolute;
      ${POSITION === 'right' ? 'right: -8px' : 'left: -8px'};
      top: 50%;
      transform: translateY(-50%);
      border: 8px solid transparent;
      ${POSITION === 'right' ? `border-left-color: ${BG_COLOR}` : `border-right-color: ${BG_COLOR}`};
    }
    #c2c-chat-tooltip .highlight {
      color: ${PRIMARY_COLOR};
      font-weight: 700;
    }
    @keyframes c2c-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.02); }
    }
    #c2c-chat-widget.open #c2c-chat-tooltip {
      display: none;
    }
    #c2c-chat-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ff4444;
      color: white;
      font-size: 12px;
      font-weight: bold;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
    }
    #c2c-chat-window {
      position: absolute;
      bottom: 70px;
      ${POSITION}: 0;
      width: 380px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 5px 40px rgba(0,0,0,0.16);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    #c2c-chat-window.open {
      display: flex;
      animation: c2c-slideUp 0.3s ease;
    }
    @keyframes c2c-slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #c2c-chat-header {
      background: ${BG_COLOR};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #c2c-chat-header-logo {
      font-size: 18px;
      font-weight: 700;
      color: white;
    }
    #c2c-chat-header-logo span {
      color: ${PRIMARY_COLOR};
    }
    #c2c-chat-header-subtitle {
      font-size: 12px;
      color: ${PRIMARY_COLOR};
      margin-left: auto;
    }
    #c2c-chat-close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #c2c-chat-close-btn:hover {
      background: rgba(255,255,255,0.1);
    }
    #c2c-chat-close-btn svg {
      width: 24px;
      height: 24px;
      fill: white;
      display: block;
    }
    }
    #c2c-chat-iframe {
      position: absolute;
      top: 56px; /* высота header */
      height: 500px !important;
      left: 0;
      right: 0;
      bottom: 0;
      border: none;
    }
    #c2c-chat-preload {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      background: #f8f9fa;
    }
    #c2c-chat-preload h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: ${BG_COLOR};
    }
    #c2c-chat-preload p {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
    #c2c-start-chat-btn {
      background: ${PRIMARY_COLOR};
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
    }
    #c2c-start-chat-btn:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }
    #c2c-loading {
      display: none;
      flex: 1;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }
    #c2c-loading.active {
      display: flex;
    }
    .c2c-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #eee;
      border-top-color: ${PRIMARY_COLOR};
      border-radius: 50%;
      animation: c2c-spin 1s linear infinite;
    }
    @keyframes c2c-spin {
      to { transform: rotate(360deg); }
    }
    /* Tablet styles */
    @media (max-width: 768px) {
      #c2c-chat-window {
        width: 340px;
        height: 480px;
      }
    }
    /* Mobile styles */
    @media (max-width: 480px) {
      #c2c-chat-widget {
        bottom: 12px;
        ${POSITION}: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      }
      #c2c-chat-window {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        max-height: 100dvh;
        border-radius: 0;
        z-index: 1000000;
      }
      #c2c-chat-button {
        width: 54px;
        height: 54px;
      }
      #c2c-chat-button svg {
        width: 26px;
        height: 26px;
      }
      /* Tooltip сверху кнопки на мобильных */
      #c2c-chat-tooltip {
        position: absolute;
        bottom: 65px;
        ${POSITION}: 0;
        left: auto;
        right: auto;
        ${POSITION === 'right' ? 'right: -10px' : 'left: -10px'};
        max-width: 180px;
        font-size: 11px;
        padding: 8px 10px;
        line-height: 1.25;
      }
      #c2c-chat-tooltip::after {
        top: auto;
        bottom: -8px;
        ${POSITION === 'right' ? 'right: 22px' : 'left: 22px'};
        left: auto;
        transform: none;
        border: 8px solid transparent;
        border-top-color: ${BG_COLOR};
        border-left-color: transparent;
        border-right-color: transparent;
      }
      #c2c-chat-header {
        padding: 14px 16px;
        padding-top: calc(14px + env(safe-area-inset-top, 0px));
      }
      #c2c-chat-header-logo {
        font-size: 16px;
      }
      #c2c-chat-header-subtitle {
        font-size: 11px;
      }
      #c2c-chat-preload {
        padding: 30px 20px;
      }
      #c2c-chat-preload h3 {
        font-size: 16px;
      }
      #c2c-chat-preload p {
        font-size: 13px;
      }
      #c2c-start-chat-btn {
        padding: 12px 28px;
        font-size: 15px;
      }
    }
    /* Very small screens */
    @media (max-width: 360px) {
      #c2c-chat-tooltip {
        max-width: 150px;
        font-size: 10px;
        padding: 6px 8px;
      }
      #c2c-chat-button {
        width: 50px;
        height: 50px;
      }
      #c2c-chat-button svg {
        width: 24px;
        height: 24px;
      }
    }
  `;
  // HTML виджета
  const tooltipHTML = TOOLTIP ? `
    <div id="c2c-chat-tooltip">
      ${TOOLTIP.replace(/СЮДА/g, '<span class="highlight">СЮДА</span>').replace(/WhatsApp/g, '<span class="highlight">WhatsApp</span>').replace(/Telegram/g, '<span class="highlight">Telegram</span>')}
    </div>
  ` : '';
  const widgetHTML = `
    <div id="c2c-chat-widget">
      <div id="c2c-chat-window">
        <div id="c2c-chat-header">
          <div id="c2c-chat-header-logo">${BRAND}</div>
          <div id="c2c-chat-header-subtitle">Чат с менеджером</div>
          <button id="c2c-chat-close-btn" title="Свернуть чат">
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div id="c2c-chat-preload">
          <h3>👋 ${GREETING}</h3>
          <p>Нажмите кнопку ниже, чтобы начать диалог с нашим менеджером</p>
          <button id="c2c-start-chat-btn">Начать чат</button>
        </div>
        <div id="c2c-loading">
          <div class="c2c-spinner"></div>
        </div>
        <iframe id="c2c-chat-iframe" style="display:none;"></iframe>
      </div>
      ${tooltipHTML}
      <button id="c2c-chat-button">
        <span id="c2c-chat-badge">1</span>
        <svg class="chat-icon" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <svg class="close-icon" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  `;
  // Инициализация виджета
  function init() {
    // Добавляем стили
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    // Добавляем HTML
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);
    // Элементы
    const widget = document.getElementById('c2c-chat-widget');
    const button = document.getElementById('c2c-chat-button');
    const chatWindow = document.getElementById('c2c-chat-window');
    const preload = document.getElementById('c2c-chat-preload');
    const loading = document.getElementById('c2c-loading');
    const iframe = document.getElementById('c2c-chat-iframe');
    const startBtn = document.getElementById('c2c-start-chat-btn');
    const closeBtn = document.getElementById('c2c-chat-close-btn');
    let isOpen = false;
    let chatInitialized = false;
    // Функция закрытия чата
    function closeChat() {
      isOpen = false;
      button.classList.remove('open');
      chatWindow.classList.remove('open');
      widget.classList.remove('open');
    }
    // Проверяем есть ли уже токен
    const existingToken = getChatToken();
    if (existingToken) {
      chatInitialized = true;
      preload.style.display = 'none';
      iframe.style.display = 'block';
      iframe.src = `${CONFIG.chatUrl}/c/${existingToken}`;
    }
    // Открыть/закрыть чат (основная кнопка)
    button.addEventListener('click', () => {
      isOpen = !isOpen;
      button.classList.toggle('open', isOpen);
      chatWindow.classList.toggle('open', isOpen);
      widget.classList.toggle('open', isOpen);
    });
    // Кнопка закрытия в шапке (мобильная)
    closeBtn.addEventListener('click', closeChat);
    // Начать чат
    startBtn.addEventListener('click', async () => {
      preload.style.display = 'none';
      loading.classList.add('active');
      try {
        const response = await fetch(`${CONFIG.apiUrl}/chat/widget/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: SOURCE,
            visitorId: getVisitorId(),
            pageUrl: window.location.href,
          }),
        });
        const data = await response.json();
        if (data.token) {
          setChatToken(data.token);
          chatInitialized = true;
          loading.classList.remove('active');
          iframe.style.display = 'block';
          iframe.src = `${CONFIG.chatUrl}/c/${data.token}`;
        } else {
          throw new Error('No token received');
        }
      } catch (error) {
        console.error('Chat init error:', error);
        loading.classList.remove('active');
        preload.style.display = 'flex';
        preload.innerHTML = `
          <h3>😔 Ошибка подключения</h3>
          <p>Не удалось запустить чат. Попробуйте позже или свяжитесь с нами по телефону.</p>
          <button id="c2c-start-chat-btn" onclick="location.reload()">Попробовать снова</button>
        `;
      }
    });
  }
  // Запуск после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
