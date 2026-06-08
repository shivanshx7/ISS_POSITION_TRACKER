import { useState, useEffect, useRef } from 'react';
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
    setTimeout(() => {
      if (history.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "Hello Commander! I'm SpaceWatch AI, your direct downlink terminal. Ask me anything about the ISS tracking status, telemetry rates, current space crew, or latest news articles on your feed."
        }]);
      } else {
        setMessages(history);
      }
    }, 0);
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
      toast.error('Downlink failure: ' + error.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Downlink connection failed. Please verify that VITE_AI_TOKEN is correctly set in your environment file." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    clearChatHistory();
    setMessages([{
      role: 'assistant',
      content: "Chat log cleared. Terminal listening. Ask me about ISS or news telemetry."
    }]);
    toast.success('Chat terminal logs cleared');
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
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(6, 182, 212, 0.35)',
          border: 'none',
          zIndex: 9999,
          padding: 0,
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        className="floating-chat-btn"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-card chatbot-window-container" style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '380px',
          height: '560px',
          maxWidth: 'calc(100vw - 60px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          borderColor: 'var(--border-color)'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 20px',
            background: 'var(--gradient-primary)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '6px',
                borderRadius: '6px'
              }}>
                <Bot size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>SpaceWatch Assistant</div>
                <div style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Downlink Terminal</div>
              </div>
            </div>
            <button 
              onClick={handleClear} 
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, padding: '4px', transition: 'var(--transition)' }}
              title="Clear Terminal Log"
              className="btn-clear-chat"
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
            gap: '16px',
            background: 'var(--bg-secondary)'
          }}
          className="chat-message-list-pane"
          >
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '10px'
                }}>
                  {!isUser && (
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '8px', 
                      background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      flexShrink: 0, marginTop: '2px' 
                    }}>
                      <Bot size={14} color="var(--accent-cyan)" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isUser ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.03)',
                    color: isUser ? '#fafafa' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    boxShadow: isUser ? '0 4px 10px rgba(6, 182, 212, 0.15)' : 'none',
                    border: isUser ? 'none' : '1px solid var(--border-color)'
                  }}>
                    {msg.content}
                  </div>
                  {isUser && (
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '8px', 
                      background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      flexShrink: 0, marginTop: '2px' 
                    }}>
                      <User size={14} color="var(--accent-purple)" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {isTyping && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '8px', 
                  background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Bot size={14} color="var(--accent-cyan)" />
                </div>
                <div className="card" style={{ 
                  padding: '10px 14px', 
                  borderRadius: '14px 14px 14px 2px', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'var(--border-color)' 
                }}>
                  <div className="pulse-dot-typing"></div>
                  <div className="pulse-dot-typing" style={{ animationDelay: '0.2s' }}></div>
                  <div className="pulse-dot-typing" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSend} style={{
            padding: '14px',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input 
              type="text" 
              placeholder="Query orbital assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '13px',
                height: '38px',
                transition: 'var(--transition)'
              }}
              className="hover-glow"
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: 'var(--radius-md)', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        .floating-chat-btn {
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.25) !important;
          transition: var(--transition) !important;
        }

        .floating-chat-btn:hover {
          transform: scale(1.08) rotate(5deg) !important;
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.45) !important;
        }

        .chatbot-window-container {
          animation: terminal-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .btn-clear-chat:hover {
          opacity: 1 !important;
          color: var(--accent-red);
          transform: scale(1.1);
        }

        .pulse-dot-typing {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--text-secondary);
          animation: dot-glow 1.2s infinite ease-in-out;
        }

        @keyframes dot-glow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes terminal-slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Message scroll styling */
        .chat-message-list-pane::-webkit-scrollbar {
          width: 4px;
        }
      `}</style>
    </>
  );
};

export default AIChatbot;
