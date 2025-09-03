#!/usr/bin/env node

/**
 * 音频 URL 管理和前端集成脚本
 * 功能：生成音频文件的云端 URL 映射，更新前端配置
 * 支持 URL 验证、缓存管理和自动前端集成
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

class AudioURLManager {
  constructor() {
    this.audioUrlsFile = path.join(__dirname, '../audio-urls.json');
    this.frontendConfigFile = path.join(__dirname, '../../src/config/audio-config.json');
    this.r2Config = this.getR2Config();
    this.audioMapping = this.loadExistingMapping();
  }

  /**
   * 获取 R2 配置
   */
  getR2Config() {
    return {
      bucketName: process.env.R2_BUCKET_NAME,
      endpoint: process.env.R2_ENDPOINT,
      baseUrl: process.env.R2_ENDPOINT
    };
  }

  /**
   * 加载现有的音频映射
   */
  loadExistingMapping() {
    if (fs.existsSync(this.audioUrlsFile)) {
      try {
        const content = fs.readFileSync(this.audioUrlsFile, 'utf8');
        return JSON.parse(content);
      } catch (error) {
        console.log('⚠️  Could not load existing audio URLs, starting fresh');
        return {};
      }
    }
    return {};
  }

  /**
   * 生成完整的音频配置
   */
  generateAudioConfig() {
    console.log('🎵 Generating Audio Configuration');
    console.log('==================================');

    // 基础音频配置
    const audioConfig = {
      metadata: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        description: 'ASMR Music Player Audio Configuration',
        totalFiles: Object.keys(this.audioMapping).length
      },
      r2Config: {
        bucketName: this.r2Config.bucketName,
        baseUrl: this.r2Config.baseUrl,
        pathPrefix: 'sounds/'
      },
      fallback: {
        enabled: true,
        localPath: '/sounds/',
        format: '.mp3'
      },
      sounds: {}
    };

    // 音频文件分类和配置 (基于实际上传的文件)
    const soundCategories = {
      Focus: ['Rain', 'Thunder', 'Wind', 'Birds', 'Fireplace', 'River', 'Cafe', 'Noise'],
      Relax: ['Ocean'],
      Sleep: [],
      Nature: [],
      Ambient: ['Focus']
    };

    // 为每个音频文件生成配置
    Object.entries(this.audioMapping).forEach(([fileName, cloudUrl]) => {
      // 查找文件属于哪个分类
      const category = this.findSoundCategory(fileName, soundCategories);
      
      audioConfig.sounds[fileName] = {
        name: this.formatSoundName(fileName),
        category: category,
        cloudUrl: cloudUrl,
        localUrl: `/sounds/${fileName}.mp3`, // 本地备用
        format: 'aac',
        quality: 'high',
        loop: true,
        preload: 'metadata',
        crossOrigin: 'anonymous'
      };
    });

    // 按分类组织音频
    audioConfig.categories = {};
    Object.entries(soundCategories).forEach(([category, sounds]) => {
      audioConfig.categories[category] = {
        name: category,
        sounds: sounds.filter(soundId => audioConfig.sounds[soundId]),
        count: sounds.filter(soundId => audioConfig.sounds[soundId]).length
      };
    });

    console.log('📊 Audio Configuration Stats:');
    console.log(`   Total sounds: ${audioConfig.metadata.totalFiles}`);
    Object.entries(audioConfig.categories).forEach(([category, info]) => {
      console.log(`   ${category}: ${info.count} sounds`);
    });

    return audioConfig;
  }

  /**
   * 查找音频文件所属分类
   */
  findSoundCategory(fileName, categories) {
    for (const [category, sounds] of Object.entries(categories)) {
      if (sounds.includes(fileName)) {
        return category;
      }
    }
    return 'Ambient'; // 默认分类
  }

  /**
   * 格式化音频文件名称
   */
  formatSoundName(fileName) {
    return fileName
      .split(/(?=[A-Z])/) // 按大写字母分割
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase()); // 首字母大写
  }

  /**
   * 验证音频 URL 可访问性
   */
  async validateUrls(urls) {
    console.log('\n🔍 Validating Audio URLs');
    console.log('==========================');

    const results = {};
    const totalUrls = Object.keys(urls).length;
    let validCount = 0;
    let invalidCount = 0;

    for (const [fileName, url] of Object.entries(urls)) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          results[fileName] = { valid: true, status: response.status };
          validCount++;
          console.log(`✅ ${fileName}: OK (${response.status})`);
        } else {
          results[fileName] = { valid: false, status: response.status, error: response.statusText };
          invalidCount++;
          console.log(`❌ ${fileName}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        results[fileName] = { valid: false, error: error.message };
        invalidCount++;
        console.log(`❌ ${fileName}: ${error.message}`);
      }
    }

    console.log(`\n📊 Validation Results: ${validCount}/${totalUrls} valid, ${invalidCount} invalid`);
    return results;
  }

  /**
   * 生成前端音频服务模块
   */
  generateAudioService() {
    const serviceCode = `/**
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
      console.warn(\`Sound not found: \${soundId}\`);
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
      throw new Error(\`Audio URL not found for: \${soundId}\`);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';
      
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(\`Failed to load audio: \${soundId}\`));
      
      audio.src = url;
    });
  }

  /**
   * 按分类获取音频列表
   */
  getSoundsByCategory(category) {
    const categoryConfig = this.config.categories[category];
    if (!categoryConfig) {
      console.warn(\`Category not found: \${category}\`);
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
`;

    return serviceCode;
  }

  /**
   * 更新前端配置文件
   */
  async updateFrontendConfig() {
    console.log('\n⚙️  Updating Frontend Configuration');
    console.log('====================================');

    // 生成音频配置
    const audioConfig = this.generateAudioConfig();

    // 确保目录存在
    const configDir = path.dirname(this.frontendConfigFile);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`📁 Created config directory: ${configDir}`);
    }

    // 保存配置文件
    fs.writeFileSync(this.frontendConfigFile, JSON.stringify(audioConfig, null, 2));
    console.log(`✅ Audio config saved to: ${this.frontendConfigFile}`);

    // 生成音频服务模块
    const serviceCode = this.generateAudioService();
    const serviceFile = path.join(__dirname, '../../src/services/audio-service.js');
    const serviceDir = path.dirname(serviceFile);

    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
      console.log(`📁 Created services directory: ${serviceDir}`);
    }

    fs.writeFileSync(serviceFile, serviceCode);
    console.log(`✅ Audio service saved to: ${serviceFile}`);

    return audioConfig;
  }

  /**
   * 生成使用文档
   */
  generateDocumentation() {
    const documentation = `# ASMR Audio Service 使用文档

## 简介
这是一个自动生成的音频服务，用于管理 ASMR 音乐播放器的音频资源。

## 使用方法

### 1. 导入服务
\`\`\`javascript
import { audioService } from '@/services/audio-service';
\`\`\`

### 2. 获取音频 URL
\`\`\`javascript
const audioUrl = audioService.getAudioUrl('rain');
\`\`\`

### 3. 预加载音频
\`\`\`javascript
const audio = await audioService.preloadAudio('ocean');
audio.play();
\`\`\`

### 4. 按分类获取音频
\`\`\`javascript
const focusSounds = audioService.getSoundsByCategory('Focus');
\`\`\`

## 音频分类
${Object.entries(this.audioMapping).length > 0 ? Object.keys(this.generateAudioConfig().categories).map(cat => `- **${cat}**`).join('\n') : '- 暂无分类'}

## 可用音频文件
${Object.keys(this.audioMapping).map(sound => `- ${sound}`).join('\n')}

## 注意事项
- 音频文件优先使用云端 URL，失败时自动回退到本地文件
- 服务提供音频缓存功能，避免重复加载
- 支持跨域音频访问
- 所有音频文件都设置为循环播放

## 配置文件位置
- 音频配置：\`src/config/audio-config.json\`
- 音频服务：\`src/services/audio-service.js\`
`;

    const docFile = path.join(__dirname, '../AUDIO_SERVICE_DOCS.md');
    fs.writeFileSync(docFile, documentation);
    console.log(`📖 Documentation saved to: ${docFile}`);

    return documentation;
  }

  /**
   * 执行完整的 URL 管理流程
   */
  async process() {
    console.log('🔗 Starting Audio URL Management Process');
    console.log('=========================================');

    if (Object.keys(this.audioMapping).length === 0) {
      console.log('⚠️  No audio URLs found. Please run the upload script first.');
      process.exit(1);
    }

    try {
      // 验证 URL 可访问性
      const validationResults = await this.validateUrls(this.audioMapping);
      
      // 更新前端配置
      const audioConfig = await this.updateFrontendConfig();
      
      // 生成文档
      this.generateDocumentation();
      
      // 生成摘要报告
      const summary = {
        timestamp: new Date().toISOString(),
        totalSounds: Object.keys(this.audioMapping).length,
        validUrls: Object.values(validationResults).filter(r => r.valid).length,
        invalidUrls: Object.values(validationResults).filter(r => !r.valid).length,
        categories: Object.keys(audioConfig.categories).length,
        filesGenerated: [
          this.frontendConfigFile,
          path.join(__dirname, '../../src/services/audio-service.js'),
          path.join(__dirname, '../AUDIO_SERVICE_DOCS.md')
        ]
      };

      // 保存摘要报告
      const reportFile = path.join(__dirname, 'url-management-report.json');
      fs.writeFileSync(reportFile, JSON.stringify({
        summary,
        validationResults,
        audioConfig
      }, null, 2));

      console.log('\n🎯 URL Management Summary');
      console.log('==========================');
      console.log(`📊 Total sounds: ${summary.totalSounds}`);
      console.log(`✅ Valid URLs: ${summary.validUrls}`);
      console.log(`❌ Invalid URLs: ${summary.invalidUrls}`);
      console.log(`🏷️  Categories: ${summary.categories}`);
      console.log(`📄 Files generated: ${summary.filesGenerated.length}`);
      console.log(`📋 Report saved to: ${reportFile}`);

      return summary;

    } catch (error) {
      console.error('💥 URL management process failed:', error.message);
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const urlManager = new AudioURLManager();
  
  urlManager.process()
    .then(summary => {
      if (summary.invalidUrls === 0) {
        console.log('\n🎉 All URLs validated and frontend updated successfully!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Some URLs are invalid. Please check the validation results.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = AudioURLManager;