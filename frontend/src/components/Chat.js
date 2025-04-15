import React, { useEffect } from 'react';
import { useState, useRef } from 'react';
import { initSocket } from '../socket.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

const Chat = () => {
  const chatRef = useRef();
  const messagesEndRef = useRef();
  const [chat, setChat] = useState([]);

  // Getting name from local storage
  const localData = JSON.parse(localStorage.getItem('name'));
  const [state, setState] = useState({ name: localData, message: "" });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const init = async () => {
      chatRef.current = await initSocket();
      chatRef.current.on("message", ({ name, message }) => {
        setChat([...chat, { name, message }]);
      });
    };
    
    init();
    scrollToBottom();
    
    return () => chatRef.current.disconnect();
  }, [chat]);

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onMessageSubmit = (e) => {
    e.preventDefault();
    const { name, message } = state;
    
    if (message.trim() !== "") {
      chatRef.current.emit("message", { name, message });
      setState({ name, message: "" });
    }
  };

  const renderChat = () => {
    return chat.map(({ name, message }, index) => {
      const isCurrentUser = name === state.name;
      
      return (
        <div 
          key={index} 
          className={`message-bubble ${isCurrentUser ? 'my-message' : 'other-message'}`}
        >
          <div className="message-content">
            <div className="message-sender">{name}</div>
            <div className="message-text">{message}</div>
          </div>
        </div>
      );
    });
  };

  // Handle form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onMessageSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat Room</h3>
      </div>
      
      <div className="messages-container">
        {renderChat()}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input-container">
        <Form onSubmit={onMessageSubmit}>
          <InputGroup>
            <Form.Control
              name="message"
              type="text"
              onChange={onTextChange}
              onKeyDown={handleKeyDown}
              value={state.message}
              placeholder="Type a message..."
              aria-label="Message"
              className="message-input"
            />
            <Button 
              type="submit" 
              className="send-button"
              disabled={state.message.trim() === ""}
            >
              Send
            </Button>
          </InputGroup>
        </Form>
      </div>
      
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 80vh;
          background-color: #f5f7fb;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .chat-header {
          padding: 15px 20px;
          background-color: #4d67c3;
          color: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .chat-header h3 {
          margin: 0;
          font-family: 'Baloo Bhaijaan 2', cursive;
          font-size: 1.4rem;
          font-weight: 600;
        }
        
        .messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message-bubble {
          max-width: 80%;
          padding: 10px 15px;
          border-radius: 18px;
          animation: fadeIn 0.3s ease;
        }
        
        .my-message {
          align-self: flex-end;
          background-color: #4d67c3;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .other-message {
          align-self: flex-start;
          background-color: white;
          color: #333;
          border: 1px solid #e1e4e8;
          border-bottom-left-radius: 4px;
        }
        
        .message-sender {
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 4px;
          opacity: 0.9;
        }
        
        .message-text {
          word-break: break-word;
          line-height: 1.4;
        }
        
        .message-input-container {
          padding: 15px;
          background-color: white;
          border-top: 1px solid #e1e4e8;
        }
        
        .message-input {
          border-radius: 20px 0 0 20px !important;
          padding: 12px 15px !important;
          border: 1px solid #e1e4e8 !important;
          box-shadow: none !important;
          font-size: 0.95rem;
        }
        
        .send-button {
          background-color: #4d67c3 !important;
          border-color: #4d67c3 !important;
          border-radius: 0 20px 20px 0 !important;
          padding: 0 20px !important;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .send-button:hover {
          background-color: #3a52a8 !important;
        }
        
        .send-button:disabled {
          background-color: #c7d0e8 !important;
          border-color: #c7d0e8 !important;
          cursor: not-allowed;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* For better mobile display */
        @media (max-width: 576px) {
          .message-bubble {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;