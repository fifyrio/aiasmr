/**
 * ASMR Audio Service
 * 自动生成的音频服务模块
 * 提供音频文件的云端和本地访问功能
 */

import audioConfig from '../config/audio-config.json';

export class ASMRAudioService {
  constructor() {
    this.config = audioConfig;
    this.audioCache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * 获取音频文件 URL
   */
  getAudioUrl(soundId) {
    const sound = this.config.sounds[soundId];
    if (!sound) {
      console.warn(`Sound not found: ${soundId}`);
      return null;
    }

    // 优先使用云端 URL，回退到本地 URL
    return sound.cloudUrl || sound.localUrl;
  }

  /**
   * 预加载音频文件
   */
  async preloadAudio(soundId) {
    if (this.audioCache.has(soundId)) {
      return this.audioCache.get(soundId);
    }

    if (this.loadingPromises.has(soundId)) {
      return this.loadingPromises.get(soundId);
    }

    const loadPromise = this.loadAudio(soundId);
    this.loadingPromises.set(soundId, loadPromise);

    try {
      const audio = await loadPromise;
      this.audioCache.set(soundId, audio);
      this.loadingPromises.delete(soundId);
      return audio;
    } catch (error) {
      this.loadingPromises.delete(soundId);
      throw error;
    }
  }

  /**
   * 加载音频文件
   */
  async loadAudio(soundId) {
    const url = this.getAudioUrl(soundId);
    if (!url) {
      throw new Error(`Audio URL not found for: ${soundId}`);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';
      
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${soundId}`));
      
      audio.src = url;
    });
  }

  /**
   * 按分类获取音频列表
   */
  getSoundsByCategory(category) {
    const categoryConfig = this.config.categories[category];
    if (!categoryConfig) {
      console.warn(`Category not found: ${category}`);
      return [];
    }

    return categoryConfig.sounds.map(soundId => ({
      id: soundId,
      name: this.config.sounds[soundId]?.name || soundId,
      url: this.getAudioUrl(soundId)
    }));
  }

  /**
   * 获取所有可用分类
   */
  getCategories() {
    return Object.keys(this.config.categories);
  }

  /**
   * 清理音频缓存
   */
  clearCache() {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * 获取音频统计信息
   */
  getStats() {
    return {
      totalSounds: Object.keys(this.config.sounds).length,
      categories: Object.keys(this.config.categories).length,
      cachedAudios: this.audioCache.size,
      loadingAudios: this.loadingPromises.size
    };
  }
}

// 导出单例实例
export const audioService = new ASMRAudioService();
export default audioService;
