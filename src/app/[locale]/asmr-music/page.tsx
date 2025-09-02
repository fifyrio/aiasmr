'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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

  // Sound categories
  const categories = ['Focus', 'Relax', 'Sleep', 'Nature', 'Ambient'];

  // Sound data for each category
  const soundData = {
    Focus: [
      { id: 'rain', name: 'Rain', icon: '🌧️' },
      { id: 'thunder', name: 'Thunder', icon: '⛈️' },
      { id: 'wind', name: 'Wind', icon: '💨' },
      { id: 'birds', name: 'Birds', icon: '🐦' },
      { id: 'fireplace', name: 'Fireplace', icon: '🔥' },
      { id: 'river', name: 'River', icon: '🏞️' },
      { id: 'cafe', name: 'Cafe', icon: '☕' },
      { id: 'noise', name: 'Noise', icon: '📻' }
    ],
    Relax: [
      { id: 'ocean', name: 'Ocean', icon: '🌊' },
      { id: 'forest', name: 'Forest', icon: '🌲' },
      { id: 'meditation', name: 'Meditation', icon: '🧘' },
      { id: 'piano', name: 'Piano', icon: '🎹' },
      { id: 'singing', name: 'Singing', icon: '🎵' },
      { id: 'bells', name: 'Bells', icon: '🔔' },
      { id: 'chimes', name: 'Chimes', icon: '🎐' },
      { id: 'bamboo', name: 'Bamboo', icon: '🎋' }
    ],
    Sleep: [
      { id: 'whitenoise', name: 'White Noise', icon: '⚪' },
      { id: 'pinknoise', name: 'Pink Noise', icon: '🌸' },
      { id: 'brownnoise', name: 'Brown Noise', icon: '🟤' },
      { id: 'lullaby', name: 'Lullaby', icon: '🎵' },
      { id: 'heartbeat', name: 'Heartbeat', icon: '💓' },
      { id: 'womb', name: 'Womb', icon: '🤱' },
      { id: 'clock', name: 'Clock', icon: '⏰' },
      { id: 'silence', name: 'Silence', icon: '🤫' }
    ],
    Nature: [
      { id: 'forest', name: 'Forest', icon: '🌲' },
      { id: 'ocean', name: 'Ocean', icon: '🌊' },
      { id: 'desert', name: 'Desert', icon: '🏜️' },
      { id: 'mountain', name: 'Mountain', icon: '🏔️' },
      { id: 'jungle', name: 'Jungle', icon: '🌿' },
      { id: 'beach', name: 'Beach', icon: '🏖️' },
      { id: 'meadow', name: 'Meadow', icon: '🌾' },
      { id: 'cave', name: 'Cave', icon: '🕳️' }
    ],
    Ambient: [
      { id: 'city', name: 'City', icon: '🏙️' },
      { id: 'library', name: 'Library', icon: '📚' },
      { id: 'office', name: 'Office', icon: '🏢' },
      { id: 'train', name: 'Train', icon: '🚂' },
      { id: 'plane', name: 'Plane', icon: '✈️' },
      { id: 'underwater', name: 'Underwater', icon: '🐠' },
      { id: 'space', name: 'Space', icon: '🌌' },
      { id: 'vintage', name: 'Vintage', icon: '📻' }
    ]
  };

  // Preset library data
  const presets = [
    {
      id: 'forest',
      name: 'Forest',
      description: 'Sounds of a peaceful forest',
      image: '/images/Forest.png',
      sounds: ['birds', 'wind', 'forest']
    },
    {
      id: 'ocean',
      name: 'Ocean',
      description: 'Sounds of the ocean waves',
      image: '/images/Ocean.png',
      sounds: ['ocean', 'wind']
    },
    {
      id: 'city',
      name: 'City',
      description: 'Sounds of a bustling city',
      image: '/images/City.png',
      sounds: ['city', 'traffic']
    },
    {
      id: 'rain',
      name: 'Rain',
      description: 'Sounds of gentle rain',
      image: '/images/Rain.png',
      sounds: ['rain', 'thunder']
    },
    {
      id: 'fire',
      name: 'Fire',
      description: 'Sounds of a crackling fire',
      image: '/images/Fire.png',
      sounds: ['fireplace']
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

  // Initialize audio elements
  useEffect(() => {
    // Initialize default Focus audio
    if (!defaultFocusAudio.current) {
      const focusAudio = new Audio('/sounds/Focus.mp3');
      focusAudio.loop = true;
      focusAudio.volume = volume / 100;
      defaultFocusAudio.current = focusAudio;
    }
    
    const allSounds = Object.values(soundData).flat();
    allSounds.forEach(sound => {
      if (!audioRefs.current[sound.id]) {
        // Try WAV first, fallback to MP3
        const audio = new Audio(`/sounds/${sound.id}.wav`);
        audio.loop = true;
        audio.volume = (soundVolumes[sound.id] || 50) / 100 * (volume / 100);
        
        // Error handling for missing files
        audio.onerror = () => {
          console.log(`WAV not found for ${sound.id}, trying MP3...`);
          audio.src = `/sounds/${sound.id}.mp3`;
        };
        
        audioRefs.current[sound.id] = audio;
      }
    });
  }, [soundVolumes, volume]);

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
      // If no sounds are active, play default Focus.mp3
      if (activeSounds.length === 0 && defaultFocusAudio.current) {
        defaultFocusAudio.current.play().catch(console.error);
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
                  className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <img 
                      src={preset.image} 
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-2">{preset.name}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{preset.description}</p>
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
                  <p className="text-white/90 text-sm mb-4 italic">"{testimonial.quote}"</p>
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