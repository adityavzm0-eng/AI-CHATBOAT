import './style.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '')).replace(/\/$/, '')

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <main class="main-panel" id="chat">
      <header class="topbar"><div class="brand"><span class="brand-mark">S</span><span>Siddhu's <strong>Chatbot</strong></span></div><span class="status"><i></i> Online</span></header>
      <section class="chat-content">
        <div class="welcome">
          <p class="eyebrow">PRIVATE CHAT <span></span> READY</p>
          <h1>How can I help<span>?</span></h1>
        </div>
        <div class="conversation-space" id="conversation-space"></div>
        <form class="composer" id="composer">
          <textarea id="message-input" rows="1" placeholder="Message Siddhu's Chatbot..." aria-label="Message Siddhu's Chatbot"></textarea>
          <div class="composer-tools"><button type="button" class="tool-button" aria-label="Attach a file">＋</button><span>Press <kbd>Enter</kbd> to send</span><button class="send-button" aria-label="Send message">↑</button></div>
        </form>
        <p class="disclaimer">Siddh's Chatbot can make mistakes. Check important information.</p>
      </section>
    </main>
  </div>
`

const input = document.querySelector('#message-input')
const conversation = document.querySelector('#conversation-space')

async function sendMessage(text) {
  const cleanText = text.trim()
  if (!cleanText) return
  const safeText = cleanText.replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char]))
  conversation.insertAdjacentHTML('beforeend', `<div class="message user-message"><span class="avatar">BS</span><p>${safeText}</p></div><div class="message bot-message" id="pending-response"><span class="bot-dot">S</span><p>Thinking...</p></div>`)
  input.value = ''
  input.style.height = 'auto'
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: cleanText }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Request failed')
    document.querySelector('#pending-response p').textContent = data.response
  } catch (error) {
    document.querySelector('#pending-response p').textContent = error.message || 'The chat service is unavailable. Start the backend and try again.'
  } finally {
    document.querySelector('#pending-response')?.removeAttribute('id')
  }
  conversation.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

document.querySelector('#composer').addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value) })
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 140)}px` })
input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(input.value) } })
document.querySelector('.brand').addEventListener('click', () => { conversation.innerHTML = ''; input.value = ''; input.focus() })
