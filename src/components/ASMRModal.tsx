'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ASMRTemplate {
  id: number;
  title: string;
  category: string[];
  ratio: string;
  duration: string;
  downloads: string;
  prompt: string;
  tags: string[];
  poster?: string;
  video?: string;
  hasAudio?: boolean;
}

interface ASMRModalProps {
  isOpen: boolean;
  template: ASMRTemplate | null;
  onClose: () => void;
}

export default function ASMRModal({ isOpen, template, onClose }: ASMRModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  if (!isOpen || !template) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateVideo = () => {
    router.push(`/create?template=${template.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-black rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">ASMR Template</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Video Preview */}
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-900">
                {template.video ? (
                  <video 
                    className="w-full h-auto"
                    poster={template.poster}
                    controls
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = 'none';
                      if (template.poster && target.parentNode) {
                        const img = document.createElement('img');
                        img.src = template.poster;
                        img.className = 'w-full h-auto';
                        img.alt = template.title;
                        target.parentNode?.appendChild(img);
                      }
                    }}
                  >
                    <source src={template.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <p className="text-gray-300">Video Preview</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-purple-600/80 text-white text-xs px-2 py-1 rounded">
                  {template.ratio.replace('ratio-', '').replace('-', ':')}
                </div>
              </div>
              {template.hasAudio && (
                <div className="flex items-center text-gray-300 text-sm">
                  <span className="mr-2">🔊</span>
                  <span>Audio Included</span>
                </div>
              )}
            </div>

            {/* Right Side - Template Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">{template.title}</h3>
                
                {/* Template Info */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-6 h-6 mr-3 text-gray-400">🏷️</span>
                    <span className="text-gray-300">Category:</span>
                    <span className="ml-2 bg-purple-600 text-white px-2 py-1 rounded text-sm">
                      {template.category[0]}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-6 h-6 mr-3 text-gray-400">⏱️</span>
                    <span className="text-gray-300">Duration:</span>
                    <span className="ml-2 bg-gray-700 text-white px-2 py-1 rounded text-sm">
                      {template.duration}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-6 h-6 mr-3 text-gray-400">📐</span>
                    <span className="text-gray-300">Aspect Ratio:</span>
                    <span className="ml-2 bg-gray-700 text-white px-2 py-1 rounded text-sm">
                      {template.ratio.replace('ratio-', '').replace('-', ':')}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-6 h-6 mr-3 text-gray-400">📊</span>
                    <span className="text-gray-300">Downloads:</span>
                    <span className="ml-2 bg-gray-700 text-white px-2 py-1 rounded text-sm">
                      {template.downloads}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy Prompt Section */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">
                    Copy this prompt to generate a similar video:
                  </h4>
                  <button
                    onClick={() => copyToClipboard(template.prompt)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                
                <div className="bg-gray-800 rounded p-3 text-gray-200 text-sm max-h-32 overflow-y-auto">
                  {template.prompt}
                </div>
                
                {copySuccess && (
                  <div className="mt-2 text-green-400 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied to clipboard!
                  </div>
                )}
              </div>

              {/* Generate Video Button */}
              <button
                onClick={handleGenerateVideo}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Generate Video with This Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}