#!/usr/bin/env node

/**
 * Cloudflare R2 音频上传脚本
 * 功能：将转换后的 AAC 文件上传到 Cloudflare R2 存储
 * 支持批量上传、断点续传、进度显示和错误重试
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { createReadStream, statSync } = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

class R2AudioUploader {
  constructor() {
    this.sourceDir = path.join(__dirname, '../../temp/sounds-aac');
    this.r2Config = this.initializeR2Config();
    this.s3Client = this.createS3Client();
    this.uploadResults = [];
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * 初始化 R2 配置
   */
  initializeR2Config() {
    const config = {
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucketName: process.env.R2_BUCKET_NAME,
      endpoint: process.env.R2_ENDPOINT
    };

    // 验证配置
    const missing = Object.entries(config)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error('❌ Missing R2 configuration:');
      missing.forEach(key => console.error(`   - ${key}`));
      console.error('Please check your .env.local file');
      process.exit(1);
    }

    console.log('✅ R2 configuration loaded');
    console.log(`   Bucket: ${config.bucketName}`);
    console.log(`   Endpoint: ${config.endpoint}`);

    return config;
  }

  /**
   * 创建 S3 客户端（用于 R2）
   */
  createS3Client() {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${this.r2Config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.r2Config.accessKeyId,
        secretAccessKey: this.r2Config.secretAccessKey,
      },
    });
  }

  /**
   * 获取待上传的 AAC 文件列表
   */
  getAacFiles() {
    if (!fs.existsSync(this.sourceDir)) {
      console.error(`❌ Source directory not found: ${this.sourceDir}`);
      console.log('Please run the conversion script first');
      return [];
    }

    const files = fs.readdirSync(this.sourceDir)
      .filter(file => file.toLowerCase().endsWith('.aac'))
      .map(file => {
        const filePath = path.join(this.sourceDir, file);
        const stats = statSync(filePath);
        const fileName = file.replace('.aac', '');
        
        return {
          localPath: filePath,
          fileName: fileName,
          fullFileName: file,
          size: stats.size,
          r2Key: `sounds/${file}`, // R2 中的路径
          publicUrl: `${this.r2Config.endpoint}/sounds/${file}`
        };
      });

    console.log(`🔍 Found ${files.length} AAC files to upload:`);
    files.forEach(file => {
      console.log(`   - ${file.fileName} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    return files;
  }

  /**
   * 检查文件是否已存在于 R2
   */
  async fileExistsInR2(r2Key) {
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.r2Config.bucketName,
        Key: r2Key
      }));
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 生成文件的 ETag（MD5）
   */
  async generateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * 上传单个文件到 R2
   */
  async uploadFile(fileInfo, attempt = 1) {
    const { localPath, fileName, fullFileName, r2Key, size, publicUrl } = fileInfo;
    
    console.log(`\n📤 Uploading: ${fileName} (attempt ${attempt}/${this.retryAttempts})`);
    console.log(`   Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Destination: ${r2Key}`);

    try {
      const startTime = Date.now();

      // 检查文件是否已存在
      const exists = await this.fileExistsInR2(r2Key);
      if (exists) {
        console.log(`⚠️  File already exists in R2: ${r2Key}`);
        return {
          success: true,
          fileName,
          r2Key,
          publicUrl,
          size,
          uploadTime: 0,
          skipped: true,
          message: 'File already exists'
        };
      }

      // 生成文件哈希用于完整性检查
      const fileHash = await this.generateFileHash(localPath);
      
      // 创建文件流
      const fileStream = createReadStream(localPath);
      
      // 上传参数
      const uploadParams = {
        Bucket: this.r2Config.bucketName,
        Key: r2Key,
        Body: fileStream,
        ContentType: 'audio/aac',
        ContentLength: size,
        Metadata: {
          'original-name': fullFileName,
          'file-hash': fileHash,
          'upload-timestamp': new Date().toISOString(),
          'source': 'asmr-audio-pipeline'
        },
        // 设置缓存控制
        CacheControl: 'public, max-age=31536000', // 1 year
      };

      // 执行上传
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      const uploadTime = (Date.now() - startTime) / 1000;
      const speed = (size / 1024 / 1024) / uploadTime; // MB/s

      console.log(`✅ ${fileName} uploaded successfully`);
      console.log(`   Upload time: ${uploadTime.toFixed(2)}s`);
      console.log(`   Upload speed: ${speed.toFixed(2)} MB/s`);
      console.log(`   Public URL: ${publicUrl}`);

      return {
        success: true,
        fileName,
        r2Key,
        publicUrl,
        size,
        uploadTime: parseFloat(uploadTime.toFixed(2)),
        speed: parseFloat(speed.toFixed(2)),
        fileHash,
        skipped: false
      };

    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}: ${error.message}`);

      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying in ${this.retryDelay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.uploadFile(fileInfo, attempt + 1);
      }

      return {
        success: false,
        fileName,
        error: error.message,
        attempts: attempt
      };
    }
  }

  /**
   * 批量上传所有文件
   */
  async uploadAll() {
    console.log('☁️  Starting R2 Upload Process');
    console.log('===============================');

    // 获取文件列表
    const files = this.getAacFiles();
    if (files.length === 0) {
      console.log('📭 No AAC files found to upload');
      return { results: [], summary: null };
    }

    // 上传文件
    const results = [];
    const startTime = Date.now();

    for (const file of files) {
      const result = await this.uploadFile(file);
      results.push(result);
    }

    // 生成上传报告
    const summary = this.generateSummary(results, Date.now() - startTime);
    this.printSummary(summary);

    // 保存上传结果
    await this.saveResults(results, summary);

    return { results, summary };
  }

  /**
   * 生成上传统计摘要
   */
  generateSummary(results, totalTime) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const skipped = results.filter(r => r.success && r.skipped);
    const uploaded = results.filter(r => r.success && !r.skipped);

    const totalSize = successful.reduce((sum, r) => sum + (r.size || 0), 0);
    const totalUploadTime = uploaded.reduce((sum, r) => sum + (r.uploadTime || 0), 0);
    const averageSpeed = uploaded.length > 0
      ? uploaded.reduce((sum, r) => sum + (r.speed || 0), 0) / uploaded.length
      : 0;

    return {
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      successful: successful.length,
      failed: failed.length,
      skipped: skipped.length,
      uploaded: uploaded.length,
      totalSize,
      totalUploadTime: parseFloat(totalUploadTime.toFixed(2)),
      totalProcessTime: (totalTime / 1000).toFixed(2),
      averageSpeed: parseFloat(averageSpeed.toFixed(2)),
      urls: successful.map(r => ({
        fileName: r.fileName,
        publicUrl: r.publicUrl
      }))
    };
  }

  /**
   * 打印上传摘要
   */
  printSummary(summary) {
    console.log('\n☁️  Upload Summary');
    console.log('==================');
    console.log(`📊 Files processed: ${summary.totalFiles}`);
    console.log(`✅ Successful: ${summary.successful}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️  Skipped (already exists): ${summary.skipped}`);
    console.log(`📤 Newly uploaded: ${summary.uploaded}`);
    console.log(`💾 Total uploaded size: ${(summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`⏱️  Total upload time: ${summary.totalUploadTime}s`);
    console.log(`⚡ Average upload speed: ${summary.averageSpeed} MB/s`);
    console.log(`🌐 All files available at: ${this.r2Config.endpoint}/sounds/`);
  }

  /**
   * 保存上传结果到文件
   */
  async saveResults(results, summary) {
    const reportFile = path.join(__dirname, 'upload-report.json');
    const urlsFile = path.join(__dirname, '../audio-urls.json');
    
    // 保存详细报告
    const report = {
      upload: {
        summary,
        details: results
      }
    };
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);

    // 保存 URL 映射（供前端使用）
    const urlMapping = {};
    results.filter(r => r.success).forEach(r => {
      urlMapping[r.fileName] = r.publicUrl;
    });

    fs.writeFileSync(urlsFile, JSON.stringify(urlMapping, null, 2));
    console.log(`🔗 URL mapping saved to: ${urlsFile}`);
  }

  /**
   * 验证上传的文件
   */
  async validateUploads(results) {
    console.log('\n🔍 Validating uploads...');
    const successful = results.filter(r => r.success && !r.skipped);
    
    for (const result of successful) {
      try {
        const response = await fetch(result.publicUrl);
        if (response.ok) {
          console.log(`✅ ${result.fileName} accessible`);
        } else {
          console.log(`⚠️  ${result.fileName} returned status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${result.fileName} validation failed: ${error.message}`);
      }
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const uploader = new R2AudioUploader();
  
  uploader.uploadAll()
    .then(async ({ results, summary }) => {
      if (summary && summary.failed === 0) {
        console.log('\n🎉 All files uploaded successfully!');
        
        // 可选：验证上传的文件是否可访问
        if (process.argv.includes('--validate')) {
          await uploader.validateUploads(results);
        }
        
        process.exit(0);
      } else {
        console.log('\n⚠️  Some files failed to upload. Check the logs above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Upload process failed:', error.message);
      process.exit(1);
    });
}

module.exports = R2AudioUploader;