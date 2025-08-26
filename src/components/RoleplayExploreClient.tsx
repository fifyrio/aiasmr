'use client';

import { useState, useEffect } from 'react';
import AOS from 'aos';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

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

interface RoleplayExploreClientProps {
  templates: Template[];
}

export default function RoleplayExploreClient({ templates }: RoleplayExploreClientProps) {
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const t = useTranslations('roleplayExplore');

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
              <i className="ri-arrow-left-line"></i> {t('navigation.backToExplore')}
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <i className="ri-user-star-line mr-3 text-purple-300"></i>
            {t('header.title')} <span className="text-purple-300">{t('header.collections')}</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {t('header.description')}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-white font-semibold">
                <i className="ri-play-line mr-2"></i>
                {t('header.stats.templates', { count: templates.length })}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-white font-semibold">
                <i className="ri-star-line mr-2"></i>
                {t('header.stats.scenarios')}
              </span>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105"
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
                  {t('template.browserNotSupported')}
                </video>
                
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded">
                          {formatRatio(template.ratio)}
                        </div>
                        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {template.duration}
                        </div>
                      </div>
                      <Link
                        href={`/veo3?template=${template.id}`}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <i className="ri-magic-line mr-1"></i>
                        {t('template.generate')}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Template Type Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    <i className="ri-user-star-line mr-1"></i>
                    {t('template.roleplay')}
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
                        tag.toLowerCase() === 'roleplay' 
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-300 border border-pink-400/30'
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
                    {t('template.copyPrompt')}
                  </button>
                  
                  <Link
                    href={`/veo3?template=${template.id}`}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="ri-magic-line mr-2"></i>
                    {t('template.useTemplate')}
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
              <i className="ri-user-star-line text-6xl text-white/50 mb-6"></i>
              <h3 className="text-2xl font-bold text-white mb-4">{t('emptyState.title')}</h3>
              <p className="text-white/70 mb-6">
                {t('emptyState.description')}
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all duration-200"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                {t('emptyState.exploreAllButton')}
              </Link>
            </div>
          </div>
        )}

        {/* Roleplay FAQ Section */}
        <div className="mt-16" data-aos="fade-up">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                <i className="ri-question-line mr-3 text-purple-300"></i>
                {t('faq.title')} <span className="text-purple-300">FAQ</span>
              </h2>
              <p className="text-white/80 text-lg max-w-3xl mx-auto">
                {t('faq.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* FAQ Item 1 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-user-star-line mr-2 text-purple-300"></i>
                  {t('faq.questions.popular.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.popular.answer')}
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-mic-line mr-2 text-pink-300"></i>
                  {t('faq.questions.equipment.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.equipment.answer')}
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-time-line mr-2 text-blue-300"></i>
                  {t('faq.questions.duration.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.duration.answer')}
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-emotion-line mr-2 text-green-300"></i>
                  {t('faq.questions.authentic.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.authentic.answer')}
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-volume-down-line mr-2 text-yellow-300"></i>
                  {t('faq.questions.triggers.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.triggers.answer')}
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-camera-line mr-2 text-orange-300"></i>
                  {t('faq.questions.audioVideo.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.audioVideo.answer')}
                </p>
              </div>

              {/* FAQ Item 7 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-heart-line mr-2 text-red-300"></i>
                  {t('faq.questions.requests.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.requests.answer')}
                </p>
              </div>

              {/* FAQ Item 8 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <i className="ri-money-dollar-circle-line mr-2 text-cyan-300"></i>
                  {t('faq.questions.monetize.question')}
                </h3>
                <p className="text-white/80 text-sm">
                  {t('faq.questions.monetize.answer')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16" data-aos="fade-up">
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/veo3"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <i className="ri-magic-line mr-2"></i>
                {t('cta.startCreating')}
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full transition-all duration-300"
              >
                <i className="ri-grid-line mr-2"></i>
                {t('cta.browseAll')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}