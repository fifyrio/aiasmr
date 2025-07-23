'use client';

import { useState, useEffect } from 'react';
import AOS from 'aos';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const triggers = [
  { id: 'soap', name: 'Soap', icon: '🧼', color: 'from-blue-400 to-cyan-400' },
  { id: 'sponge', name: 'Sponge', icon: '🧽', color: 'from-yellow-400 to-orange-400' },
  { id: 'ice', name: 'Ice', icon: '🧊', color: 'from-cyan-400 to-blue-500' },
  { id: 'water', name: 'Water', icon: '💧', color: 'from-blue-500 to-teal-400' },
  { id: 'honey', name: 'Honey', icon: '🍯', color: 'from-amber-400 to-orange-500' },
  { id: 'cubes', name: 'Cubes', icon: '⬜', color: 'from-gray-400 to-slate-500' },
  { id: 'petals', name: 'Petals', icon: '🌸', color: 'from-pink-400 to-rose-500' },
  { id: 'pages', name: 'Pages', icon: '📄', color: 'from-green-400 to-emerald-500' },
];

export default function CreatePage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState(['soap']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(20);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const maxChars = 500;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  const handleTriggerToggle = (triggerId: string) => {
    setSelectedTriggers(prev => {
      const isCurrentlySelected = prev.includes(triggerId);
      
      if (isCurrentlySelected) {
        // If trying to deselect and it's the only selected trigger, keep it selected
        if (prev.length === 1) {
          return prev;
        }
        // Otherwise, remove it from selection
        return prev.filter(id => id !== triggerId);
      } else {
        // Add to selection
        return [...prev, triggerId];
      }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || credits <= 0) return;
    if (!user) {
      setError('Please login to generate videos.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 生成视频
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          triggers: selectedTriggers,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const generateData = await generateResponse.json();
      setGeneratedVideo(generateData.videoUrl);

      // 保存视频记录到数据库
      const saveResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: generateData.videoUrl,
          prompt: prompt.trim(),
          triggers: selectedTriggers,
          userId: user.id,
        }),
      });

      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        setVideoId(saveData.video.id);
      }

      setCredits(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isGenerateDisabled = !prompt.trim() || credits <= 0 || isGenerating;

  return (
    <div className="min-h-screen hero-bg">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Create Your <span className="text-yellow-300">ASMR</span> Video
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Transform your ideas into immersive ASMR experiences with our AI-powered generation
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

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* Credits Display */}
            <div className="flex justify-between items-center mb-8" data-aos="fade-up">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <span className="text-white font-semibold">
                  <i className="ri-coin-line mr-2"></i>
                  {credits} credits remaining
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
                  className="w-full h-40 p-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none text-lg"
                  maxLength={maxChars}
                />
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm text-white font-medium">
                    {prompt.length}/{maxChars}
                  </span>
                </div>
              </div>
            </div>

            {/* Trigger Selection */}
            <div className="mb-8" data-aos="fade-up" data-aos-delay="400">
              <h3 className="text-lg font-medium text-white mb-6">
                <i className="ri-sound-module-line mr-2"></i>
                Select ASMR Triggers
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {triggers.map((trigger, index) => (
                  <button
                    key={trigger.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTriggerToggle(trigger.id);
                    }}
                    data-aos="fade-up"
                    data-aos-delay={500 + index * 100}
                    className={`relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedTriggers.includes(trigger.id)
                        ? `bg-gradient-to-r ${trigger.color} text-white shadow-lg scale-105`
                        : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{trigger.icon}</div>
                    <div className="text-sm font-semibold">{trigger.name}</div>
                    {selectedTriggers.includes(trigger.id) && (
                      <div className="absolute top-2 right-2 bg-white/20 rounded-full p-1">
                        <i className="ri-check-line text-sm"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center mb-8" data-aos="fade-up" data-aos-delay="600">
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
                {isGenerating ? 'Generating...' : 'Generate ASMR Video'}
              </button>
            </div>

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
                    <h3 className="text-white text-xl font-semibold mt-4 mb-2">Creating your ASMR video...</h3>
                    <p className="text-white/70">Generating demo video...</p>
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
                  Your Generated ASMR Video
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
                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button 
                      onClick={async () => {
                        if (videoId) {
                          try {
                            const response = await fetch(`/api/videos/${videoId}/download`);
                            if (response.ok) {
                              const data = await response.json();
                              // 创建下载链接
                              const link = document.createElement('a');
                              link.href = data.downloadUrl;
                              link.download = data.filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          } catch (error) {
                            console.error('Download failed:', error);
                          }
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <i className="ri-download-line mr-2"></i>
                      Download HD
                    </button>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-white text-sm font-medium">
                        Triggers: {selectedTriggers.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div className="border-t border-white/20 pt-8" data-aos="fade-up" data-aos-delay="800">
              <h3 className="text-white text-xl font-semibold mb-6 text-center">
                <i className="ri-question-line mr-2"></i>
                Frequently Asked Questions
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-error-warning-line mr-2 text-red-300"></i>
                    What happens if my video generation fails?
                  </h4>
                  <p className="text-white/80 text-sm">Failed generations don&apos;t cost credits. You can try again without losing any credits.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-time-line mr-2 text-blue-300"></i>
                    How long does video generation take?
                  </h4>
                  <p className="text-white/80 text-sm">Video generation usually takes 1–2 minutes, but may take up to 4 minutes during peak times.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-vip-crown-line mr-2 text-yellow-300"></i>
                    Can I generate videos on the free plan?
                  </h4>
                  <p className="text-white/80 text-sm">Only paid plans can generate videos. Free users can browse and explore existing content.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-lightbulb-line mr-2 text-green-300"></i>
                    How can I get better results?
                  </h4>
                  <p className="text-white/80 text-sm">Use clear, rich prompts with detailed descriptions. The prompt content controls the visual style and quality.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-briefcase-line mr-2 text-purple-300"></i>
                    Can I use generated videos commercially?
                  </h4>
                  <p className="text-white/80 text-sm">Commercial use is permitted for original uploads on paid plans.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <i className="ri-download-line mr-2 text-orange-300"></i>
                    How do I download my video?
                  </h4>
                  <p className="text-white/80 text-sm">Click the &quot;Download HD&quot; button that appears after your video is generated.</p>
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