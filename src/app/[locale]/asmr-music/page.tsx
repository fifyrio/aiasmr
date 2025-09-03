'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { audioService } from '@/services/audio-service';
import audioConfig from '@/config/audio-config.json';

// Custom CSS for sliders
const sliderStyles = `
  .slider {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    cursor: pointer;
    outline: none;
  }
  .slider::-webkit-slider-track {
    background: transparent;
    height: 4px;
    border-radius: 2px;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #8b5cf6;
    border: 2px solid white;
    cursor: pointer;
    margin-top: -6px;
  }
  .slider::-moz-range-track {
    background: transparent;
    height: 4px;
    border-radius: 2px;
    border: none;
  }
  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #8b5cf6;
    border: 2px solid white;
    cursor: pointer;
    border: none;
  }
`;

export default function ASMRMusicPage() {
  const t = useTranslations('asmrMusic');
  const params = useParams();
  const locale = params.locale as string;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [activeCategory, setActiveCategory] = useState('Focus');
  const [activeSounds, setActiveSounds] = useState<string[]>([]);
  const [soundVolumes, setSoundVolumes] = useState<{[key: string]: number}>({});
  const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});
  const [openFaqItem, setOpenFaqItem] = useState<number | null>(null);
  const defaultFocusAudio = useRef<HTMLAudioElement | null>(null);

  // Icon mapping for sounds
  const soundIcons = useMemo(() => ({
    'Birds': '🐦',
    'Cafe': '☕',
    'Fireplace': '🔥',
    'Focus': '🎯',
    'Noise': '📻',
    'Ocean': '🌊',
    'Rain': '🌧️',
    'River': '🏞️',
    'Thunder': '⛈️',
    'Wind': '💨'
  }), []);

  // Get available categories from audio config
  const categories = useMemo(() => {
    return Object.keys(audioConfig.categories).filter((category: string) => 
      (audioConfig.categories as any)[category].count > 0
    );
  }, []);

  // Generate sound data from audio configuration
  const soundData = useMemo(() => {
    const data: { [key: string]: Array<{ id: string; name: string; icon: string }> } = {};
    
    // Build sound data by category using actual configuration
    categories.forEach((category: string) => {
      const categoryData = (audioConfig.categories as any)[category];
      data[category] = categoryData.sounds.map((soundId: string) => ({
        id: soundId,
        name: (audioConfig.sounds as any)[soundId]?.name || soundId,
        icon: (soundIcons as any)[soundId] || '🎵'
      }));
    });
    
    return data;
  }, [categories, soundIcons]);

  // Preset library data - using actual available sounds
  const presets = [
    {
      id: 'nature',
      name: 'Nature Mix',
      description: 'Sounds of nature for deep focus',
      image: '/images/Forest.png',
      sounds: ['Birds', 'Wind', 'River']
    },
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      description: 'Relaxing ocean sounds',
      image: '/images/Ocean.png',
      sounds: ['Ocean', 'Wind']
    },
    {
      id: 'cafe',
      name: 'Cafe Ambience',
      description: 'Coffee shop atmosphere',
      image: '/images/City.png',
      sounds: ['Cafe', 'Noise']
    },
    {
      id: 'rain',
      name: 'Rainy Day',
      description: 'Perfect for concentration',
      image: '/images/Rain.png',
      sounds: ['Rain', 'Thunder']
    },
    {
      id: 'fireplace',
      name: 'Cozy Evening',
      description: 'Warm fireplace sounds',
      image: '/images/Fire.png',
      sounds: ['Fireplace']
    }
  ];

  // Use cases data
  const useCases = [
    {
      title: 'Focus',
      description: 'Improve concentration with ambient sounds',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Relax',
      description: 'Reduce stress with calming soundscapes',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      title: 'Sleep',
      description: 'Fall asleep faster with soothing sounds',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah L.',
      avatar: '👩',
      quote: 'This app has completely transformed my study routine. I can now focus for hours without distractions.'
    },
    {
      name: 'Michael B.',
      avatar: '👨',
      quote: 'I use Soundscape every night to help me fall asleep. It\'s been a game-changer for my sleep quality.'
    },
    {
      name: 'Emily K.',
      avatar: '👩‍💼',
      quote: 'I love creating custom soundscapes for different moods. It\'s so versatile and easy to use.'
    }
  ];

  // ASMR Music FAQ data
  const asmrFaqData = [
    {
      question: "How do I use the ASMR music player?",
      answer: "Select a category (Focus, Relax, Sleep, etc.), click on sound icons to activate them, then hit the play button. You can mix multiple sounds and adjust individual volumes for a personalized experience."
    },
    {
      question: "Can I play multiple sounds at the same time?",
      answer: "Yes! You can activate multiple sounds simultaneously to create your perfect ambient mix. Each sound has its own volume control for fine-tuning."
    },
    {
      question: "What's the difference between sound categories?",
      answer: "Focus sounds help with concentration and productivity. Relax sounds reduce stress and anxiety. Sleep sounds promote better rest. Nature and Ambient provide various environmental atmospheres."
    },
    {
      question: "Are the sounds loop continuously?",
      answer: "Yes, all sounds are designed to loop seamlessly so you can listen for extended periods without interruption. Perfect for work, study, or sleep sessions."
    },
    {
      question: "Can I use this with headphones for better effect?",
      answer: "Absolutely! ASMR sounds are often more effective with headphones as they provide better stereo separation and immersive experience, especially for binaural audio effects."
    },
    {
      question: "Why are some sounds not working?",
      answer: "If sounds aren't playing, check your browser's audio permissions and ensure your device isn't muted. Some browsers block autoplay - try clicking the sound icon after the play button."
    },
    {
      question: "Can I save my favorite sound combinations?",
      answer: "The preset library contains pre-made combinations. Custom preset saving is coming in a future update. For now, remember your favorite combinations manually."
    },
    {
      question: "Is this free to use?",
      answer: "Yes! The ASMR music player is completely free to use. You can enjoy unlimited listening with all sound categories and mixing features at no cost."
    }
  ];

  // Initialize audio elements using the audio service
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Initialize default Focus audio from cloud
        if (!defaultFocusAudio.current && audioConfig.sounds.Focus) {
          const focusUrl = audioService.getAudioUrl('Focus');
          if (focusUrl) {
            const focusAudio = new Audio(focusUrl);
            focusAudio.loop = true;
            focusAudio.volume = volume / 100;
            focusAudio.crossOrigin = 'anonymous';
            defaultFocusAudio.current = focusAudio;
          }
        }
        
        // Initialize all available sounds from configuration
        const availableSounds = Object.keys(audioConfig.sounds);
        
        for (const soundId of availableSounds) {
          if (!audioRefs.current[soundId]) {
            try {
              const audioUrl = audioService.getAudioUrl(soundId);
              if (audioUrl) {
                const audio = new Audio(audioUrl);
                audio.loop = true;
                audio.volume = (soundVolumes[soundId] || 50) / 100 * (volume / 100);
                audio.crossOrigin = 'anonymous';
                
                // Enhanced error handling with fallback
                audio.onerror = () => {
                  console.warn(`Failed to load cloud audio for ${soundId}, trying fallback...`);
                  const fallbackUrl = (audioConfig.sounds as any)[soundId]?.localUrl;
                  if (fallbackUrl) {
                    audio.src = fallbackUrl;
                  }
                };
                
                audioRefs.current[soundId] = audio;
              }
            } catch (error) {
              console.error(`Error initializing audio for ${soundId}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing audio system:', error);
      }
    };

    initializeAudio();
  }, [soundVolumes, volume]);

  // Preset player functionality
  const playPreset = (preset: typeof presets[0]) => {
    // Stop all current sounds
    Object.keys(audioRefs.current).forEach(soundId => {
      const audio = audioRefs.current[soundId];
      if (audio) {
        audio.pause();
      }
    });
    if (defaultFocusAudio.current) {
      defaultFocusAudio.current.pause();
    }
    
    // Set active sounds to preset sounds
    const availablePresetSounds = preset.sounds.filter((soundId: string) => 
      (audioConfig.sounds as any)[soundId]
    );
    
    setActiveSounds(availablePresetSounds);
    setIsPlaying(true);
    
    // Play preset sounds
    availablePresetSounds.forEach(soundId => {
      const audio = audioRefs.current[soundId];
      if (audio) {
        audio.play().catch(console.error);
      }
    });
  };

  const toggleSound = (soundId: string) => {
    setActiveSounds(prev => {
      const newActiveSounds = prev.includes(soundId) 
        ? prev.filter(id => id !== soundId)
        : [...prev, soundId];
      
      // Handle audio playback
      const audio = audioRefs.current[soundId];
      if (audio) {
        if (newActiveSounds.includes(soundId) && isPlaying) {
          audio.play().catch(console.error);
        } else {
          audio.pause();
        }
      }
      
      return newActiveSounds;
    });
  };

  const togglePlay = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    
    if (newPlayState) {
      // If no sounds are active, automatically activate and play Focus
      if (activeSounds.length === 0) {
        // Activate Focus sound
        setActiveSounds(['Focus']);
        
        // Play Focus audio
        const focusAudio = audioRefs.current['Focus'];
        if (focusAudio) {
          focusAudio.play().catch(console.error);
        } else if (defaultFocusAudio.current) {
          // Fallback to default Focus audio if Focus from audioRefs is not ready
          defaultFocusAudio.current.play().catch(console.error);
        }
      } else {
        // Control all active sounds
        activeSounds.forEach(soundId => {
          const audio = audioRefs.current[soundId];
          if (audio) {
            audio.play().catch(console.error);
          }
        });
      }
    } else {
      // Pause default Focus audio
      if (defaultFocusAudio.current) {
        defaultFocusAudio.current.pause();
      }
      
      // Pause all active sounds
      activeSounds.forEach(soundId => {
        const audio = audioRefs.current[soundId];
        if (audio) {
          audio.pause();
        }
      });
    }
  };

  const updateSoundVolume = (soundId: string, newVolume: number) => {
    setSoundVolumes(prev => ({
      ...prev,
      [soundId]: newVolume
    }));
    
    const audio = audioRefs.current[soundId];
    if (audio) {
      audio.volume = newVolume / 100 * (volume / 100);
    }
  };

  // Update all audio volumes when master volume changes
  useEffect(() => {
    // Update default Focus audio volume
    if (defaultFocusAudio.current) {
      defaultFocusAudio.current.volume = volume / 100;
    }
    
    Object.keys(audioRefs.current).forEach(soundId => {
      const audio = audioRefs.current[soundId];
      if (audio) {
        audio.volume = (soundVolumes[soundId] || 50) / 100 * (volume / 100);
      }
    });
  }, [volume, soundVolumes]);

  const currentSounds = soundData[activeCategory as keyof typeof soundData] || soundData.Focus;

  // FAQ item component
  const ASMRFAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
    const isOpen = openFaqItem === index;
    
    return (
      <div className="border border-white/20 rounded-lg overflow-hidden">
        <button
          onClick={() => setOpenFaqItem(isOpen ? null : index)}
          className="w-full px-6 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center"
        >
          <span className="font-semibold text-white pr-4">{question}</span>
          <svg 
            className={`w-5 h-5 text-purple-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
            <p className="text-white/80 leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1625]">
      <style jsx>{sliderStyles}</style>
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-lg rounded-3xl overflow-hidden mb-12 border border-white/10">
            <div className="absolute inset-0">
              <img 
                src="/images/asmr-music-banner.jpeg" 
                alt="ASMR Music Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/80"></div>
            </div>
            <div className="relative p-12 md:p-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Free ASMR Music Player
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-white/90 mb-4">
                Find your focus
              </p>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Create your ideal soundscape to focus, relax, or sleep.
              </p>
              
              {/* Play Button */}
              <button
                onClick={togglePlay}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center transition-all duration-300 mx-auto mb-8 shadow-lg hover:shadow-purple-500/25"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sound Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sound Grid */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-8">
              {currentSounds.map(sound => (
                <div key={sound.id} className="text-center">
                  <button
                    onClick={() => toggleSound(sound.id)}
                    className={`w-full aspect-square rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-4 ${
                      activeSounds.includes(sound.id)
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/30'
                    }`}
                  >
                    <span className="text-2xl mb-2">{sound.icon}</span>
                    <span className="text-xs font-medium">{sound.name}</span>
                  </button>
                  
                  {/* Volume Slider for Active Sounds */}
                  {activeSounds.includes(sound.id) && (
                    <div className="mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={soundVolumes[sound.id] || 50}
                        onChange={(e) => updateSoundVolume(sound.id, parseInt(e.target.value))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${soundVolumes[sound.id] || 50}%, rgba(255,255,255,0.2) ${soundVolumes[sound.id] || 50}%, rgba(255,255,255,0.2) 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Master Volume */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-12 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Volume</span>
              <span className="text-white/70">{volume}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mt-2"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume}%, rgba(255,255,255,0.2) ${volume}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Preset Library */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Preset Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => playPreset(preset)}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center relative">
                    <img 
                      src={preset.image} 
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-purple-600 rounded-full p-3">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-2">{preset.name}</h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-2">{preset.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {preset.sounds.filter((soundId: string) => (audioConfig.sounds as any)[soundId]).map((soundId: string) => (
                        <span key={soundId} className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                          {(soundIcons as any)[soundId]} {(audioConfig.sounds as any)[soundId]?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Use Cases</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${useCase.gradient} rounded-2xl p-8 text-white`}
                >
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-white/90">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Loved by users worldwide
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{testimonial.avatar}</span>
                  </div>
                  <p className="text-white/90 text-sm mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                  <p className="text-white font-medium">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {asmrFaqData.map((faq, index) => (
                <ASMRFAQItem 
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}