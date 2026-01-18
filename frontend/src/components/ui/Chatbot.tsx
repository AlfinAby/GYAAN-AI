// Chatbot Component - GYAAN AI Assistant
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Chatbot.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatbotProps {
    context?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Chatbot = ({ context = 'general learning' }: ChatbotProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm GYAAN, your learning helper. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(['Help with reading', 'Help with math', "I'm stuck"]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chat/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    context,
                    history: messages.slice(-6)
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                setSuggestions(data.suggestions || []);
            } else {
                throw new Error('API error');
            }
        } catch (error) {
            // Fallback response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm here to help! Try asking me about your reading or math challenge."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestion = (suggestion: string) => {
        sendMessage(suggestion);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                className="chat-toggle"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? '✕' : '💬'}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-avatar">ᚷ</div>
                            <div className="chat-info">
                                <h3>GYAAN Assistant</h3>
                                <span className="status online">Online</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    className={`message ${msg.role}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {msg.role === 'assistant' && <span className="msg-avatar">ᚷ</span>}
                                    <div className="msg-bubble">{msg.content}</div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="message assistant">
                                    <span className="msg-avatar">ᚷ</span>
                                    <div className="msg-bubble typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="chat-suggestions">
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        className="suggestion-btn"
                                        onClick={() => handleSuggestion(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="chat-input">
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                                disabled={isLoading}
                            />
                            <button
                                className="send-btn"
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || isLoading}
                            >
                                ➤
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
