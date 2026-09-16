'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { describeImage, setImagePreview, setVisionInstruction, resetVisionState } from '@/store/features/vision-slice';
import { UploadCloud, ScanEye, Copy, Check, Loader2, RotateCcw } from 'lucide-react';

export default function VisionPage() {
  const dispatch = useAppDispatch();
  const { imagePreviewUrl, instruction, resultDescription, isLoading, error } = useAppSelector(
    (state) => state.vision
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URL on unmount or replacement to avoid browser memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      dispatch(setImagePreview(previewUrl));
    }
  };

  const handleReset = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedFile(null);
    dispatch(resetVisionState());
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
    <div className="p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 sm:p-5 text-white">
        <p className="text-violet-200 text-xs font-medium mb-0.5">Multimodal Perception</p>
        <h1 className="text-lg font-bold tracking-tight">Image Analysis</h1>
        <p className="text-violet-100 text-xs mt-1">
          Upload images (PNG, JPEG, WebP) for semantic parsing, scene analysis, and metadata extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Upload */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Source File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px] ${
                imagePreviewUrl
                  ? 'border-violet-300 bg-violet-50/30'
                  : 'border-slate-300 hover:border-violet-400 bg-slate-50'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              {imagePreviewUrl ? (
                <div className="relative group w-full flex justify-center">
                  <img src={imagePreviewUrl} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity text-xs text-white font-medium">
                    Click to replace
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Choose file or drag & drop</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 8MB</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Analysis Prompt (Optional)</label>
            <input
              type="text"
              value={instruction}
              onChange={(e) => dispatch(setVisionInstruction(e.target.value))}
              placeholder="e.g. Generate descriptive alt-text for accessibility"
              className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRunVision}
              disabled={isLoading || !selectedFile}
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <ScanEye className="w-3.5 h-3.5" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>
          )}
        </div>

        {/* Right: Result */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Analysis Report</span>
            {resultDescription && (
              <button onClick={copyToClipboard} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-16">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              <p className="text-xs text-slate-500">Processing image...</p>
            </div>
          ) : resultDescription ? (
            <div className="flex-1 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
              {resultDescription}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-16 text-xs text-slate-400">
              Upload an image and click "Run Analysis" to see results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}