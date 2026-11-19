import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, AlertCircle, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import { SUGGESTED_PROMPTS } from '../../data/mockData';
import { Button } from '../../components/ui';
import type { ChatMessage } from '../../types';
import {
  getAIStatus,
  sendChatMessage,
  AIServiceError,
  type AIStatusResponse,
} from '../../services/aiApi';

// ─── Message bubble (Golden Hour Edition) ─────────────────────────────────────

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser
            ? 'bg-[#1C1917] text-white'
            : 'bg-amber-100 text-amber-900 border border-amber-200'
        }`}
      >
        {isUser ? 'U' : <Sparkles size={13} className="text-amber-700" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#1C1917] text-white rounded-tr-xs shadow-sm'
            : 'bg-white border border-[#E7DFD5] text-[#1C1917] rounded-tl-xs shadow-sm'
        }`}
      >
        {message.content}
        <div
          className={`text-[10px] mt-1.5 flex items-center justify-between gap-2 ${
            isUser ? 'text-stone-300 text-right' : 'text-stone-400'
          }`}
        >
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && message.durationMs !== undefined && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full"
              title={`Response time: ${message.durationMs}ms`}
            >
              {message.durationMs >= 1000 ? `${(message.durationMs / 1000).toFixed(1)}s` : `${message.durationMs}ms`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── AI page ──────────────────────────────────────────────────────────────────

const INITIAL_WELCOME: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    "Hi! I'm your AI resume assistant, powered by Google Gemini on Google Cloud Platform. I can help you improve your resume, tailor it for cloud roles, write compelling accomplishment bullets (XYZ formula), or craft an executive summary. What would you like to work on?",
  timestamp: new Date().toISOString(),
};

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getAIStatus()
      .then((status) => setAiStatus(status))
      .catch((err) => {
        console.warn('Failed to query AI service status:', err);
        setAiStatus({
          available: false,
          model: 'gemini-3.5-flash-lite',
          message: 'Unable to reach backend AI service.',
        });
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome-msg')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendChatMessage({
        message: trimmed,
        history,
      });

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
        durationMs: res.clientDurationMs || res.responseTimeMs,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      let errorText =
        'An error occurred while communicating with Google Gemini.';
      if (err instanceof AIServiceError) {
        if (err.status === 503) {
          errorText =
            'Gemini AI is not configured. Please set GEMINI_API_KEY in your backend .env file to enable live responses.';
        } else {
          errorText = `AI Error (${err.status}): ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorText = `Error: ${err.message}`;
      }

      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: errorText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_WELCOME]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[#E7DFD5] mb-2">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <button
              aria-label="Back to dashboard"
              className="p-1.5 text-stone-500 hover:text-[#1C1917] hover:bg-[#FAF7F2] rounded-full border border-[#E7DFD5] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div className="w-9 h-9 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-700">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1C1917] font-serif">
              AI Resume Assistant
            </h1>
            <p className="text-xs text-stone-500">
              Powered by Google Gemini ({aiStatus?.model || 'gemini-3.5-flash-lite'})
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
          title="Clear chat"
          aria-label="Clear chat"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Status banner */}
      {(!aiStatus || !aiStatus.available) && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-xs text-amber-900 shadow-2xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-bold">AI not yet connected:</span>{' '}
            {aiStatus?.message || 'Gemini API key is not configured.'}{' '}
            Set <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-semibold">GEMINI_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-semibold">backend/.env</code> to activate live Gemini responses.
          </div>
        </div>
      )}

      {aiStatus && aiStatus.available && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-3 text-xs text-emerald-900">
          <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
          <span>Connected to Google Gemini ({aiStatus.model}). Ready to assist.</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <Sparkles size={13} className="text-amber-700" />
            </div>
            <div className="bg-white border border-[#E7DFD5] shadow-sm px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="py-3">
          <p className="text-xs text-stone-500 mb-2 font-semibold">
            Suggested prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3.5 py-1.5 bg-white border border-[#E7DFD5] text-stone-700 rounded-full hover:border-amber-400 hover:text-amber-950 hover:bg-[#FAF8F5] transition-all shadow-2xs font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#E7DFD5] pt-3">
        <div className="flex gap-2 items-end bg-white border border-[#E7DFD5] rounded-3xl px-4 py-2.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 shadow-sm transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder="Ask anything about your cloud resume, ATS keywords, or interview..."
            className="flex-1 text-xs sm:text-sm text-stone-900 placeholder-stone-400 resize-none outline-none bg-transparent max-h-32"
          />
          <Button
            size="sm"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="shrink-0"
            aria-label="Send message"
          >
            <Send size={13} />
          </Button>
        </div>
        <p className="text-[10px] text-stone-400 mt-1.5 text-center font-mono">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIAssistantPage;
