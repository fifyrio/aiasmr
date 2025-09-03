#!/usr/bin/env node

/**
 * ASMR 音频云端化主控制脚本
 * 功能：一键执行完整的音频处理流程
 * 包含：转换、上传、URL管理和前端集成
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 导入处理模块
const AudioConverter = require('./audio-pipeline/convert');
const R2AudioUploader = require('./audio-pipeline/upload');
const AudioURLManager = require('./audio-pipeline/url-generator');

class AudioPipelineManager {
  constructor() {
    this.startTime = Date.now();
    this.processLog = [];
    this.options = this.parseCommandLineOptions();
  }

  /**
   * 解析命令行参数
   */
  parseCommandLineOptions() {
    const args = process.argv.slice(2);
    return {
      skipConversion: args.includes('--skip-convert'),
      skipUpload: args.includes('--skip-upload'),
      skipUrlGen: args.includes('--skip-urls'),
      validateUrls: args.includes('--validate'),
      cleanTemp: args.includes('--clean'),
      verbose: args.includes('--verbose'),
      dryRun: args.includes('--dry-run'),
      help: args.includes('--help') || args.includes('-h')
    };
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    const help = `
🎵 ASMR Audio Cloud Pipeline

一键将本地 MP3 文件转换为 AAC 并上传到 Cloudflare R2

使用方法:
  node scripts/process-audio.js [选项]

选项:
  --skip-convert     跳过音频格式转换
  --skip-upload      跳过云端上传
  --skip-urls        跳过URL管理和前端配置
  --validate         验证上传的文件可访问性
  --clean            完成后清理临时文件
  --verbose          显示详细日志
  --dry-run          模拟运行，不执行实际操作
  -h, --help         显示此帮助信息

示例:
  # 完整流程
  node scripts/process-audio.js

  # 只上传（跳过转换）
  node scripts/process-audio.js --skip-convert

  # 转换并上传，验证结果
  node scripts/process-audio.js --validate

  # 完整流程，完成后清理
  node scripts/process-audio.js --clean

依赖要求:
  - FFmpeg (用于音频转换)
  - Node.js AWS SDK (用于 R2 上传)
  - 配置好的 .env.local 文件

配置文件:
  .env.local 需要包含以下配置:
  - R2_ACCOUNT_ID
  - R2_ACCESS_KEY_ID  
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET_NAME
  - R2_ENDPOINT
`;
    console.log(help);
  }

  /**
   * 记录处理步骤
   */
  log(step, status, message = '', data = {}) {
    const logEntry = {
      step,
      status,
      message,
      timestamp: new Date().toISOString(),
      data
    };
    this.processLog.push(logEntry);

    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'start' ? '🚀' : 'ℹ️';
    console.log(`${emoji} [${step.toUpperCase()}] ${message}`);
    
    if (this.options.verbose && Object.keys(data).length > 0) {
      console.log('   Data:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * 检查环境依赖
   */
  async checkDependencies() {
    this.log('deps', 'start', 'Checking dependencies...');

    const checks = [];

    // 检查 Node.js 版本
    const nodeVersion = process.version;
    checks.push({
      name: 'Node.js',
      required: '>=14.0.0',
      current: nodeVersion,
      status: 'ok'
    });

    // 检查 FFmpeg
    let ffmpegPath = 'ffmpeg';
    try {
      // Try ffmpeg-static first
      ffmpegPath = require('ffmpeg-static') || 'ffmpeg';
      execSync(`"${ffmpegPath}" -version`, { stdio: 'ignore' });
      checks.push({
        name: 'FFmpeg',
        required: 'any',
        current: ffmpegPath.includes('node_modules') ? 'ffmpeg-static' : 'system',
        status: 'ok'
      });
    } catch (error) {
      // Try system ffmpeg as fallback
      try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        checks.push({
          name: 'FFmpeg',
          required: 'any',
          current: 'system',
          status: 'ok'
        });
      } catch (systemError) {
        checks.push({
          name: 'FFmpeg',
          required: 'any',
          current: 'missing',
          status: 'error'
        });
      }
    }

    // 检查必要的 npm 包
    const requiredPackages = ['@aws-sdk/client-s3', 'dotenv'];
    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
        checks.push({
          name: pkg,
          required: 'installed',
          current: 'found',
          status: 'ok'
        });
      } catch (error) {
        checks.push({
          name: pkg,
          required: 'installed',
          current: 'missing',
          status: 'error'
        });
      }
    }

    // 检查环境变量
    const requiredEnvVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_ENDPOINT'];
    require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
    
    for (const envVar of requiredEnvVars) {
      checks.push({
        name: envVar,
        required: 'configured',
        current: process.env[envVar] ? 'set' : 'missing',
        status: process.env[envVar] ? 'ok' : 'error'
      });
    }

    const errors = checks.filter(check => check.status === 'error');
    if (errors.length > 0) {
      this.log('deps', 'error', 'Missing dependencies:', { errors });
      console.log('\n❌ Please fix the following issues:');
      errors.forEach(error => {
        console.log(`   - ${error.name}: ${error.current} (required: ${error.required})`);
      });
      process.exit(1);
    }

    this.log('deps', 'success', 'All dependencies satisfied', { checks });
  }

  /**
   * 执行音频转换
   */
  async executeConversion() {
    if (this.options.skipConversion) {
      this.log('convert', 'info', 'Skipped audio conversion');
      return { skipped: true };
    }

    this.log('convert', 'start', 'Starting audio conversion (MP3 → AAC)...');

    if (this.options.dryRun) {
      this.log('convert', 'info', 'Dry run: would convert audio files');
      return { dryRun: true };
    }

    try {
      const converter = new AudioConverter();
      const result = await converter.convertAll();
      
      this.log('convert', 'success', 'Audio conversion completed', {
        successful: result.summary?.successful || 0,
        failed: result.summary?.failed || 0,
        compressionRatio: result.summary?.totalCompressionRatio || 0
      });

      return result;
    } catch (error) {
      this.log('convert', 'error', `Conversion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行云端上传
   */
  async executeUpload() {
    if (this.options.skipUpload) {
      this.log('upload', 'info', 'Skipped cloud upload');
      return { skipped: true };
    }

    this.log('upload', 'start', 'Starting cloud upload to R2...');

    if (this.options.dryRun) {
      this.log('upload', 'info', 'Dry run: would upload files to R2');
      return { dryRun: true };
    }

    try {
      const uploader = new R2AudioUploader();
      const result = await uploader.uploadAll();
      
      this.log('upload', 'success', 'Cloud upload completed', {
        successful: result.summary?.successful || 0,
        failed: result.summary?.failed || 0,
        totalSize: result.summary?.totalSize || 0
      });

      return result;
    } catch (error) {
      this.log('upload', 'error', `Upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行 URL 管理和前端配置
   */
  async executeUrlManagement() {
    if (this.options.skipUrlGen) {
      this.log('urls', 'info', 'Skipped URL management');
      return { skipped: true };
    }

    this.log('urls', 'start', 'Generating URLs and updating frontend config...');

    if (this.options.dryRun) {
      this.log('urls', 'info', 'Dry run: would generate URLs and update config');
      return { dryRun: true };
    }

    try {
      const urlManager = new AudioURLManager();
      const result = await urlManager.process();
      
      this.log('urls', 'success', 'URL management completed', {
        totalSounds: result.totalSounds,
        validUrls: result.validUrls,
        categories: result.categories
      });

      return result;
    } catch (error) {
      this.log('urls', 'error', `URL management failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 清理临时文件
   */
  async cleanup() {
    if (!this.options.cleanTemp) {
      return;
    }

    this.log('cleanup', 'start', 'Cleaning up temporary files...');

    try {
      const tempDir = path.join(__dirname, '../temp');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        this.log('cleanup', 'success', 'Temporary files cleaned');
      } else {
        this.log('cleanup', 'info', 'No temporary files to clean');
      }
    } catch (error) {
      this.log('cleanup', 'error', `Cleanup failed: ${error.message}`);
    }
  }

  /**
   * 生成最终报告
   */
  generateFinalReport() {
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const successSteps = this.processLog.filter(entry => entry.status === 'success').length;
    const errorSteps = this.processLog.filter(entry => entry.status === 'error').length;

    const report = {
      summary: {
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString(),
        totalTime: parseFloat(totalTime),
        successSteps,
        errorSteps,
        options: this.options
      },
      steps: this.processLog
    };

    // 保存详细报告
    const reportFile = path.join(__dirname, 'pipeline-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log('\n🎯 Final Report');
    console.log('================');
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log(`✅ Successful steps: ${successSteps}`);
    console.log(`❌ Failed steps: ${errorSteps}`);
    console.log(`📋 Detailed report: ${reportFile}`);

    return report;
  }

  /**
   * 执行完整的音频处理流程
   */
  async run() {
    try {
      console.log('🎵 ASMR Audio Cloud Pipeline');
      console.log('=============================');
      console.log(`Started at: ${new Date(this.startTime).toISOString()}`);
      
      if (this.options.dryRun) {
        console.log('🧪 DRY RUN MODE - No actual operations will be performed');
      }

      // 检查依赖
      await this.checkDependencies();

      // 执行转换
      const conversionResult = await this.executeConversion();

      // 执行上传
      const uploadResult = await this.executeUpload();

      // 执行 URL 管理
      const urlResult = await this.executeUrlManagement();

      // 清理临时文件
      await this.cleanup();

      // 生成最终报告
      const report = this.generateFinalReport();

      // 成功完成
      if (report.summary.errorSteps === 0) {
        console.log('\n🎉 Pipeline completed successfully!');
        
        if (!this.options.dryRun) {
          console.log('\n📝 Next Steps:');
          console.log('1. Check the generated audio-config.json');
          console.log('2. Update your ASMR Music component to use the audio service');
          console.log('3. Test the audio playback with cloud URLs');
        }
        
        process.exit(0);
      } else {
        console.log('\n⚠️  Pipeline completed with errors. Check the logs above.');
        process.exit(1);
      }

    } catch (error) {
      console.error('\n💥 Pipeline failed:', error.message);
      console.error('Stack trace:', error.stack);
      
      this.generateFinalReport();
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const pipeline = new AudioPipelineManager();
  
  if (pipeline.options.help) {
    pipeline.showHelp();
    process.exit(0);
  }

  pipeline.run();
}

module.exports = AudioPipelineManager;