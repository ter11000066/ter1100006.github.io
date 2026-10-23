// ============================================================
// TELEGRAM BOT CONFIGURATION & HELPERS
// ============================================================

// Bot token – keep this secret!
const BOT_TOKEN = '8481443482:AAHASi6x61ivI1w8uu8VTp86BA8CAPnpaK0';

// Pull chat ID and proxy from endpoints.js
const CHAT_ID = window.TELEGRAM_CHAT_ID;
const PROXY   = window.TELEGRAM_PROXY;

// ------------------------------------------------------------
// Direct Telegram API helpers (no proxy)
// ------------------------------------------------------------

/**
 * Send a text message directly via Telegram Bot API.
 * @param {string} text
 * @param {string} [parse_mode]
 * @returns {Promise}
 */
function sendTelegramMessage(text, parse_mode) {
    let url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}`;
    if (parse_mode) url += `&parse_mode=${parse_mode}`;
    return fetch(url, { method: 'GET' });
}

/**
 * Send a document (file) directly via Telegram Bot API.
 * @param {File} file
 * @param {string} [caption]
 * @returns {Promise}
 */
function sendTelegramDocument(file, caption) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('document', file);
    if (caption) formData.append('caption', caption);
    return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData
    }).then(res => res.json());
}

// ------------------------------------------------------------
// Proxy-based helpers (Cloudflare worker)
// ------------------------------------------------------------

/**
 * Send a text message via the Cloudflare worker proxy.
 * @param {string} text
 * @param {object} [reply_markup]
 * @returns {Promise}
 */
function sendTelegramMessageViaProxy(text, reply_markup) {
    return fetch(`${PROXY}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: text,
            reply_markup: reply_markup
        })
    });
}

/**
 * Get updates from Telegram via the proxy.
 * @param {number} offset
 * @param {number} [timeout]
 * @returns {Promise<object>}
 */
async function getTelegramUpdates(offset, timeout) {
    let url = `${PROXY}/getUpdates?offset=${offset}`;
    if (timeout) url += `&timeout=${timeout}`;
    const res = await fetch(url);
    return res.json();
}

/**
 * Answer a callback query via the proxy.
 * @param {string} callback_query_id
 * @param {string} text
 * @returns {Promise}
 */
function answerTelegramCallback(callback_query_id, text) {
    return fetch(`${PROXY}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            callback_query_id: callback_query_id,
            text: text
        })
    });
}
