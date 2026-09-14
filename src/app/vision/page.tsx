'use client';

import React, { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { describeImage, setImagePreview, setVisionInstruction, resetVisionState } from '@/store/features/vision-slice';
import { UploadCloud, Image as ImageIcon, Sparkles, Copy, Check, Loader2, RotateCcw } from 'lucide-react';

export default function VisionPage() {
  const dispatch = useAppDispatch();
  const { imagePreviewUrl, instruction, resultDescription, isLoading, error } = useAppSelector(
    (state) => state.vision
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      dispatch(setImagePreview(previewUrl));
    }
  };

  const handleRunVision = () => {
    if (!selectedFile) return;
    dispatch(describeImage({ file: selectedFile, instruction }));
  };

  const copyToClipboard = () => {
    if (!resultDescription) return;
    navigator.clipboard.writeText(resultDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-cyan-400" />
          <span>Multimodal Vision Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload any PNG, JPEG, WebP or HEIC image and query Google Gemini Vision models with custom prompt instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input & Upload Card */}
        <div className="space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[280px] ${
              imagePreviewUrl
                ? 'border-cyan-500/40 bg-slate-900/40'
                : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {imagePreviewUrl ? (
              <div className="relative group w-full flex justify-center">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="max-h-64 rounded-2xl object-contain shadow-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity text-xs text-white">
                  Click to replace image
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">Upload an image</h3>
                <p className="text-xs text-slate-500 mt-1">PNG, JPEG, WebP up to 8MB</p>
              </>
            )}
          </div>

          {/* Prompt Instruction */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Instruction / Prompt (Optional)
            </label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => dispatch(setVisionInstruction(e.target.value))}
              placeholder="e.g. Describe this for an alt-text tag"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRunVision}
              disabled={isLoading || !selectedFile}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-lg shadow-cyan-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Description</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                dispatch(resetVisionState());
              }}
              className="px-4 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {error}
            </div>
          )}
        </div>

        {/* Right: AI Result Display */}
        <div className="rounded-3xl border border-slate-800 bg-[#0c1222] p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Vision Inspection Result
              </span>
              {resultDescription && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Running multimodal inference...</p>
              </div>
            ) : resultDescription ? (
              <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                {resultDescription}
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500">
                Upload an image on the left and trigger the prompt to view the generated description here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}