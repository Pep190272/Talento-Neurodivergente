'use client'
import React, { useState, useEffect, useRef } from 'react';

export default function NeuroAgent({ userData = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    } else {
      // Welcome message
      setMessages([
        {
          role: 'agent',
          content: `Hello! I'm NeuroAgent, your AI assistant for neurodivergent support. ${userData ? `I see you're registered as a ${userData.type}. How can I help you today?` : 'How can I assist you with neurodivergent resources, accommodations, or workplace integration?'}`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [userData]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input.trim(),
          history: messages.map(msg => ({ role: msg.role, content: msg.content })),
          userData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get response');
      }

      const agentMessage = {
        role: 'agent',
        content: result.response,
        timestamp: result.timestamp
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'agent',
        content: 'Chat history cleared. How can I help you?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="neuro-agent" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#fff'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>NeuroAgent</h3>
        <button
          onClick={clearChat}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              background: message.role === 'user' ? '#0070f3' : '#f1f3f4',
              color: message.role === 'user' ? 'white' : '#333',
              wordWrap: 'break-word'
            }}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px',
              background: '#f1f3f4',
              color: '#666'
            }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>NeuroAgent is typing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        padding: '16px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about neurodivergent support..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '12px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: 'bold',
            opacity: (isLoading || !input.trim()) ? 0.6 : 1
          }}
        >
          Send
        </button>
      </form>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
} 