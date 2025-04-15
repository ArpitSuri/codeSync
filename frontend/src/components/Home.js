import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { FaUsers, FaPlusCircle, FaArrowRight, FaCode } from 'react-icons/fa';
import logo from '../images/web-programming.png';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Creating new room using uuidV4
    const createNewRoom = (e) => {
        e.preventDefault();
        setIsCreating(true);
        
        try {
            const id = uuidV4();
            setRoomId(id);
            toast.success('New room created');
            
            // Optional: Could auto-focus the username field after creating room
            document.getElementById('username-input').focus();
        } catch (error) {
            toast.error('Failed to create room');
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const joinRoom = (e) => {
        if (e) e.preventDefault();
        
        if (!roomId || !username) {
            toast.error('Room ID and Username are required');
            return;
        }
        
        setIsJoining(true);
        
        try {
            navigate(`/editor/${roomId}`, {
                state: {
                    username,
                }
            });
        } catch (error) {
            setIsJoining(false);
            toast.error('Failed to join room');
            console.error(error);
        }
    };

    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    };

    useEffect(() => {
        // Load username from localStorage if available
        const savedName = localStorage.getItem('name');
        if (savedName) {
            try {
                setUsername(JSON.parse(savedName));
            } catch (e) {
                console.error('Failed to parse saved username');
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('name', JSON.stringify(username));
    }, [username]);

    return (
        <div className="home-container">
            <div className="background-gradient"></div>
            <div className="main-content">
                <Card className="login-card">
                    <div className="card-header">
                        {/* <div className="logo-container">
                             <img src={logo} alt="Code Collab Logo" className="logo" /> 
                            <FaCode className="code-icon" />
                        </div> */}
                        <h1 className="app-title">codeSync</h1>
                    </div>
                    
                    <Card.Body>
                        <p className="tagline">Real-time code collaboration platform</p>
                        
                        <Form onSubmit={joinRoom}>
                            <Form.Group className="mb-3">
                                <Form.Label>Room ID</Form.Label>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            <FaUsers />
                                        </span>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Paste invitation Room ID"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        onKeyDown={handleInputEnter}
                                        className="room-input"
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Your Name</Form.Label>
                                <Form.Control
                                    id="username-input"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={handleInputEnter}
                                    className="username-input"
                                />
                            </Form.Group>

                            <div className="button-group">
                                <Button 
                                    variant="primary"
                                    type="submit"
                                    className="join-button"
                                    disabled={isJoining || !roomId || !username}
                                >
                                    {isJoining ? 'Joining...' : 'Join Room'}
                                    <FaArrowRight />
                                </Button>
                                
                                <div className="divider">
                                    <span>OR</span>
                                </div>
                                
                                <Button 
                                    variant="secondary"
                                    onClick={createNewRoom}
                                    className="create-button"
                                    disabled={isCreating}
                                >
                                    {isCreating ? 'Creating...' : 'Create New Room'}
                                    <FaPlusCircle />
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                    
                    <div className="card-footer">
                        <p>Start coding together in seconds</p>
                    </div>
                </Card>
            </div>
            
            <style jsx>{`
                .home-container {
                    min-height: 100vh;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #1e1e1f;
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }
                
                .background-gradient {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(
                        circle at center,
                        rgba(77, 103, 195, 0.1) 0%,
                        rgba(231, 11, 56, 0.05) 50%,
                        rgba(30, 30, 31, 1) 100%
                    );
                    z-index: 1;
                }
                
                .main-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 450px;
                }
                
                .login-card {
                    background-color: #282a36;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .login-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                }
                
                .card-header {
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    background-color: rgba(231, 11, 56, 0.05);
                    border-bottom: 1px solid rgba(231, 11, 56, 0.2);
                }
                
                .logo-container {
                    position: relative;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                }
                
                .logo {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                }
                
                .code-icon {
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    color: #E70B38;
                    font-size: 18px;
                    background: #282a36;
                    border-radius: 50%;
                    padding: 2px;
                }
                
                .app-title {
                    margin: 0;
                    color: #E70B38;
                    font-family: 'Baloo Bhaijaan 2', cursive;
                    font-weight: 800;
                    font-size: 1.8rem;
                }
                
                .tagline {
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 24px;
                    font-style: italic;
                }
                
                Card.Body {
                    padding: 24px;
                }
                
                Form.Label {
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 500;
                    font-size: 0.9rem;
                    margin-bottom: 6px;
                }
                
                .input-group {
                    display: flex;
                    align-items: center;
                    background-color: #1e1e1f;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: border-color 0.2s ease;
                }
                
                .input-group:focus-within {
                    border-color: #4d67c3;
                }
                
                .input-group-text {
                    background-color: rgba(77, 103, 195, 0.2);
                    border: none;
                    color: #4d67c3;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .room-input, .username-input {
                    background-color: #1e1e1f;
                    border: none;
                    color: white;
                    padding: 12px;
                    font-family: 'Baloo Bhaijaan 2', cursive;
                    font-size: 0.95rem;
                    box-shadow: none !important;
                }
                
                .room-input:focus, .username-input:focus {
                    background-color: #1e1e1f;
                    color: white;
                    box-shadow: none !important;
                }
                
                .button-group {
                    margin-top: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .join-button, .create-button {
                    padding: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }
                
                .join-button {
                    background-color: #E70B38 !important;
                }
                
                .join-button:hover:not(:disabled) {
                    background-color: #c30930 !important;
                    transform: translateY(-2px);
                }
                
                .create-button {
                    background-color: #4d67c3 !important;
                }
                
                .create-button:hover:not(:disabled) {
                    background-color: #3a52a8 !important;
                    transform: translateY(-2px);
                }
                
                .join-button:disabled, .create-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.9rem;
                }
                
                .divider::before,
                .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .divider::before {
                    margin-right: 12px;
                }
                
                .divider::after {
                    margin-left: 12px;
                }
                
                .card-footer {
                    background-color: rgba(77, 103, 195, 0.05);
                    border-top: 1px solid rgba(77, 103, 195, 0.2);
                    padding: 16px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                }
                
                .card-footer p {
                    margin: 0;
                }
                
                @media (max-width: 576px) {
                    .main-content {
                        max-width: 100%;
                    }
                    
                    .card-header {
                        padding: 16px;
                    }
                    
                    .app-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;