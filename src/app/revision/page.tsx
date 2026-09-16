'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchRevisionTopics,
  fetchDueRevisionTopics,
  logStudyAudio,
  logStudyText,
  reviewTopic,
  deleteTopic,
  setActiveTopicForReview,
  clearRevisionNotifications,
} from '@/store/features/revision-slice';
import {
  BookOpen,
  Mic,
  Square,
  UploadCloud,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Award,
  RotateCcw,
} from 'lucide-react';

export default function RevisionPage() {
  const dispatch = useAppDispatch();
  const {
    topics,
    dueTopics,
    isLoadingTopics,
    isLogging,
    isReviewing,
    error,
    successNotification,
    activeTopicIdForReview,
  } = useAppSelector((state) => state.revision);

  // Form & view state
  const [logMode, setLogMode] = useState<'audio' | 'text'>('audio');
  const [typedNotes, setTypedNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'due'>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch topics on mount
  useEffect(() => {
    dispatch(fetchRevisionTopics());
    dispatch(fetchDueRevisionTopics());
  }, [dispatch]);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [audioUrl]);

  // Handle Recording Start
  const startRecording = async () => {
    setRecordingError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
        'audio/wav',
      ];
      const supportedType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setRecordingError(
        err.name === 'NotAllowedError'
          ? 'Microphone access was denied. Please check permissions or upload an audio file.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
    }
  };

  // Handle Recording Stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Handle File Upload Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  // Submit Spoken Audio Session
  const handleSubmitAudio = async () => {
    if (!audioBlob) return;
    await dispatch(logStudyAudio(audioBlob));
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    dispatch(fetchDueRevisionTopics());
  };

  // Submit Text Session
  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedNotes.trim()) return;
    await dispatch(logStudyText(typedNotes.trim()));
    setTypedNotes('');
    dispatch(fetchDueRevisionTopics());
  };

  // Submit Review Score
  const handleReviewScore = async (topicId: string, quality: number) => {
    await dispatch(reviewTopic({ topicId, quality }));
    dispatch(fetchDueRevisionTopics());
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDueDate = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs <= 0) {
      return { text: 'Due for revision now', isDue: true };
    } else if (diffDays === 0) {
      return { text: 'Due later today', isDue: true };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', isDue: false };
    } else {
      return { text: `Due in ${diffDays} days`, isDue: false };
    }
  };

  const getScoreBadge = (score: number) => {
    const badges: Record<number, { bg: string; text: string; label: string }> = {
      0: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Blank (0/5)' },
      1: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Weak (1/5)' },
      2: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Hard (2/5)' },
      3: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Good (3/5)' },
      4: { bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700', label: 'Strong (4/5)' },
      5: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Mastered (5/5)' },
    };
    const b = badges[score] || badges[3];
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  const displayedTopics = activeTab === 'due' ? dueTopics : topics;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#2563EB] mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Spaced-Repetition Knowledge Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Revision Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl">
            Log study sessions via spoken audio or typed notes. The platform extracts core principles and calculates automated SM-2 review intervals.
          </p>
        </div>

        {dueTopics.length > 0 && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3 self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-900">
                {dueTopics.length} {dueTopics.length === 1 ? 'Topic' : 'Topics'} Due for Review
              </p>
              <button
                onClick={() => setActiveTab('due')}
                className="text-[11px] text-amber-700 hover:text-amber-900 hover:underline font-medium"
              >
                Review items now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification banner */}
      {successNotification && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={() => dispatch(clearRevisionNotifications())}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearRevisionNotifications())}
            className="text-rose-700 hover:text-rose-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Study Session Logger Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#0F172A]">Log Study Material</h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setLogMode('audio')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all font-medium ${
                logMode === 'audio'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Dictation</span>
            </button>
            <button
              onClick={() => setLogMode('text')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all font-medium ${
                logMode === 'text'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Typed Notes</span>
            </button>
          </div>
        </div>

        {/* 1. Voice Audio Mode */}
        {logMode === 'audio' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-center space-y-3">
              <div className="relative">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLogging}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                  }`}
                  title={isRecording ? 'Click to stop recording' : 'Click to start speaking'}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>

              {/* Status & Timer */}
              <div>
                {isRecording ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-rose-600">
                      Recording Spoken Explanation...
                    </p>
                    <p className="text-xl font-mono font-bold text-[#0F172A]">
                      {formatTime(recordingDuration)}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Explain key concepts clearly. Click the square icon to finish.
                    </p>
                  </div>
                ) : audioBlob ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-emerald-700">
                      Audio Recording Ready ({formatTime(recordingDuration)})
                    </p>
                    {audioUrl && (
                      <audio controls src={audioUrl} className="mx-auto mt-1 h-9 w-64 sm:w-80" />
                    )}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[#0F172A]">
                      Click microphone to dictate what you studied
                    </p>
                    <p className="text-[11px] text-[#64748B] max-w-sm mx-auto">
                      Voice notes are transcribed and analyzed to create flashcards and scheduling intervals.
                    </p>
                  </div>
                )}
              </div>

              {/* Audio Actions */}
              {audioBlob && !isRecording && (
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={handleSubmitAudio}
                    disabled={isLogging}
                    className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isLogging ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing with Model...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submit & Schedule Interval</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                      setRecordingDuration(0);
                    }}
                    className="px-3 py-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] text-xs font-medium transition-colors"
                  >
                    Discard
                  </button>
                </div>
              )}

              {/* Upload alternative */}
              {!isRecording && !audioBlob && (
                <div className="pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="audio/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#2563EB] hover:underline flex items-center gap-1.5 mx-auto font-medium"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload pre-recorded audio (webm, wav, mp3 up to 15MB)</span>
                  </button>
                </div>
              )}

              {recordingError && (
                <p className="text-xs text-rose-600 mt-1">{recordingError}</p>
              )}
            </div>
          </div>
        )}

        {/* 2. Typed Text Mode */}
        {logMode === 'text' && (
          <form onSubmit={handleSubmitText} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Topic Notes & Explanations
              </label>
              <textarea
                rows={4}
                required
                value={typedNotes}
                onChange={(e) => setTypedNotes(e.target.value)}
                placeholder="Explain the concepts, definitions, and technical insights you studied today..."
                className="w-full p-3 rounded-lg bg-white border border-[#E2E8F0] text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-colors"
              />
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#64748B]">Examples:</span>
              <button
                type="button"
                onClick={() =>
                  setTypedNotes(
                    'Today I learned about React useMemo and useCallback hooks. useMemo caches calculation results between re-renders, while useCallback caches a function definition.'
                  )
                }
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 transition-colors text-[11px]"
              >
                React Hooks
              </button>
              <button
                type="button"
                onClick={() =>
                  setTypedNotes(
                    'Today I studied the SuperMemo SM-2 spaced repetition algorithm. It calculates repetitions, interval in days, and an ease factor from 1.3 to 2.5 based on recall quality.'
                  )
                }
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 transition-colors text-[11px]"
              >
                SM-2 Algorithm
              </button>
            </div>

            <button
              type="submit"
              disabled={isLogging || !typedNotes.trim()}
              className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              {isLogging ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Notes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Analyze & Save to Deck</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Topics List Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-[#0F172A]">Tracked Knowledge Topics</h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-[#64748B] border border-slate-200">
            {topics.length} Total
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-[#E2E8F0] text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeTab === 'all'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Topics ({topics.length})
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'due'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>Due Now</span>
            {dueTopics.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {dueTopics.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      {isLoadingTopics && topics.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
          <p className="text-xs text-[#64748B]">Loading tracked topics...</p>
        </div>
      ) : displayedTopics.length === 0 ? (
        <div className="p-12 rounded-lg border border-[#E2E8F0] bg-white text-center space-y-2 shadow-sm">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-[#0F172A]">
            {activeTab === 'due'
              ? 'No topics currently due for review'
              : 'No study topics logged yet'}
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            {activeTab === 'due'
              ? 'All items are currently within their retention threshold.'
              : 'Dictate or type your first study session above to initialize automated SM-2 spaced repetition.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTopics.map((topic) => {
            const dueInfo = formatDueDate(topic.nextRevisionAt);
            const isExpanded = expandedTopicId === topic._id;
            const isReviewModalOpen = activeTopicIdForReview === topic._id;
            const latestHistory = topic.history?.[topic.history.length - 1];

            return (
              <div
                key={topic._id}
                className={`p-5 rounded-lg border transition-all flex flex-col justify-between space-y-4 shadow-sm bg-white ${
                  dueInfo.isDue
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Title & Due Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span
                          className={`text-xs font-medium ${
                            dueInfo.isDue ? 'text-amber-700 font-semibold' : 'text-[#64748B]'
                          }`}
                        >
                          {dueInfo.text}
                        </span>
                      </div>
                    </div>

                    {latestHistory && getScoreBadge(latestHistory.understandingScore)}
                  </div>

                  {/* Latest Summary */}
                  {topic.latestSummary && (
                    <p className="text-xs text-slate-700 leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                      {topic.latestSummary}
                    </p>
                  )}

                  {/* Key Points */}
                  {latestHistory?.keyPoints && latestHistory.keyPoints.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                        Key Points
                      </p>
                      <ul className="space-y-1">
                        {latestHistory.keyPoints.map((pt, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-600 flex items-start gap-1.5"
                          >
                            <span className="text-[#2563EB] mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* SM-2 Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-[#E2E8F0]">
                      <span className="block text-[#64748B] text-[10px]">Repetitions</span>
                      <span className="text-xs font-bold text-[#0F172A]">{topic.repetitions}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-[#E2E8F0]">
                      <span className="block text-[#64748B] text-[10px]">Interval</span>
                      <span className="text-xs font-bold text-[#2563EB]">{topic.intervalDays}d</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-[#E2E8F0]">
                      <span className="block text-[#64748B] text-[10px]">Ease Factor</span>
                      <span className="text-xs font-bold text-[#0F172A]">{topic.easeFactor.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Expanded History Entries */}
                  {isExpanded && topic.history && topic.history.length > 0 && (
                    <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase">
                        Session History ({topic.history.length})
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {topic.history.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] space-y-1"
                          >
                            <div className="flex justify-between text-[#64748B]">
                              <span>
                                {new Date(h.studiedAt).toLocaleDateString()}{' '}
                                {new Date(h.studiedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="text-[#2563EB] font-medium">Score: {h.understandingScore}/5</span>
                            </div>
                            <p className="text-slate-700 italic truncate">"{h.transcript}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-2">
                  {isReviewModalOpen ? (
                    <div className="p-3 rounded-lg bg-slate-50 border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0F172A]">Recall Evaluation (Quality 0-5)</span>
                        <button
                          onClick={() => dispatch(setActiveTopicForReview(null))}
                          className="text-[#64748B] hover:text-[#0F172A]"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-1 text-center">
                        {[
                          { q: 0, label: '0: Blank' },
                          { q: 1, label: '1: Wrong' },
                          { q: 2, label: '2: Hard' },
                          { q: 3, label: '3: Good' },
                          { q: 4, label: '4: Easy' },
                          { q: 5, label: '5: Perfect' },
                        ].map((btn) => (
                          <button
                            key={btn.q}
                            disabled={isReviewing}
                            onClick={() => handleReviewScore(topic._id, btn.q)}
                            className="p-1.5 rounded bg-white hover:bg-blue-50 text-[#0F172A] border border-[#E2E8F0] hover:border-blue-300 text-[10px] font-medium transition-colors"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => dispatch(setActiveTopicForReview(topic._id))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          dueInfo.isDue
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-[#2563EB] border border-blue-200'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{dueInfo.isDue ? 'Review Now' : 'Self Quiz'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {topic.history && topic.history.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedTopicId(isExpanded ? null : topic._id)
                            }
                            className="px-2 py-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 text-xs flex items-center gap-1 transition-colors"
                            title="Toggle history"
                          >
                            <span>History</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => dispatch(deleteTopic(topic._id))}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
