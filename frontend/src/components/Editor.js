import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import axios from 'axios';
import Button from 'react-bootstrap/esm/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaPlay, FaSave, FaCode } from 'react-icons/fa';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [runcode, setRuncode] = useState('');
    const [result, setResult] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState('python');
    const [extension, setExtension] = useState('py');
    const [theme, setTheme] = useState('dracula');

    // Compiling code
    const run = () => {
        setIsRunning(true);
        setResult('Running...');
        
        axios
            .post(`http://localhost:5000/${language}`, { runcode })
            .then(({ data }) => {
                setResult(data);
                setIsRunning(false);
            })
            .catch(error => {
                setResult(`Error: ${error.message}`);
                setIsRunning(false);
            });
    };

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: theme,
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    lineWrapping: true,
                    tabSize: 2,
                    indentWithTabs: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                setRuncode(code);

                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
            
            // Set editor size
            editorRef.current.setSize('100%', '70vh');
        }
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    // Setting language and extension for various code languages
    const python = () => {
        setLanguage('python');
        setExtension('py');
    };
    const node = () => {
        setLanguage('node');
        setExtension('js');
    };
    const c = () => {
        setLanguage('c');
        setExtension('c');
    };
    const cpp = () => {
        setLanguage('cpp');
        setExtension('cpp');
    };
    const java = () => {
        setLanguage('java');
        setExtension('java');
    };

    // Download code file
    const downloadTxtFile = () => {
        const element = document.createElement("a");
        const file = new Blob([`${runcode}`], {
            type: "text/plain"
        });

        element.href = URL.createObjectURL(file);
        element.download = `Code-Collab.${extension}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Get appropriate icon for language
    const getLanguageIcon = () => {
        return <FaCode />;
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <div className="editor-title">
                    <div className="language-badge">{language}</div>
                    <span>codeSync</span>
                </div>
                <div className="editor-actions">
                    <Dropdown>
                        <Dropdown.Toggle className="language-dropdown" id="language-dropdown">
                            {getLanguageIcon()} <span>{language}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={node}>javascript</Dropdown.Item>
                            <Dropdown.Item onClick={python}>python</Dropdown.Item>
                            <Dropdown.Item onClick={c}>c</Dropdown.Item>
                            <Dropdown.Item onClick={cpp}>cpp</Dropdown.Item>
                            <Dropdown.Item onClick={java}>java</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    
                    <Button 
                        className="save-button" 
                        onClick={downloadTxtFile} 
                        title="Save code">
                        <FaSave /> <span>Save</span>
                    </Button>
                    
                    <Button 
                        className={`run-button ${isRunning ? 'running' : ''}`}
                        onClick={run} 
                        disabled={isRunning}
                        title="Run code">
                        <FaPlay /> <span>Run</span>
                    </Button>
                </div>
            </div>
            
            <div className="editor-wrapper">
                <textarea id="realtimeEditor"></textarea>
            </div>
            
            <div className="output-container">
                <div className="output-header">
                    <h5>OUTPUT</h5>
                </div>
                <div className="output-content">
                    {result ? (
                        <pre>{result}</pre>
                    ) : (
                        <div className="empty-output">
                            <p>Run your code to see the output here</p>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .editor-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background-color: #282a36;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                
                .editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background-color: #1e1f29;
                    border-bottom: 1px solid #3c3f58;
                }
                
                .editor-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #f8f8f2;
                    font-family: 'Baloo Bhaijaan 2', cursive;
                    font-weight: 600;
                }
                
                .language-badge {
                    background-color: #4d67c3;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .editor-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .language-dropdown {
                    background-color: #4d67c3 !important;
                    border: none !important;
                    border-radius: 6px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding: 8px 14px !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                
                .language-dropdown:hover, .language-dropdown:focus {
                    background-color: #3a52a8 !important;
                    box-shadow: 0 0 0 0.2rem rgba(77, 103, 195, 0.3) !important;
                }
                
                .save-button {
                    background-color: #4d67c3 !important;
                    border: none !important;
                    border-radius: 6px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding: 8px 14px !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                
                .save-button:hover {
                    background-color: #3a52a8 !important;
                    transform: translateY(-1px) !important;
                }
                
                .run-button {
                    background-color: #ff5555 !important;
                    border: none !important;
                    border-radius: 6px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding: 8px 18px !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                
                .run-button:hover {
                    background-color: #e64949 !important;
                    transform: translateY(-1px) !important;
                }
                
                .run-button.running {
                    background-color: #bd4242 !important;
                    opacity: 0.8 !important;
                }
                
                .editor-wrapper {
                    flex: 1;
                    position: relative;
                }
                
                .editor-wrapper .CodeMirror {
                    height: 100% !important;
                    font-family: 'Source Code Pro', monospace !important;
                    font-size: 14px !important;
                }
                
                .output-container {
                    background-color: #1e1f29;
                    border-top: 1px solid #3c3f58;
                }
                
                .output-header {
                    padding: 10px 16px;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #3c3f58;
                }
                
                .output-header h5 {
                    margin: 0;
                    color: #f8f8f2;
                    font-family: 'Baloo Bhaijaan 2', cursive;
                    font-size: 1rem;
                    font-weight: 600;
                }
                
                .output-content {
                    padding: 10px 16px;
                    max-height: 200px;
                    overflow-y: auto;
                    color: #f8f8f2;
                    font-family: 'Source Code Pro', monospace;
                }
                
                .output-content pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                
                .empty-output {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 80px;
                    opacity: 0.5;
                }
                
                .empty-output p {
                    font-family: 'Baloo Bhaijaan 2', cursive;
                    font-style: italic;
                }
                
                @media (max-width: 768px) {
                    .editor-header {
                        flex-direction: column;
                        gap: 10px;
                        align-items: flex-start;
                    }
                    
                    .editor-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                    
                    .save-button span, .run-button span, .language-dropdown span {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default Editor;