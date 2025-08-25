'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AOS from 'aos';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { calculateCredits } from '@/lib/credit-calculator';
import asmrTemplates from '@/data/asmr_templates.json';


export default function VEO3Page() {
  const { user } = useAuth();
  const { credits: userCredits, refreshCredits } = useCredits();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('Starting generation...');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9'); // VEO3 only supports 16:9 and 9:16
  const [quality, setQuality] = useState<'720p' | '1080p'>('720p');
  const [waterMark, setWaterMark] = useState<string>('');
  const [provider] = useState<'veo3'>('veo3'); // Fixed to VEO3
  const [veo3Model, setVeo3Model] = useState<'veo3_fast' | 'veo3'>('veo3_fast');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get a random demo video from templates - avoid hydration mismatch
  const [demoVideo, setDemoVideo] = useState(asmrTemplates[0]); // Default to first template

  const maxChars = 1800;

  // Calculate dynamic credits based on selections - VEO3 only
  const currentCredits = calculateCredits({
    provider,
    model: veo3Model,
    quality
  });

  // VEO3 available aspect ratios
  const availableAspectRatios = ['16:9', '9:16'];

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

  const handleImageUpload = async (file: File) => {
    if (!user) {
      setImageUploadError('Please login to upload images.');
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
        link.download = `veo3-asmr-video-${Date.now()}.mp4`;
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
            setGenerationProgress('Task queued, waiting to start...');
            break;
          case 'processing':
            if (data.progress >= 75) {
              setGenerationProgress(data.message || `Processing and uploading video... ${data.progress || 75}%`);
            } else {
              setGenerationProgress(`Generating video... ${data.progress || 0}%`);
            }
            break;
          case 'completed':
            if (data.result?.videoUrl) {
              setGeneratedVideo(data.result.videoUrl);
              setGenerationProgress('Video processed and ready!');
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
    if (!prompt.trim() || userCredits.credits < currentCredits) return;
    if (!user) {
      setError('Please login to generate videos.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);
    setGenerationProgress('Starting generation...');

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
          quality,
          waterMark: waterMark.trim(),
          provider,
          model: veo3Model,
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

  const isGenerateDisabled = !prompt.trim() || userCredits.credits < currentCredits || isGenerating;

  return (
    <div className="min-h-screen hero-bg">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Create with <span className="text-purple-300">VEO3</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Experience the highest quality ASMR video generation with Google&apos;s VEO3 model
            </p>
            {!user && (
              <div className="mt-6 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/50 rounded-xl p-4">
                <p className="text-yellow-200 font-medium">
                  <i className="ri-information-line mr-2"></i>
                  Please login to generate videos and save your creations.
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
                  {userCredits.credits} credits remaining
                </span>
              </div>
              <div className={`bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 ${userCredits.credits < currentCredits ? 'border-2 border-red-400' : ''}`}>
                <span className={`font-semibold ${userCredits.credits < currentCredits ? 'text-red-300' : 'text-purple-300'}`}>
                  <i className="ri-flash-line mr-2"></i>
                  Cost: {currentCredits} credits
                </span>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
              <label htmlFor="prompt" className="block text-lg font-medium text-white mb-4">
                <i className="ri-edit-2-line mr-2"></i>
                Describe your ASMR scene
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Include textures, sounds, and visuals for better results. Be descriptive and creative..."
                  className="w-full h-40 p-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-lg"
                  maxLength={maxChars}
                />
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm text-white font-medium">
                    {prompt.length}/{maxChars}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-8" data-aos="fade-up" data-aos-delay="300">
              <label className="block text-lg font-medium text-white mb-4">
                <i className="ri-image-add-line mr-2"></i>
                Image (Optional)
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
                        <p className="text-white font-medium">Uploading image...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <i className="ri-image-add-line text-4xl text-white/60 mb-3"></i>
                        <p className="text-white font-medium mb-1">Drag & drop or click</p>
                        <p className="text-white/70 text-sm">PNG, JPG, JPEG or WEBP (max 10MB)</p>
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
                      <p className="text-white font-medium mb-2">Image uploaded successfully</p>
                      <p className="text-white/70 text-sm mb-3">This image will be used as a reference for your video generation</p>
                      <button
                        onClick={handleRemoveImage}
                        className="inline-flex items-center px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-lg text-red-300 text-sm font-medium transition-all duration-200"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        Remove
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

            {/* VEO3 Settings */}
            <div className="mb-8 space-y-6" data-aos="fade-up" data-aos-delay="600">
              {/* VEO3 Model Selection Row */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  <i className="ri-cpu-line mr-2"></i>
                  VEO3 Model
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
                    <div className="font-semibold">VEO3 Fast</div>
                    <div className="text-sm opacity-80">60 credits</div>
                  </button>
                  <button
                    onClick={() => setVeo3Model('veo3')}
                    className={`p-4 rounded-xl transition-all duration-300 border ${
                      veo3Model === 'veo3'
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">VEO3 Standard</div>
                    <div className="text-sm opacity-80">300 credits</div>
                  </button>
                </div>
              </div>

              {/* Quality Selection Row */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">
                  <i className="ri-hd-line mr-2"></i>
                  Video Quality
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
                    <div className="font-semibold">720p HD</div>
                    <div className="text-sm opacity-80">Standard Quality</div>
                  </button>
                  <button
                    onClick={() => setQuality('1080p')}
                    className={`p-4 rounded-xl transition-all duration-300 border ${
                      quality === '1080p'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-transparent shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold">1080p Full HD</div>
                    <div className="text-sm opacity-80">High Quality</div>
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
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-4">
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
                        {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark Row */}
              <div>
                <label htmlFor="watermark" className="block text-lg font-medium text-white mb-4">
                  <i className="ri-copyright-line mr-2"></i>
                  Watermark (Optional)
                </label>
                <input
                  id="watermark"
                  type="text"
                  value={waterMark}
                  onChange={(e) => setWaterMark(e.target.value)}
                  placeholder="Add custom watermark text..."
                  className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  maxLength={50}
                />
                <div className="mt-2 text-sm text-white/70">
                  Leave empty for no watermark. Max 50 characters.
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
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                <i className="ri-magic-line mr-2"></i>
                {isGenerating ? 'Generating...' : 'Generate with VEO3'}
              </button>
            </div>

            {/* Credit Insufficient Warning */}
            {userCredits.credits < currentCredits && !isGenerating && (
              <div className="mb-8" data-aos="fade-up" data-aos-delay="850">
                <div className="bg-gradient-to-r from-purple-400/20 to-indigo-500/20 backdrop-blur-sm border border-purple-400/50 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <i className="ri-coin-line text-white text-xl"></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-purple-300 font-semibold text-lg mb-2">
                        <i className="ri-information-line mr-2"></i>
                        You need {currentCredits} credits to generate a video
                      </h3>
                      <p className="text-purple-200/90 mb-4">
                        Current balance: <span className="font-medium">{userCredits.credits} credits</span>
                      </p>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <i className="ri-shopping-cart-line mr-2"></i>
                        Get Credits
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
                  {generatedVideo ? 'VEO3 Result' : 'Preview'}
                </h2>
                <p className="text-white/70">
                  {generatedVideo 
                    ? 'Your professional VEO3 AI-generated video' 
                    : 'Your professional VEO3 AI-generated video will appear here'}
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
                          {searchParams.get('template') ? 'Template Preview' : 'Demo'}
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
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-purple-400"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-magic-line text-white text-xl"></i>
                      </div>
                    </div>
                    <h3 className="text-white text-xl font-semibold mt-4 mb-2">Creating your VEO3 video...</h3>
                    <p className="text-white/70">{generationProgress}</p>
                    <div className="mt-4 bg-white/20 rounded-full h-2 w-64 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-400 to-indigo-500 h-full animate-pulse"></div>
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
                  Your VEO3 Generated Video
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
                  
                  {/* Download Button - Purple style matching VEO3 theme */}
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
                      Download VEO3 Video • HD Quality
                    </button>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-xs font-medium">
                          {quality} • {aspectRatio}
                        </span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-xs font-medium">
                          VEO3 {veo3Model === 'veo3_fast' ? 'Fast' : 'Standard'}
                        </span>
                      </div>
                      {uploadedImage && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-white text-xs font-medium">
                            With Reference Image
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* VEO3 Features Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mt-8">
            <div className="text-center mb-8" data-aos="fade-up">
              <h3 className="text-white text-xl font-semibold mb-4">
                <i className="ri-star-line mr-2"></i>
                Why Choose VEO3?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-eye-line mr-2 text-purple-300"></i>
                    Superior Quality
                  </h4>
                  <p className="text-white/80 text-sm">VEO3 delivers the highest quality video generation with incredible detail and realism.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-palette-line mr-2 text-blue-300"></i>
                    Advanced AI
                  </h4>
                  <p className="text-white/80 text-sm">Powered by Google&apos;s latest video generation technology for natural, flowing ASMR content.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-settings-line mr-2 text-green-300"></i>
                    Optimized Settings
                  </h4>
                  <p className="text-white/80 text-sm">Specially tuned for ASMR content with support for 16:9 and 9:16 aspect ratios.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}