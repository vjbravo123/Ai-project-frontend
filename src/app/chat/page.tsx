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
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  PanelLeftOpen,
  X,
  Hexagon,
} from 'lucide-react';

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { conversations, currentMessages, activeConversationId, sendingMessage } = useAppSelector(
    (state) => state.chat
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [inputMessage, setInputMessage] = useState('');
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
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

    const text = inputMessage.trim();
    setInputMessage('');
    dispatch(appendOptimisticUserMessage(text));
    await dispatch(sendMessage({ message: text, conversationId: activeConversationId }));
    dispatch(fetchConversations());
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#F1F5F9] overflow-hidden relative">
      {/* Mobile History Backdrop */}
      {showHistoryMobile && (
        <div
          onClick={() => setShowHistoryMobile(false)}
          className="fixed inset-0 bg-slate-900/40 z-20 md:hidden"
        />
      )}

      {/* Conversations Sidebar */}
      <aside
        className={`w-64 sm:w-72 border-r border-slate-200 bg-white flex flex-col z-20 transition-all duration-200 md:relative fixed inset-y-0 left-0 ${
          showHistoryMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-3 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Threads</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                dispatch(startNewConversation());
                setShowHistoryMobile(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
            <button
              onClick={() => setShowHistoryMobile(false)}
              className="p-1 text-slate-400 hover:text-slate-700 md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.isLoading && conversations.data.length === 0 ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          ) : conversations.data.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No threads yet. Click "New" to start.
            </div>
          ) : (
            conversations.data.map((c) => {
              const cid = c._id || c.id || '';
              const isActive = activeConversationId === cid;
              return (
                <div
                  key={cid}
                  onClick={() => {
                    dispatch(fetchConversationById(cid));
                    setShowHistoryMobile(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer group transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-300'}`} />
                    <span className="truncate">{c.title || `Thread ${cid.substring(0, 6)}`}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(deleteConversation(cid));
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 text-slate-300 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9]">
        {/* Mobile toggle */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
          <button
            onClick={() => setShowHistoryMobile(true)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span>Threads</span>
          </button>
          <button
            onClick={() => dispatch(startNewConversation())}
            className="text-xs font-semibold text-blue-600 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3">
          {currentMessages.data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-3 p-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Start a Conversation</h3>
              <p className="text-xs text-slate-500">
                Type below to begin. All dialogue history is preserved per thread.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                {['What is LangChain?', 'Design a REST API', 'Explain RAG architecture', 'Write a unit test'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInputMessage(hint)}
                    className="text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm text-xs text-slate-700 transition-all"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentMessages.data.map((msg, idx) => {
              const isUser = msg.role === 'user' || msg.role === 'human';
              return (
                <div
                  key={idx}
                  className={`flex gap-2 max-w-2xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <Hexagon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm whitespace-pre-wrap shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}

          {sendingMessage && (
            <div className="flex gap-2 max-w-2xl mr-auto">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                <Hexagon className="w-3.5 h-3.5" />
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs text-slate-500 shadow-sm">
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
            <button
              type="submit"
              disabled={sendingMessage || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}