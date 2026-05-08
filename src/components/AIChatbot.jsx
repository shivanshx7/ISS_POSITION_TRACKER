import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Bot, User } from 'lucide-react';
import { askAI, loadChatHistory, saveChatHistory, clearChatHistory } from '../services/aiService';
import toast from 'react-hot-toast';

const AIChatbot = ({ issData, newsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const history = loadChatHistory();
    if (history.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm SpaceWatch AI. I can answer questions about the ISS location, speed, the crew in space, and the latest news articles on your dashboard. How can I help you today?"
      }]);
    } else {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    saveChatHistory(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await askAI({
        issData,
        newsData,
        messages: newMessages,
        userMessage
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      toast.error('AI error: ' + error.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error while processing your request. Please check your API token." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    clearChatHistory();
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. I'm ready for new questions!"
    }]);
    toast.success('Chat history cleared');
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="btn-primary" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          padding: 0
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-card" style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '380px',
          height: '550px',
          maxWidth: 'calc(100vw - 60px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'slide-up 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '15px 20px',
            background: 'var(--gradient-primary)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={20} />
              <div style={{ fontWeight: 700, fontSize: '16px' }}>SpaceWatch AI</div>
            </div>
            <button 
              onClick={handleClear} 
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}
              title="Clear Chat"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            background: 'var(--bg-secondary)'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{ 
                    width: '30px', height: '30px', borderRadius: '50%', 
                    background: 'var(--accent-blue)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    flexShrink: 0, marginTop: '5px' 
                  }}>
                    <Bot size={16} color="white" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  boxShadow: 'var(--shadow-sm)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none'
                }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div style={{ 
                    width: '30px', height: '30px', borderRadius: '50%', 
                    background: 'var(--accent-purple)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    flexShrink: 0, marginTop: '5px' 
                  }}>
                    <User size={16} color="white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="white" />
                </div>
                <div className="card" style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 2px', display: 'flex', gap: '4px' }}>
                  <div className="pulse-dot"></div>
                  <div className="pulse-dot" style={{ animationDelay: '0.2s' }}></div>
                  <div className="pulse-dot" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{
            padding: '15px',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px'
          }}>
            <input 
              type="text" 
              placeholder="Ask about ISS or News..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '10px 15px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button type="submit" className="btn-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;
