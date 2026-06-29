import { useState } from 'react';
import { apiRequest } from '../../lib/api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Xin chào! Tôi là trợ lý AI của VietTravel. Tôi có thể giúp gì cho bạn?' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [history, setHistory] = useState([]);

  const send = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;
    setMessages((m) => [...m, { sender: 'user', text: message }]);
    setInput('');
    setTyping(true);
    try {
      const { ok, data } = await apiRequest('/chat', { method: 'POST', body: JSON.stringify({ message, history }) });
      const reply = ok ? data.reply : 'Xin lỗi, đã có lỗi xảy ra.';
      setMessages((m) => [...m, { sender: 'bot', text: reply }]);
      setHistory((h) => [...h, { role: 'user', text: message }, { role: 'model', text: reply }]);
    } catch {
      setMessages((m) => [...m, { sender: 'bot', text: 'Không thể kết nối server.' }]);
    }
    setTyping(false);
  };

  return (
    <div className="chat-widget" id="chatWidget">
      <button type="button" className="chat-btn" onClick={() => setOpen(true)} title="Chat với AI"><i className="fas fa-comment-dots" /></button>
      <div className={`chat-window ${open ? 'open' : ''}`}>
        <div className="chat-header">
          <div><i className="fas fa-robot" /> VietTravel AI</div>
          <button type="button" className="chat-header-close" onClick={() => setOpen(false)}><i className="fas fa-times" /></button>
        </div>
        <div className="chat-body">
          {messages.map((m, i) => <div key={i} className={`chat-msg ${m.sender}`}>{m.text}</div>)}
          {typing && <div className="typing-indicator"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div>}
        </div>
        <form className="chat-input-area" onSubmit={send}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập câu hỏi..." required />
          <button type="submit"><i className="fas fa-paper-plane" /></button>
        </form>
      </div>
    </div>
  );
}
