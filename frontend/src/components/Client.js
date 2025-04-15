import React from 'react';
import Avatar from 'react-avatar';

const Client = (props) => {
    return (
        <div className="client-container">
            <div className="client-avatar">
                <Avatar 
                    name={props.username} 
                    size={50} 
                    round="10px"
                    textSizeRatio={2.5}
                    colors={['#4d67c3', '#6a84e0', '#8fa3f0', '#3a52a8', '#2c4090']}
                />
            </div>
            <div className="client-details">
                <span className="client-username">{props.username}</span>
                <span className="client-status">Online</span>
            </div>
            
            <style jsx>{`
                .client-container {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-radius: 12px;
                    background-color: white;
                    margin-bottom: 10px;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f0f0f0;
                }
                
                .client-container:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border-color: #e6e6e6;
                }
                
                .client-avatar {
                    position: relative;
                }
                
                .client-avatar::after {
                    content: '';
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background-color: #4caf50;
                    border-radius: 50%;
                    border: 2px solid white;
                    bottom: 0;
                    right: 0;
                }
                
                .client-details {
                    margin-left: 14px;
                    display: flex;
                    flex-direction: column;
                }
                
                .client-username {
                    font-weight: 600;
                    font-size: 1rem;
                    color: #333;
                    margin-bottom: 2px;
                }
                
                .client-status {
                    font-size: 0.8rem;
                    color: #4caf50;
                    font-weight: 500;
                }
                
                @media (max-width: 576px) {
                    .client-container {
                        padding: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Client;