'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchConversations,
  fetchConversationById,
  sendMessage,
  startNewConversation,
  deleteConversation,
  appendOptimisticUserMessage,
} from '@/store/features/chat-slice';
import { setAuthModalOpen } from '@/store/features/auth-slice';
import { Bot, Send, Plus, Trash2, MessageSquare, Loader2, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { conversations, currentMessages, activeConversationId, sendingMessage } = useAppSelector((state) => state.chat);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.data, sendingMessage]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!isAuthenticated) {
      dispatch(setAuthModalOpen(true));
      return;
    }

    const text = inputMessage;
    setInputMessage('');
    dispatch(appendOptimisticUserMessage(text));
    await dispatch(sendMessage({ message: text, conversationId: activeConversationId }));
    dispatch(fetchConversations());
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#070b14] overflow-hidden">
      {/* Conversations Sidebar */}
      <aside className="w-80 border-r border-slate-800 bg-[#090e1c] flex flex-col">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Conversations</h2>
          <button
            onClick={() => dispatch(startNewConversation())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {conversations.isLoading && conversations.data.length === 0 ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
          ) : conversations.data.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No conversations found. Start a new one!
            </div>
          ) : (
            conversations.data.map((c) => {
              const cid = c.id || c._id || '';
              const isActive = activeConversationId === cid;
              return (
                <div
                  key={cid}
                  onClick={() => dispatch(fetchConversationById(cid))}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer group transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <span className="truncate">{c.title || `Chat ${cid.substring(0, 8)}`}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(deleteConversation(cid));
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-[#070b14] to-[#0a101f]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">How can Gemini assist you today?</h3>
              <p className="text-xs text-slate-400">
                Type your prompt below to start a conversational turn. All chat history will be preserved per conversation ID.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full pt-4">
                {['What is LangChain?', 'Draft an async NestJS controller', 'Explain RAG architecture', 'Write unit test for Redux slice'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInputMessage(hint)}
                    className="text-left p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-all"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentMessages.data.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {sendingMessage && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090e1c]">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. 'What is LangChain?' or 'Can you give me an example?')..."
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={sendingMessage || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}