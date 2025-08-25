'use client';

import { useState, useEffect } from 'react';
import AOS from 'aos';
import Link from 'next/link';

interface Template {
  id: number;
  title: string;
  category: string[];
  ratio: string;
  duration: string;
  downloads: string;
  prompt: string;
  tags: string[];
  similar: number[];
  video: string;
  poster: string;
  hasAudio: boolean;
}

interface RelaxingExploreClientProps {
  templates: Template[];
}

export default function RelaxingExploreClient({ templates }: RelaxingExploreClientProps) {
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      // Simple feedback - you could add a toast here
      console.log('Prompt copied to clipboard');
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const formatRatio = (ratio: string) => {
    switch (ratio) {
      case 'ratio-16-9': return '16:9';
      case 'ratio-9-16': return '9:16';
      case 'ratio-1-1': return '1:1';
      case 'ratio-4-3': return '4:3';
      case 'ratio-3-4': return '3:4';
      default: return '16:9';
    }
  };

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="flex items-center justify-center mb-4">
            <Link 
              href="/explore" 
              className="text-white/70 hover:text-white transition-colors mr-3"
            >
              <i className="ri-arrow-left-line"></i> Back to Explore
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <i className="ri-leaf-line mr-3 text-green-300"></i>
            Relax <span className="text-green-300">Collections</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Find your perfect path to relaxation with our carefully curated collection of peaceful ASMR templates. 
            Designed to help you unwind, reduce stress, and achieve tranquility.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-white font-semibold">
                <i className="ri-play-line mr-2"></i>
                {templates.length} Templates
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-white font-semibold">
                <i className="ri-heart-line mr-2"></i>
                Stress Relief Focus
              </span>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12" data-aos="fade-up">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-600/10 backdrop-blur-sm border border-green-400/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              <i className="ri-heart-pulse-line mr-2 text-green-300"></i>
              Benefits of Relaxing ASMR
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-moon-line text-2xl text-white"></i>
                </div>
                <h3 className="text-white font-semibold mb-2">Better Sleep</h3>
                <p className="text-white/70 text-sm">Gentle sounds and visuals help calm your mind for restful sleep</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-heart-line text-2xl text-white"></i>
                </div>
                <h3 className="text-white font-semibold mb-2">Stress Relief</h3>
                <p className="text-white/70 text-sm">Reduce anxiety and tension with soothing ASMR triggers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-focus-line text-2xl text-white"></i>
                </div>
                <h3 className="text-white font-semibold mb-2">Mental Focus</h3>
                <p className="text-white/70 text-sm">Improve concentration and mindfulness through relaxation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105"
              data-aos="fade-up"
              data-aos-delay={index * 100}
              onMouseEnter={() => setHoveredVideo(template.id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              {/* Video Container */}
              <div className="relative aspect-video bg-black/50">
                <video
                  src={template.video}
                  poster={template.poster}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  {...(hoveredVideo === template.id ? { autoPlay: true } : {})}
                >
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-600/90 text-white text-xs px-2 py-1 rounded">
                          {formatRatio(template.ratio)}
                        </div>
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {template.duration}
                        </div>
                      </div>
                      <Link
                        href={`/veo3?template=${template.id}`}
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <i className="ri-magic-line mr-1"></i>
                        Generate
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Template Type Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    <i className="ri-leaf-line mr-1"></i>
                    Relaxing
                  </div>
                </div>

                {/* Downloads Badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                    <i className="ri-download-line mr-1"></i>
                    {template.downloads}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-white text-lg font-semibold mb-3 line-clamp-2">
                  {template.title}
                </h3>
                
                <p className="text-white/70 text-sm mb-4 line-clamp-3">
                  {template.prompt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        tag.toLowerCase() === 'relaxing' 
                          ? 'bg-gradient-to-r from-green-500/20 to-blue-600/20 text-green-300 border border-green-400/30'
                          : 'bg-white/10 text-white/80 border border-white/20'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/60">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => copyPrompt(template.prompt)}
                    className="flex items-center text-white/70 hover:text-white text-sm transition-colors"
                  >
                    <i className="ri-file-copy-line mr-2"></i>
                    Copy Prompt
                  </button>
                  
                  <Link
                    href={`/veo3?template=${template.id}`}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="ri-magic-line mr-2"></i>
                    Use Template
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center py-16" data-aos="fade-up">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto">
              <i className="ri-leaf-line text-6xl text-white/50 mb-6"></i>
              <h3 className="text-2xl font-bold text-white mb-4">No Relax Collections Found</h3>
              <p className="text-white/70 mb-6">
                We&apos;re continuously adding new relaxing content. Check back soon for more peaceful ASMR templates!
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-full transition-all duration-200"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Explore All Templates
              </Link>
            </div>
          </div>
        )}

        {/* Relaxation Tips */}
        <div className="mt-16" data-aos="fade-up">
          <div className="bg-gradient-to-r from-green-500/20 to-blue-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              <i className="ri-lightbulb-line mr-2 text-green-300"></i>
              Tips for Maximum Relaxation
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-headphone-line text-green-300 text-xl"></i>
                </div>
                <h3 className="text-white font-semibold mb-2">Use Headphones</h3>
                <p className="text-white/70 text-sm">Experience the full stereo effect for better immersion</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-volume-down-line text-blue-300 text-xl"></i>
                </div>
                <h3 className="text-white font-semibold mb-2">Low Volume</h3>
                <p className="text-white/70 text-sm">Keep volume comfortable to avoid startling effects</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-moon-clear-line text-purple-300 text-xl"></i>
                </div>
                <h3 className="text-white font-semibold mb-2">Dim Lighting</h3>
                <p className="text-white/70 text-sm">Create a calm environment with soft lighting</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-timer-line text-pink-300 text-xl"></i>
                </div>
                <h3 className="text-white font-semibold mb-2">Regular Schedule</h3>
                <p className="text-white/70 text-sm">Watch consistently for better relaxation effects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Relaxing ASMR FAQ Section */}
        <div className="mt-16" data-aos="fade-up">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                <i className="ri-question-line mr-3 text-green-300"></i>
                Relaxing ASMR <span className="text-green-300">FAQ</span>
              </h2>
              <p className="text-white/80 text-lg max-w-3xl mx-auto">
                Your guide to creating and enjoying peaceful, stress-relieving ASMR content
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* FAQ Item 1 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-leaf-line mr-2 text-green-300"></i>
                  What makes ASMR effective for relaxation?
                </h3>
                <p className="text-white/80 text-sm">
                  ASMR triggers the parasympathetic nervous system, lowering heart rate and cortisol levels. Gentle, repetitive sounds and visuals create a meditative state that naturally reduces stress and anxiety.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-moon-line mr-2 text-blue-300"></i>
                  Can ASMR really help with sleep problems?
                </h3>
                <p className="text-white/80 text-sm">
                  Yes! Studies show ASMR can improve sleep quality by reducing racing thoughts, muscle tension, and anxiety. The slow, rhythmic nature of relaxing ASMR naturally prepares your mind and body for rest.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-timer-line mr-2 text-purple-300"></i>
                  What&apos;s the best time to watch relaxing ASMR?
                </h3>
                <p className="text-white/80 text-sm">
                  Evening hours (1-2 hours before bed) are ideal for sleep-focused content. For stress relief, any time you feel overwhelmed works. Morning sessions can set a calm tone for your entire day.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-headphone-line mr-2 text-yellow-300"></i>
                  Do I need special headphones for relaxing ASMR?
                </h3>
                <p className="text-white/80 text-sm">
                  While any headphones work, comfortable over-ear or high-quality earbuds enhance the experience. Avoid noise-canceling for bedtime use, as you want to remain aware of your environment.
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-volume-down-line mr-2 text-pink-300"></i>
                  What&apos;s the optimal volume for relaxing ASMR?
                </h3>
                <p className="text-white/80 text-sm">
                  Keep volume low - around 20-30% of your device&apos;s maximum. The sounds should be clearly audible but not dominating. If you can&apos;t hear gentle background noises, it&apos;s too loud.
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-heart-pulse-line mr-2 text-red-300"></i>
                  Can ASMR help with anxiety and depression?
                </h3>
                <p className="text-white/80 text-sm">
                  ASMR can be a helpful complementary tool for managing anxiety and mild depression symptoms. The relaxation response and sense of personal attention can provide comfort, though it&apos;s not a replacement for professional treatment.
                </p>
              </div>

              {/* FAQ Item 7 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-focus-line mr-2 text-orange-300"></i>
                  Why don&apos;t I feel ASMR tingles?
                </h3>
                <p className="text-white/80 text-sm">
                  Not everyone experiences tingles, and that&apos;s completely normal! You can still benefit from the relaxation, stress relief, and sleep improvement that ASMR provides, even without the tingling sensation.
                </p>
              </div>

              {/* FAQ Item 8 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-refresh-line mr-2 text-cyan-300"></i>
                  How often should I watch relaxing ASMR?
                </h3>
                <p className="text-white/80 text-sm">
                  Daily viewing is safe and beneficial. Many people incorporate ASMR into their nightly routine or use it during stressful periods. Listen to your body and adjust frequency based on your needs.
                </p>
              </div>

              {/* FAQ Item 9 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-lightbulb-line mr-2 text-indigo-300"></i>
                  What triggers work best for deep relaxation?
                </h3>
                <p className="text-white/80 text-sm">
                  Gentle tapping, soft brushing sounds, whispered speech, page turning, and nature sounds are highly effective. Personal preference varies, so experiment to find your most relaxing triggers.
                </p>
              </div>

              {/* FAQ Item 10 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-shield-check-line mr-2 text-teal-300"></i>
                  Is it safe to fall asleep to ASMR videos?
                </h3>
                <p className="text-white/80 text-sm">
                  Yes, it&apos;s perfectly safe! Many videos are designed specifically for sleep. Use a sleep timer to conserve battery, and ensure your device won&apos;t disturb you with notifications or autoplay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16" data-aos="fade-up">
          <div className="bg-gradient-to-r from-green-500/20 to-blue-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Create Your Relaxing ASMR Content?
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Transform these peaceful templates into personalized relaxation videos. 
              Perfect for sleep aids, meditation guides, and stress relief content.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/veo3"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <i className="ri-magic-line mr-2"></i>
                Start Creating with VEO3
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full transition-all duration-300"
              >
                <i className="ri-grid-line mr-2"></i>
                Browse All Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}