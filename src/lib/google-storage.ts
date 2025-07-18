import { Storage } from '@google-cloud/storage';

export class GoogleStorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    
    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'ai-asmr-videos';
  }

  /**
   * 上传视频到Google Cloud Storage
   */
  async uploadVideo(videoBuffer: Buffer, filename: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      await file.save(videoBuffer, {
        metadata: {
          contentType: 'video/mp4',
          cacheControl: 'public, max-age=31536000',
        },
      });

      // 设置文件为公开可访问
      await file.makePublic();

      return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload video to storage');
    }
  }

  /**
   * 生成签名下载URL
   */
  async generateSignedDownloadUrl(filename: string, expirationMinutes: number = 60): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000,
      });

      return signedUrl;
    } catch (error) {
      console.error('Signed URL generation error:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * 删除视频文件
   */
  async deleteVideo(filename: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      await file.delete();
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete video from storage');
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filename: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      console.error('File existence check error:', error);
      return false;
    }
  }

  /**
   * 获取文件元数据
   */
  async getFileMetadata(filename: string) {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);

      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Metadata retrieval error:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}

// 创建单例实例
export const storageService = new GoogleStorageService(); 