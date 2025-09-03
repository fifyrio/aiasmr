#!/usr/bin/env node

/**
 * 音频格式转换脚本
 * 功能：将 MP3 文件转换为高质量 AAC 格式
 * 使用 FFmpeg 进行音频转换，支持批量处理
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Try to use ffmpeg-static if available, fallback to system ffmpeg
let ffmpegPath = 'ffmpeg';
try {
  ffmpegPath = require('ffmpeg-static') || 'ffmpeg';
} catch (error) {
  // ffmpeg-static not available, use system ffmpeg
}

class AudioConverter {
  constructor() {
    this.sourceDir = path.join(__dirname, '../../public/sounds');
    this.outputDir = path.join(__dirname, '../../temp/sounds-aac');
    this.conversionSettings = {
      codec: 'aac',
      bitrate: '128k',
      sampleRate: '44100',
      channels: '2'
    };
  }

  /**
   * 检查 FFmpeg 是否安装
   */
  async checkFFmpeg() {
    try {
      await execAsync(`"${ffmpegPath}" -version`);
      console.log(`✅ FFmpeg is available at: ${ffmpegPath}`);
      return true;
    } catch (error) {
      console.error('❌ FFmpeg not found.');
      
      // Try to suggest installation methods
      if (ffmpegPath !== 'ffmpeg') {
        console.log('Using ffmpeg-static package, but binary not found.');
        console.log('Try running: npm install ffmpeg-static');
      } else {
        console.log('Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Ubuntu)');
        console.log('Or install via npm: npm install ffmpeg-static');
      }
      return false;
    }
  }

  /**
   * 创建输出目录
   */
  async createOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${this.outputDir}`);
    }
  }

  /**
   * 获取所有 MP3 文件列表
   */
  getMp3Files() {
    if (!fs.existsSync(this.sourceDir)) {
      console.error(`❌ Source directory not found: ${this.sourceDir}`);
      return [];
    }

    const files = fs.readdirSync(this.sourceDir)
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .map(file => ({
        input: path.join(this.sourceDir, file),
        output: path.join(this.outputDir, file.replace('.mp3', '.aac')),
        name: file.replace('.mp3', '')
      }));

    console.log(`🔍 Found ${files.length} MP3 files to convert:`);
    files.forEach(file => console.log(`   - ${file.name}`));

    return files;
  }

  /**
   * 转换单个音频文件
   */
  async convertFile(fileInfo) {
    const { input, output, name } = fileInfo;
    const { codec, bitrate, sampleRate, channels } = this.conversionSettings;

    console.log(`\n🔄 Converting: ${name}.mp3 → ${name}.aac`);

    try {
      // 跳过 ffprobe 检查，直接进行转换
      // const ffprobePath = ffmpegPath.replace('ffmpeg', 'ffprobe');
      // const { stdout: info } = await execAsync(`"${ffprobePath}" -v quiet -show_format -show_streams "${input}"`);
      
      // FFmpeg 转换命令
      const command = [
        `"${ffmpegPath}"`,
        '-y', // 覆盖输出文件
        `-i "${input}"`, // 输入文件
        `-c:a ${codec}`, // 音频编解码器
        `-b:a ${bitrate}`, // 比特率
        `-ar ${sampleRate}`, // 采样率
        `-ac ${channels}`, // 声道数
        '-movflags +faststart', // 优化网络播放
        `"${output}"` // 输出文件
      ].join(' ');

      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command);

      // 检查输出文件是否创建成功
      if (fs.existsSync(output)) {
        const inputStats = fs.statSync(input);
        const outputStats = fs.statSync(output);
        const compressionRatio = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`✅ ${name} converted successfully`);
        console.log(`   Original: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Converted: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Size reduction: ${compressionRatio}%`);
        console.log(`   Processing time: ${processingTime}s`);

        return {
          success: true,
          name,
          originalSize: inputStats.size,
          convertedSize: outputStats.size,
          compressionRatio: parseFloat(compressionRatio),
          processingTime: parseFloat(processingTime)
        };
      } else {
        throw new Error('Output file was not created');
      }
    } catch (error) {
      console.error(`❌ Failed to convert ${name}: ${error.message}`);
      return {
        success: false,
        name,
        error: error.message
      };
    }
  }

  /**
   * 批量转换所有文件
   */
  async convertAll() {
    console.log('🎵 Starting Audio Conversion Process');
    console.log('=====================================');

    // 检查 FFmpeg
    if (!(await this.checkFFmpeg())) {
      process.exit(1);
    }

    // 创建输出目录
    await this.createOutputDir();

    // 获取文件列表
    const files = this.getMp3Files();
    if (files.length === 0) {
      console.log('📭 No MP3 files found to convert');
      return { results: [], summary: null };
    }

    // 转换文件
    const results = [];
    const startTime = Date.now();

    for (const file of files) {
      const result = await this.convertFile(file);
      results.push(result);
    }

    // 生成转换报告
    const summary = this.generateSummary(results, Date.now() - startTime);
    this.printSummary(summary);

    // 保存转换结果到 JSON
    await this.saveResults(results, summary);

    return { results, summary };
  }

  /**
   * 生成转换统计摘要
   */
  generateSummary(results, totalTime) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const totalOriginalSize = successful.reduce((sum, r) => sum + (r.originalSize || 0), 0);
    const totalConvertedSize = successful.reduce((sum, r) => sum + (r.convertedSize || 0), 0);
    const totalCompressionRatio = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalConvertedSize) / totalOriginalSize * 100).toFixed(1)
      : 0;

    return {
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      successful: successful.length,
      failed: failed.length,
      totalOriginalSize,
      totalConvertedSize,
      totalCompressionRatio: parseFloat(totalCompressionRatio),
      totalProcessingTime: (totalTime / 1000).toFixed(2),
      averageProcessingTime: successful.length > 0 
        ? (successful.reduce((sum, r) => sum + (r.processingTime || 0), 0) / successful.length).toFixed(2)
        : 0
    };
  }

  /**
   * 打印转换摘要
   */
  printSummary(summary) {
    console.log('\n🎯 Conversion Summary');
    console.log('====================');
    console.log(`📊 Files processed: ${summary.totalFiles}`);
    console.log(`✅ Successful: ${summary.successful}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`💾 Original total size: ${(summary.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🗜️  Converted total size: ${(summary.totalConvertedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📉 Total size reduction: ${summary.totalCompressionRatio}%`);
    console.log(`⏱️  Total processing time: ${summary.totalProcessingTime}s`);
    console.log(`⚡ Average processing time: ${summary.averageProcessingTime}s per file`);
  }

  /**
   * 保存转换结果到文件
   */
  async saveResults(results, summary) {
    const reportFile = path.join(__dirname, 'conversion-report.json');
    const report = {
      conversion: {
        summary,
        details: results
      }
    };

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
  }

  /**
   * 清理临时文件
   */
  cleanup() {
    console.log('\n🧹 Cleaning up temporary files...');
    // 这里可以添加清理逻辑，如果需要的话
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const converter = new AudioConverter();
  
  converter.convertAll()
    .then(({ results, summary }) => {
      if (summary && summary.failed === 0) {
        console.log('\n🎉 All files converted successfully!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Some files failed to convert. Check the logs above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Conversion process failed:', error.message);
      process.exit(1);
    });
}

module.exports = AudioConverter;