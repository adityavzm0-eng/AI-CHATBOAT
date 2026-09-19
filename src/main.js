import './style.css'

const promptItems = [
  ['Plan a project', 'Turn a loose idea into clear next steps.'],
  ['Explain a concept', 'Make something complicated feel simple.'],
  ['Write something', 'Draft an email, post, or polished copy.'],
]

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <main class="main-panel" id="chat">
      <header class="topbar"><div class="brand"><span class="brand-mark">S</span><span>Siddhu's <strong>Chatbot</strong></span></div><span class="status"><i></i> Online</span></header>
      <section class="chat-content">
        <div class="welcome">
          <p class="eyebrow">YOUR AI ASSISTANT <span></span> READY TO HELP</p>
          <h1>What can I help<br>you with<span>?</span></h1>
          <p class="intro">Ask anything, explore ideas, or get help with your next big task.</p>
        </div>
        <div class="prompt-grid" id="prompt-grid">
          ${promptItems.map(([title, copy], index) => `<button class="prompt-card" data-prompt="${title}"><span class="prompt-number">0${index + 1}</span><strong>${title}</strong><small>${copy}</small><span class="arrow">↗</span></button>`).join('')}
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
  document.querySelector('#prompt-grid').classList.add('is-hidden')
  const safeText = cleanText.replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char]))
  conversation.insertAdjacentHTML('beforeend', `<div class="message user-message"><span class="avatar">AK</span><p>${safeText}</p></div><div class="message bot-message" id="pending-response"><span class="bot-dot">S</span><p>Thinking...</p></div>`)
  input.value = ''
  input.style.height = 'auto'
  try {
    const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: cleanText }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Request failed')
    document.querySelector('#pending-response p').textContent = data.response
  } catch (error) {
    document.querySelector('#pending-response p').textContent = 'The local backend is not connected yet. Start Flask and try again.'
  } finally {
    document.querySelector('#pending-response')?.removeAttribute('id')
  }
  conversation.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

document.querySelector('#composer').addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value) })
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 140)}px` })
input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(input.value) } })
document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => { input.value = `${button.dataset.prompt}: `; input.focus() }))
document.querySelector('.brand').addEventListener('click', () => { conversation.innerHTML = ''; document.querySelector('#prompt-grid').classList.remove('is-hidden'); input.value = ''; input.focus() })
