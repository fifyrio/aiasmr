'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AOS from 'aos';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditsContext';
import { calculateCredits, getAvailableDurations, getAvailableAspectRatios } from '@/lib/credit-calculator';
import asmrTemplates from '@/data/asmr_templates.json';

interface CreateClientProps {
  translations: any;
}

export default function CreateClient({ translations: t }: CreateClientProps) {
  const { user } = useAuth();
  const { credits: userCredits, loading: creditsLoading, refreshCredits } = useCredits();
  const tDynamic = useTranslations('create'); // For dynamic translations with interpolation
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('Starting generation...');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '3:4' | '9:16'>('16:9');
  const [duration, setDuration] = useState<5 | 8>(5);
  const [quality, setQuality] = useState<'720p' | '1080p'>('720p');
  const [waterMark, setWaterMark] = useState<string>('');
  const [provider, setProvider] = useState<'runway' | 'veo3'>('veo3');
  const [veo3Model, setVeo3Model] = useState<'veo3_fast' | 'veo3'>('veo3_fast');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get a random demo video from templates - avoid hydration mismatch
  const [demoVideo, setDemoVideo] = useState(asmrTemplates[0]); // Default to first template

  const maxChars = 1800;

  // Calculate dynamic credits based on selections
  const currentCredits = calculateCredits({
    provider,
    model: provider === 'veo3' ? veo3Model : undefined,
    duration: provider === 'runway' ? duration : undefined,
    quality
  });

  // Get available options based on provider
  const availableDurations = getAvailableDurations(provider);
  const availableAspectRatios = getAvailableAspectRatios(provider);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
    
    // Set random demo video on client side only if no template is specified
    const templateId = searchParams.get('template');
    if (!templateId) {
      const randomIndex = Math.floor(Math.random() * asmrTemplates.length);
      setDemoVideo(asmrTemplates[randomIndex]);
    }
  }, [searchParams]);

  // Auto-fill prompt from URL parameters or template
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    const templateId = searchParams.get('template');
    
    if (templateId && !prompt) {
      // Find template by ID
      const template = asmrTemplates.find(t => t.id.toString() === templateId);
      if (template) {
        setPrompt(template.prompt);
        setDemoVideo(template);
        return;
      }
    }
    
    if (urlPrompt && !prompt) {
      setPrompt(decodeURIComponent(urlPrompt));
    }
  }, [searchParams, prompt]);

  // Reset settings when provider changes
  useEffect(() => {
    if (provider === 'veo3') {
      // VEO3 restrictions: only 16:9 and 9:16 aspect ratios
      if (!['16:9', '9:16'].includes(aspectRatio)) {
        setAspectRatio('16:9');
      }
    } else if (provider === 'runway') {
      // Reset to default Runway settings if needed
      if (!availableDurations.includes(duration)) {
        setDuration(5);
      }
    }
  }, [provider, aspectRatio, duration, availableDurations]);

  const handleImageUpload = async (file: File) => {
    if (!user) {
      setImageUploadError(t.image.loginToUpload);
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedImage(data.imageUrl);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageUploadError(null);
  };

  const handleDownloadVideo = async () => {
    console.log('Download button clicked, videoId:', videoId);
    if (videoId) {
      try {
        console.log('Fetching download URL for video:', videoId);
        const response = await fetch(`/api/videos/${videoId}/download`);
        console.log('Download API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Download data received:', data);
          
          // 创建下载链接
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.download = data.filename;
          link.target = '_blank'; // 在新窗口打开以防下载失败
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const errorData = await response.json();
          console.error('Download API error:', errorData);
          setError(`Download failed: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Download failed:', error);
        setError('Failed to download video. Please try again.');
      }
    } else if (generatedVideo) {
      // Fallback: download directly from the video URL if videoId is not available
      console.log('Using direct video URL for download:', generatedVideo);
      try {
        const link = document.createElement('a');
        link.href = generatedVideo;
        link.download = `asmr-video-${Date.now()}.mp4`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Direct download failed:', error);
        setError('Failed to download video. Please try again.');
      }
    } else {
      console.error('No video ID or URL available for download');
      setError('Video not available for download. Please try regenerating the video.');
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 120; // Poll for up to 10 minutes (120 * 5s = 600s) - increased for video processing
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        // Build query parameters with video metadata
        const params = new URLSearchParams({
          taskId,
          userId: user?.id || '',
          prompt: prompt.trim(),
          duration: duration.toString(),
          quality: quality,
          aspectRatio: aspectRatio,
          provider: provider
        });
        
        const response = await fetch(`/api/generate/status?${params}`);
        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const data = await response.json();
        
        // Check if KIE API returned success code (200) - stop polling immediately
        if (data.code === 200) {
          console.log('KIE API returned success code 200, stopping polling');
          // Still process the status normally but ensure polling stops
        }
        
        switch (data.status) {
          case 'pending':
            setGenerationProgress(tDynamic('progress.queued'));
            break;
          case 'processing':
            if (data.progress >= 75) {
              setGenerationProgress(data.message || tDynamic('progress.uploading', { progress: data.progress || 75 }));
            } else {
              setGenerationProgress(tDynamic('progress.processing', { progress: data.progress || 0 }));
            }
            break;
          case 'completed':
            if (data.result?.videoUrl) {
              setGeneratedVideo(data.result.videoUrl);
              setGenerationProgress(tDynamic('progress.ready'));
              setIsGenerating(false);
              
              // Set video ID if provided (from our database)
              if (data.videoId) {
                setVideoId(data.videoId);
              }
              
              return;
            }
            break;
          case 'failed':
            setError(data.error || 'Video generation failed');
            setIsGenerating(false);
            // Refresh credits in case of refund
            setTimeout(() => {
              refreshCredits();
            }, 1000);
            return;
        }

        // Stop polling if KIE API returned success code 200
        if (data.code === 200) {
          return;
        }

        // Continue polling if not completed/failed and haven't exceeded max attempts
        if (attempts < maxAttempts && (data.status === 'pending' || data.status === 'processing')) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else if (attempts >= maxAttempts) {
          setError('Video generation timed out. Please try again.');
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setError('Failed to check generation status');
          setIsGenerating(false);
        }
      }
    };

    poll();
  };


  const handleGenerate = async () => {
    if (!prompt.trim() || creditsLoading || userCredits.credits < currentCredits) return;
    if (!user) {
      setError(t.generate.loginToGenerate);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);
    setGenerationProgress(tDynamic('progress.starting'));

    try {
      // Generate video with KIE Veo3
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          duration: provider === 'runway' ? duration : undefined,
          quality,
          waterMark: waterMark.trim(),
          provider,
          model: provider === 'veo3' ? veo3Model : undefined,
          credits: currentCredits,
          imageUrl: uploadedImage,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const generateData = await generateResponse.json();
      setTaskId(generateData.taskId);

      // Refresh credits after deduction
      if (generateData.creditsDeducted) {
        // Refresh credits display after a short delay to ensure database is updated
        setTimeout(() => {
          refreshCredits();
        }, 1000);
      }

      // Start polling for completion
      await pollTaskStatus(generateData.taskId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video. Please try again.');
      setIsGenerating(false);
    }
  };

  const isGenerateDisabled = !prompt.trim() || creditsLoading || userCredits.credits < currentCredits || isGenerating;

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title.split(' ').map((word: string, index: number) => 
              word === 'ASMR' ? <span key={index} className="text-yellow-300">{word}</span> : word + ' '
            )}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          {!user && (
            <div className="mt-6 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/50 rounded-xl p-4">
              <p className="text-yellow-200 font-medium">
                <i className="ri-information-line mr-2"></i>
                {t.loginRequired}
              </p>
            </div>
          )}
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel - Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Credits Display */}
          <div className="flex justify-between items-center mb-8" data-aos="fade-up">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-white font-semibold">
                <i className="ri-coin-line mr-2"></i>
                {creditsLoading ? 'Loading...' : tDynamic('credits.remaining', { credits: userCredits.credits })}
              </span>
            </div>
            <div className={`bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 ${!creditsLoading && userCredits.credits < currentCredits ? 'border-2 border-red-400' : ''}`}>
              <span className={`font-semibold ${!creditsLoading && userCredits.credits < currentCredits ? 'text-red-300' : 'text-yellow-300'}`}>
                <i className="ri-flash-line mr-2"></i>
                {tDynamic('credits.cost', { credits: currentCredits })}
              </span>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
            <label htmlFor="prompt" className="block text-lg font-medium text-white mb-4">
              <i className="ri-edit-2-line mr-2"></i>
              {t.prompt.label}
            </label>
            <div className="relative">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.prompt.placeholder}
                className="w-full h-40 p-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none text-lg"
                maxLength={maxChars}
              />
              <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm text-white font-medium">
                  {tDynamic('prompt.charCount', { current: prompt.length, max: maxChars })}
                </span>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8" data-aos="fade-up" data-aos-delay="300">
            <label className="block text-lg font-medium text-white mb-4">
              <i className="ri-image-add-line mr-2"></i>
              {t.image.label}
            </label>
            
            {!uploadedImage ? (
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  disabled={isUploadingImage}
                  className="hidden"
                />
                <div 
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && !isUploadingImage) {
                      handleImageUpload(file);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                  className={`w-full h-48 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                    isUploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15 hover:border-white/50 cursor-pointer'
                  }`}>
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mb-3"></div>
                      <p className="text-white font-medium">{t.image.uploading}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <i className="ri-image-add-line text-4xl text-white/60 mb-3"></i>
                      <p className="text-white font-medium mb-1">{t.image.dragDrop}</p>
                      <p className="text-white/70 text-sm">{t.image.fileTypes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={uploadedImage}
                      alt="Uploaded image"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium mb-2">{t.image.uploadSuccess}</p>
                    <p className="text-white/70 text-sm mb-3">{t.image.uploadDescription}</p>
                    <button
                      onClick={handleRemoveImage}
                      className="inline-flex items-center px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-lg text-red-300 text-sm font-medium transition-all duration-200"
                    >
                      <i className="ri-delete-bin-line mr-1"></i>
                      {t.image.remove}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {imageUploadError && (
              <div className="mt-3 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-lg p-3">
                <p className="text-red-300 text-sm font-medium">{imageUploadError}</p>
              </div>
            )}
          </div>

          {/* Generation Settings */}
          <div className="mb-8 space-y-6" data-aos="fade-up" data-aos-delay="600">
            {/* Provider Selection Row */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                <i className="ri-cpu-line mr-2"></i>
                {t.provider.label}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setProvider('veo3')}
                  className={`p-4 rounded-xl transition-all duration-300 border ${
                    provider === 'veo3'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-transparent shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="font-semibold">{t.provider.veo3.title}</div>
                  <div className="text-sm opacity-80">{t.provider.veo3.subtitle}</div>
                </button>
                <button
                  onClick={() => setProvider('runway')}
                  className={`p-4 rounded-xl transition-all duration-300 border ${
                    provider === 'runway'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="font-semibold">{t.provider.runway.title}</div>
                  <div className="text-sm opacity-80">{t.provider.runway.subtitle}</div>
                </button>
              </div>
            </div>

            {/* VEO3 Model Selection Row */}
            {provider === 'veo3' && (
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  <i className="ri-cpu-line mr-2"></i>
                  {t.model.label}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setVeo3Model('veo3_fast')}
                    className={`p-4 rounded-xl transition-all duration-300 border ${
                      veo3Model === 'veo3_fast'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-transparent shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">{t.model.veo3Fast.title}</div>
                    <div className="text-sm opacity-80">{t.model.veo3Fast.subtitle}</div>
                  </button>
                  <button
                    onClick={() => setVeo3Model('veo3')}
                    className={`p-4 rounded-xl transition-all duration-300 border ${
                      veo3Model === 'veo3'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">{t.model.veo3Standard.title}</div>
                    <div className="text-sm opacity-80">{t.model.veo3Standard.subtitle}</div>
                  </button>
                </div>
              </div>
            )}

            {/* Duration Selection Row - Only for Runway */}
            {provider === 'runway' && (
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  <i className="ri-time-line mr-2"></i>
                  {t.duration.label}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDuration(5)}
                    className={`p-4 rounded-xl transition-all duration-300 border ${
                      duration === 5
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">{t.duration['5seconds'].title}</div>
                    <div className="text-sm opacity-80">{t.duration['5seconds'].subtitle}</div>
                  </button>
                  <button
                    onClick={() => {
                      setDuration(8);
                      if (quality === '1080p') {
                        setQuality('720p'); // Auto-switch to 720p if 1080p was selected
                      }
                    }}
                    className={`p-4 rounded-xl transition-all duration-300 border ${
                      duration === 8
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white border-transparent shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">{t.duration['8seconds'].title}</div>
                    <div className="text-sm opacity-80">{t.duration['8seconds'].subtitle}</div>
                  </button>
                </div>
              </div>
            )}

            {/* Quality Selection Row */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                <i className="ri-hd-line mr-2"></i>
                {t.quality.label}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setQuality('720p')}
                  className={`p-4 rounded-xl transition-all duration-300 border ${
                    quality === '720p'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-transparent shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="font-semibold">{t.quality['720p'].title}</div>
                  <div className="text-sm opacity-80">{t.quality['720p'].subtitle}</div>
                </button>
                <button
                  onClick={() => {
                    if (duration !== 8) {
                      setQuality('1080p');
                    }
                  }}
                  disabled={duration === 8}
                  className={`p-4 rounded-xl transition-all duration-300 border ${
                    duration === 8
                      ? 'bg-gray-500/50 text-gray-300 border-gray-400/30 cursor-not-allowed'
                      : quality === '1080p'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-transparent shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                  }`}
                >
                  <div className="font-semibold">{t.quality['1080p'].title}</div>
                  <div className="text-sm opacity-80">
                    {duration === 8 ? t.quality['1080p'].unavailable : t.quality['1080p'].subtitle}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Aspect Ratio and Watermark */}
          <div className="mb-8 space-y-6" data-aos="fade-up" data-aos-delay="700">
            {/* Aspect Ratio Row */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                <i className="ri-aspect-ratio-line mr-2"></i>
                {t.aspectRatio.label}
              </label>
              <div className="grid grid-cols-3 gap-4">
                {availableAspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio as any)}
                    className={`p-4 rounded-xl transition-all duration-300 border ${
                      aspectRatio === ratio
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">{ratio}</div>
                    <div className="text-sm opacity-80">
                      {t.aspectRatio.ratios[ratio as keyof typeof t.aspectRatio.ratios]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Row */}
            <div>
              <label htmlFor="watermark" className="block text-lg font-medium text-white mb-4">
                <i className="ri-copyright-line mr-2"></i>
                {t.watermark.label}
              </label>
              <input
                id="watermark"
                type="text"
                value={waterMark}
                onChange={(e) => setWaterMark(e.target.value)}
                placeholder={t.watermark.placeholder}
                className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                maxLength={50}
              />
              <div className="mt-2 text-sm text-white/70">
                {t.watermark.description}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-8" data-aos="fade-up" data-aos-delay="800">
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`px-12 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform ${
                isGenerateDisabled
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              <i className="ri-magic-line mr-2"></i>
              {isGenerating ? t.generate.generating : t.generate.button}
            </button>
          </div>

          {/* Credit Insufficient Warning */}
          {!creditsLoading && userCredits.credits < currentCredits && !isGenerating && (
            <div className="mb-8" data-aos="fade-up" data-aos-delay="850">
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <i className="ri-coin-line text-white text-xl"></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-yellow-300 font-semibold text-lg mb-2">
                      <i className="ri-information-line mr-2"></i>
                      {tDynamic('credits.insufficient', { credits: currentCredits })}
                    </p>
                    <p className="text-yellow-200/90 mb-4">
                      {creditsLoading ? 'Loading balance...' : tDynamic('credits.currentBalance', { credits: userCredits.credits })}
                    </p>
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <i className="ri-shopping-cart-line mr-2"></i>
                      {t.credits.getCredits}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Right Panel - Video Preview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 order-first lg:order-last lg:sticky lg:top-8 h-fit">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {generatedVideo ? tDynamic('preview.result', { provider: provider.toUpperCase() }) : t.preview.title}
              </h2>
              <p className="text-white/70">
                {t.preview.description}
              </p>
            </div>

            {/* Demo Video or Generated Result */}
            {!generatedVideo && !isGenerating && (
              <div className="mb-6" data-aos="fade-up">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="relative">
                    <video
                      src={demoVideo.video}
                      poster={demoVideo.poster}
                      controls
                      loop
                      className="w-full rounded-lg shadow-lg"
                      style={{ aspectRatio: demoVideo.ratio === 'ratio-16-9' ? '16/9' : demoVideo.ratio === 'ratio-9-16' ? '9/16' : '1/1' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-xs font-medium">
                        {searchParams.get('template') ? t.preview.templatePreview : t.preview.demo}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-white font-semibold mb-2">{demoVideo.title}</h3>
                    <p className="text-white/70 text-sm mb-3">{demoVideo.prompt}</p>
                    <div className="flex flex-wrap gap-2">
                      {demoVideo.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            {isGenerating && (
            <div className="mb-8" data-aos="fade-up">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-yellow-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="ri-magic-line text-white text-xl"></i>
                    </div>
                  </div>
                  <h3 className="text-white text-xl font-semibold mt-4 mb-2">{tDynamic('progress.creating')}</h3>
                  <p className="text-white/70">{generationProgress}</p>
                  <div className="mt-4 bg-white/20 rounded-full h-2 w-64 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-8" data-aos="fade-up">
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl p-6 text-center">
                <i className="ri-error-warning-line text-red-300 text-2xl mb-2"></i>
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {generatedVideo && (
            <div className="mb-8" data-aos="fade-up">
              <h3 className="text-white text-xl font-semibold mb-6 text-center">
                <i className="ri-video-line mr-2"></i>
                {tDynamic('result.title')}
              </h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <video
                  src={generatedVideo}
                  controls
                  loop
                  className="w-full rounded-lg shadow-lg"
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Download Button - Purple style matching reference */}
                <div className="mt-6">
                  <button 
                    onClick={handleDownloadVideo}
                    disabled={!videoId && !generatedVideo}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform shadow-lg ${
                      !videoId && !generatedVideo 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:scale-105'
                    }`}
                  >
                    <i className="ri-download-2-line mr-2"></i>
                    {tDynamic('result.download', { provider: provider.toUpperCase() })}
                  </button>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-xs font-medium">
                        {duration}s • {quality} • {aspectRatio}
                      </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-xs font-medium">
                        {provider.toUpperCase()}
                      </span>
                    </div>
                    {uploadedImage && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-xs font-medium">
                          {t.result.withImage}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mt-8">
          <div className="border-t border-white/20 pt-8" data-aos="fade-up" data-aos-delay="900">
            <h3 className="text-white text-xl font-semibold mb-6 text-center">
              <i className="ri-question-line mr-2"></i>
              {t.faq.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-error-warning-line mr-2 text-red-300"></i>
                  {t.faq.failedGeneration.title}
                </h4>
                <p className="text-white/80 text-sm">{t.faq.failedGeneration.answer}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-time-line mr-2 text-blue-300"></i>
                  {t.faq.generationTime.title}
                </h4>
                <p className="text-white/80 text-sm">{t.faq.generationTime.answer}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-vip-crown-line mr-2 text-yellow-300"></i>
                  {t.faq.freePlan.title}
                </h4>
                <p className="text-white/80 text-sm">{t.faq.freePlan.answer}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-lightbulb-line mr-2 text-green-300"></i>
                  {t.faq.betterResults.title}
                </h4>
                <p className="text-white/80 text-sm">{t.faq.betterResults.answer}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-briefcase-line mr-2 text-purple-300"></i>
                  {t.faq.commercialUse.title}
                </h4>
                <p className="text-white/80 text-sm">{t.faq.commercialUse.answer}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-download-line mr-2 text-orange-300"></i>
                  {t.faq.howToDownload.title}
                </h4>
                <p className="text-white/80 text-sm">{t.faq.howToDownload.answer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}