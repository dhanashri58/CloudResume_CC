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
import { listResumes, getResume } from '../../services/resumesApi';

// ─── Message bubble ───────────────────────────────────────────────────────────

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
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-600'
        }`}
      >
        {isUser ? 'U' : <Sparkles size={13} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
        }`}
      >
        {message.content}
        <div
          className={`text-[10px] mt-1 flex items-center justify-between gap-2 ${
            isUser ? 'text-blue-200 text-right' : 'text-slate-400'
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
              className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"
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
    "Hi! I'm your AI resume assistant, powered by Google Gemini. I can help you improve your resume, tailor it for specific roles, write compelling bullet points, or craft a professional summary. What would you like to work on?",
  timestamp: new Date().toISOString(),
};

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [resumeContext, setResumeContext] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check backend AI status on mount
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

    // Attempt to load current user resume context
    listResumes()
      .then(async (resumes) => {
        if (resumes.length > 0) {
          const detailed = await getResume(resumes[0].id);
          const allSkills = (detailed.skills || []).flatMap((s) => s.skills || []).join(', ');
          const ctx = `Title: ${detailed.title}\nRole: ${detailed.targetRole || 'Not specified'}\nSummary: ${detailed.summary}\nSkills: ${allSkills}`;
          setResumeContext(ctx);
        }
      })
      .catch(() => {
        // Resume context is optional; ignore if user has no resumes yet
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userText = text.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      // Map previous history for Gemini (keep only most recent 6 messages, excluding current)
      const formattedHistory = messages
        .filter((m) => m.id !== 'welcome-msg' && !m.id.endsWith('-err'))
        .slice(-6)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content.length > 500 ? `${m.content.slice(0, 497)}...` : m.content,
        }));

      const res = await sendChatMessage({
        message: userText,
        history: formattedHistory,
        resumeContext: resumeContext || undefined,
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-slate-200 mb-2">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <button
              aria-label="Back to dashboard"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              AI Resume Assistant
            </h1>
            <p className="text-xs text-slate-500">
              Powered by Google Gemini ({aiStatus?.model || 'gemini-3.5-flash-lite'})
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear chat"
          aria-label="Clear chat"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Status banner */}
      {(!aiStatus || !aiStatus.available) && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-800">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-semibold">AI not yet connected / configured:</span>{' '}
            {aiStatus?.message || 'Gemini API key is not configured.'}{' '}
            Set <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">GEMINI_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">backend/.env</code> to activate live Gemini responses.
          </div>
        </div>
      )}

      {aiStatus && aiStatus.available && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg mb-3 text-xs text-emerald-800">
          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
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
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
              <Sparkles size={13} className="text-slate-500" />
            </div>
            <div className="bg-white border border-slate-200 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
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
          <p className="text-xs text-slate-500 mb-2 font-medium">
            Suggested prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 pt-3">
        <div className="flex gap-2 items-end bg-white border border-slate-300 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder="Ask anything about your resume or cloud career…"
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 resize-none outline-none bg-transparent max-h-32"
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
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIAssistantPage;
