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
  BrainCircuit,
  Mic,
  Square,
  UploadCloud,
  FileText,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  RotateCcw,
  BookOpen,
  Volume2,
} from 'lucide-react';

export default function RevisionPage() {
  const dispatch = useAppDispatch();
  const {
    topics,
    dueTopics,
    isLoadingTopics,
    isLoadingDueTopics,
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
      
      // Determine best supported mime type
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
          ? 'Microphone access was denied. Please allow microphone permissions or upload an audio file.'
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
      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  // Submit Spoken Audio Session
  const handleSubmitAudio = async () => {
    if (!audioBlob) return;
    await dispatch(logStudyAudio(audioBlob));
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

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for relative date
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

  // Understanding score helper
  const getScoreBadge = (score: number) => {
    const colors: Record<number, string> = {
      0: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      1: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      2: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      3: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      4: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      5: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
    const labels: Record<number, string> = {
      0: 'Recall Blank (0/5)',
      1: 'Weak (1/5)',
      2: 'Fragmented (2/5)',
      3: 'Good (3/5)',
      4: 'Strong (4/5)',
      5: 'Mastered (5/5)',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
          colors[score] || colors[3]
        }`}
      >
        {labels[score] || `Score: ${score}/5`}
      </span>
    );
  };

  const displayedTopics = activeTab === 'due' ? dueTopics : topics;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spaced-Repetition System (SM-2 Algorithm)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-cyan-400" />
            <span>Revision Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Speak or write what you just studied. Gemini transcribes, extracts key concepts, scores your understanding, and schedules optimal spaced-repetition intervals.
          </p>
        </div>

        {/* Due topics badge count */}
        {dueTopics.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-amber-300">
                {dueTopics.length} {dueTopics.length === 1 ? 'Topic' : 'Topics'} Due for Revision!
              </p>
              <button
                onClick={() => setActiveTab('due')}
                className="text-[11px] text-amber-400 hover:underline font-medium mt-0.5"
              >
                View due topics →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification banner */}
      {successNotification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={() => dispatch(clearRevisionNotifications())}
            className="text-emerald-500 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearRevisionNotifications())}
            className="text-rose-500 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Study Session Logger Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0e1628] to-[#090e1a] shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Log What You Just Studied</h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setLogMode('audio')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium ${
                logMode === 'audio'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Note</span>
            </button>
            <button
              onClick={() => setLogMode('text')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium ${
                logMode === 'text'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Typed Notes</span>
            </button>
          </div>
        </div>

        {/* 1. Voice Audio Mode */}
        {logMode === 'audio' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-900/40 text-center space-y-4">
              {/* Mic / Wave Animation */}
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLogging}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                    isRecording
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 scale-110'
                      : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/30'
                  }`}
                  title={isRecording ? 'Click to stop recording' : 'Click to start speaking'}
                >
                  {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
              </div>

              {/* Status & Timer */}
              <div>
                {isRecording ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-rose-400 animate-pulse">
                      Recording Spoken Explanation...
                    </p>
                    <p className="text-2xl font-mono font-bold text-white">
                      {formatTime(recordingDuration)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Explain the topic in your own words. Click the square when finished.
                    </p>
                  </div>
                ) : audioBlob ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-400">
                      Audio Recording Ready! ({formatTime(recordingDuration)})
                    </p>
                    {audioUrl && (
                      <audio controls src={audioUrl} className="mx-auto mt-2 h-10 w-64 sm:w-80" />
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      Click the microphone to speak about what you studied
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Gemini transcribes and extracts key points directly from your audio in one step.
                    </p>
                  </div>
                )}
              </div>

              {/* Audio Actions */}
              {audioBlob && !isRecording && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleSubmitAudio}
                    disabled={isLogging}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLogging ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze & Schedule Revision</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                      setRecordingDuration(0);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm"
                  >
                    Discard
                  </button>
                </div>
              )}

              {/* Upload alternative */}
              {!isRecording && !audioBlob && (
                <div className="pt-2">
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
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5 mx-auto"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Or upload a recorded audio file (webm, wav, mp3 up to 15MB)</span>
                  </button>
                </div>
              )}

              {recordingError && (
                <p className="text-xs text-rose-400 mt-2">{recordingError}</p>
              )}
            </div>
          </div>
        )}

        {/* 2. Typed Text Mode */}
        {logMode === 'text' && (
          <form onSubmit={handleSubmitText} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                What did you study? (Explain concepts, definitions, or insights)
              </label>
              <textarea
                rows={5}
                required
                value={typedNotes}
                onChange={(e) => setTypedNotes(e.target.value)}
                placeholder="Today I learned that mitochondria are the powerhouse of the cell. They generate ATP through cellular respiration and have their own circular DNA..."
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Quick prompts:</span>
              <button
                type="button"
                onClick={() =>
                  setTypedNotes(
                    'Today I learned about React useMemo and useCallback hooks. useMemo caches the result of a calculation between re-renders, while useCallback caches a function definition.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
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
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
              >
                SM-2 Algorithm
              </button>
            </div>

            <button
              type="submit"
              disabled={isLogging || !typedNotes.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isLogging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Schedule Spaced Repetition</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Topics List Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Tracked Revision Topics</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
            {topics.length} Total
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Topics ({topics.length})
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
              activeTab === 'due'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Due Now</span>
            {dueTopics.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                {dueTopics.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      {isLoadingTopics && topics.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading revision topics...</p>
        </div>
      ) : displayedTopics.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800/80 bg-slate-900/30 text-center space-y-3">
          <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">
            {activeTab === 'due'
              ? 'No topics currently due for revision!'
              : 'No study topics logged yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'due'
              ? 'You are all caught up! Great job maintaining your spaced repetition intervals.'
              : 'Speak or write about any topic above to kick off automatic spaced repetition.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedTopics.map((topic) => {
            const dueInfo = formatDueDate(topic.nextRevisionAt);
            const isExpanded = expandedTopicId === topic._id;
            const isReviewModalOpen = activeTopicIdForReview === topic._id;
            const latestHistory = topic.history?.[topic.history.length - 1];

            return (
              <div
                key={topic._id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  dueInfo.isDue
                    ? 'border-amber-500/40 bg-gradient-to-b from-[#181512] to-[#0c101d] shadow-amber-500/5'
                    : 'border-slate-800 bg-[#0c1222] hover:border-cyan-500/30 shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Title & Due Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white hover:text-cyan-300 transition-colors">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`flex items-center gap-1 text-[11px] font-medium ${
                            dueInfo.isDue ? 'text-amber-400 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{dueInfo.text}</span>
                        </div>
                      </div>
                    </div>

                    {/* Understanding score badge */}
                    {latestHistory && getScoreBadge(latestHistory.understandingScore)}
                  </div>

                  {/* Latest Summary */}
                  {topic.latestSummary && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      {topic.latestSummary}
                    </p>
                  )}

                  {/* Key Points */}
                  {latestHistory?.keyPoints && latestHistory.keyPoints.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                        Key Concepts Identified
                      </p>
                      <ul className="space-y-1">
                        {latestHistory.keyPoints.map((pt, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-400 flex items-start gap-1.5"
                          >
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* SM-2 Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400">
                      <span className="block text-slate-500 text-[10px]">Repetitions</span>
                      <span className="text-white font-bold">{topic.repetitions}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400">
                      <span className="block text-slate-500 text-[10px]">Interval</span>
                      <span className="text-cyan-300 font-bold">{topic.intervalDays}d</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400">
                      <span className="block text-slate-500 text-[10px]">Ease Factor</span>
                      <span className="text-indigo-300 font-bold">{topic.easeFactor.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Expanded History Entries */}
                  {isExpanded && topic.history && topic.history.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <p className="text-[11px] font-mono text-slate-400 uppercase">
                        Study Session History ({topic.history.length})
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {topic.history.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1"
                          >
                            <div className="flex justify-between text-slate-500">
                              <span>
                                {new Date(h.studiedAt).toLocaleDateString()}{' '}
                                {new Date(h.studiedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="text-cyan-400">Score: {h.understandingScore}/5</span>
                            </div>
                            <p className="text-slate-300 italic truncate">"{h.transcript}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-2">
                  {/* Active Review Quality Score Selector */}
                  {isReviewModalOpen ? (
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">How well did you recall this?</span>
                        <button
                          onClick={() => dispatch(setActiveTopicForReview(null))}
                          className="text-slate-500 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-1 text-center text-xs">
                        {[
                          { q: 0, label: '0: Blank', color: 'hover:bg-rose-500/30' },
                          { q: 1, label: '1: Wrong', color: 'hover:bg-rose-500/20' },
                          { q: 2, label: '2: Hard', color: 'hover:bg-amber-500/20' },
                          { q: 3, label: '3: Good', color: 'hover:bg-sky-500/20' },
                          { q: 4, label: '4: Easy', color: 'hover:bg-cyan-500/20' },
                          { q: 5, label: '5: Perfect', color: 'hover:bg-emerald-500/20' },
                        ].map((btn) => (
                          <button
                            key={btn.q}
                            disabled={isReviewing}
                            onClick={() => handleReviewScore(topic._id, btn.q)}
                            className={`p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-[10px] font-medium transition-colors ${btn.color}`}
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
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          dueInfo.isDue
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110'
                            : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{dueInfo.isDue ? 'Review Now' : 'Self Quiz / Review'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {topic.history && topic.history.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedTopicId(isExpanded ? null : topic._id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
