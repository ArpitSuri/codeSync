import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import { FaCopy, FaSignOutAlt, FaUsers, FaCode, FaComments } from 'react-icons/fa';
import logo from '../images/output-onlinepngtools.png';
import Client from './Client';
import Editor from './Editor';
import { initSocket } from '../socket.js';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Chat from './Chat';

const Editorpage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'chat', 'users'

  function handleErrors(e) {
    console.log('socket error', e);
    toast.error('Socket Connection failed, try again later.');
    reactNavigator('/');
  }

  useEffect(() => {
    // Handle responsive layout
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      // Connection with Socket io
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // For joining
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      // For disconnection
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter(client => client.socketId !== socketId);
        });
      });
    };
    
    init();
    
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }
  
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to clipboard');
    } catch (err) {
      toast.error('Could not copy Room ID');
      console.log(err);
    }
  };
  
  const leaveRoom = () => {
    reactNavigator('/');
  };

  return (
    <div className="workspace-container">
      {/* Mobile navigation tabs */}
      {isMobileView && (
        <div className="mobile-tabs">
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> <span>Users</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <FaCode /> <span>Editor</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <FaComments /> <span>Chat</span>
          </button>
        </div>
      )}
      
      {/* Sidebar (hidden on mobile unless activeTab is 'users') */}
      <div className={`sidebar ${isMobileView && activeTab !== 'users' ? 'hidden' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            {/* <div className="logo-icon">
              <img src={logo} alt="codeSync" />
            </div> */}
            <h3>codeSync</h3>
          </div>
          <div className="room-info">
            <div className="room-id">
              <span>Room ID: </span>
              <code>{roomId}</code>
            </div>
            <Button 
              className="copy-btn" 
              onClick={copyRoomId} 
              title="Copy Room ID"
            >
              <FaCopy /> <span>Copy ID</span>
            </Button>
          </div>
        </div>
        
        <div className="connected-users">
          <h5>
            <FaUsers /> Connected Users <span className="user-count">{clients.length}</span>
          </h5>
          <div className="users-list">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        
        <div className="sidebar-footer">
          <Button className="leave-btn" onClick={leaveRoom}>
            <FaSignOutAlt /> Leave Room
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="main-content">
        {/* Editor section (hidden on mobile unless activeTab is 'editor') */}
        <div className={`editor-section ${isMobileView && activeTab !== 'editor' ? 'hidden' : ''}`}>
          <Editor 
            socketRef={socketRef} 
            roomId={roomId} 
            onCodeChange={(code) => { codeRef.current = code; }} 
          />
        </div>
        
        {/* Chat section (hidden on mobile unless activeTab is 'chat') */}
        <div className={`chat-section ${isMobileView && activeTab !== 'chat' ? 'hidden' : ''}`}>
          <Chat />
        </div>
      </div>
      
      <style jsx>{`
        .workspace-container {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background-color: #1e1f29;
          position: relative;
        }
        
        /* Mobile navigation */
        .mobile-tabs {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #1a1b23;
          z-index: 100;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .tab-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: none;
          border: none;
          color: #8c8c8c;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }
        
        .tab-button.active {
          color: #4d67c3;
          background-color: rgba(77, 103, 195, 0.1);
        }
        
        .tab-button span {
          margin-top: 4px;
          font-size: 0.7rem;
        }
        
        /* Sidebar */
        .sidebar {
          width: 280px;
          background-color: #282a36;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #3c3f58;
          transition: all 0.3s ease;
        }
        
        .sidebar-header {
          padding: 16px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .logo-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-icon img {
          max-width: 100%;
          max-height: 100%;
        }
        
        .logo h3 {
          margin: 0;
          margin-left: 10px;
          color: rgb(231, 11, 56, 0.78);
          font-weight: 800;
          font-size: 1.3rem;
        }
        
        .room-info {
          background-color: #1e1f29;
          border-radius: 6px;
          padding: 10px;
        }
        
        .room-id {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          color: #f8f8f2;
          margin-bottom: 8px;
        }
        
        .room-id span {
          margin-right: 5px;
          opacity: 0.7;
        }
        
        .room-id code {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.75rem;
          color: #f8f8f2;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
          display: inline-block;
        }
        
        .copy-btn {
          width: 100%;
          background-color: #4d67c3 !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          font-size: 0.8rem !important;
          padding: 6px 12px !important;
          transition: all 0.2s ease !important;
        }
        
        .copy-btn:hover {
          background-color: #3a52a8 !important;
        }
        
        .connected-users {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        .connected-users h5 {
          color: #f8f8f2;
          display: flex;
          align-items: center;
          font-size: 0.95rem;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .connected-users h5 svg {
          margin-right: 8px;
          color: #4d67c3;
        }
        
        .user-count {
          margin-left: auto;
          background-color: #4d67c3;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: normal;
        }
        
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #3c3f58;
        }
        
        .leave-btn {
          width: 100%;
          background-color: rgb(231, 11, 56, 0.78) !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          padding: 8px 12px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        
        .leave-btn:hover {
          background-color: rgb(231, 11, 56) !important;
        }
        
        /* Main content area */
        .main-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        
        .editor-section {
          flex: 2;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .chat-section {
          width: 320px;
          background-color: #282a36;
          border-left: 1px solid #3c3f58;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .workspace-container {
            flex-direction: column;
          }
          
          .mobile-tabs {
            display: flex;
            height: 60px;
          }
          
          .sidebar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 60px; /* Height of mobile tabs */
            width: 100%;
            z-index: 90;
          }
          
          .main-content {
            padding-bottom: 60px; /* Height of mobile tabs */
          }
          
          .editor-section, .chat-section {
            width: 100%;
            flex: 1;
          }
          
          .hidden {
            display: none;
          }
        }
        
        @media (min-width: 769px) {
          /* Ensure desktop view */
          .sidebar, .editor-section, .chat-section {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Editorpage;