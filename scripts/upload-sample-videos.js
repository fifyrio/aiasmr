#!/usr/bin/env node

const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegStatic = require('ffmpeg-static')

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

// Helper to generate unique filename
function generateUniqueFilename(originalName, prefix) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName)
  const name = path.basename(originalName, ext)
  return `${prefix ? prefix + '-' : ''}${name}-${timestamp}-${random}${ext}`
}

// Extract first frame from video
function extractVideoThumbnail(videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'], // Extract frame at 1 second
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '400x300', // Fixed size for consistency
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
  })
}

// Upload file to R2
async function uploadToR2(filePath, key, contentType) {
  try {
    const fileBuffer = await fs.promises.readFile(filePath)
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })

    await r2Client.send(command)
    
    // Return the public URL
    return `${process.env.R2_ENDPOINT}/${key}`
  } catch (error) {
    console.error('Error uploading to R2:', error)
    throw error
  }
}

// Process and upload video with thumbnail
async function processAndUploadVideo(videoPath, videoTitle) {
  try {
    // Generate unique filenames
    const videoFilename = generateUniqueFilename(path.basename(videoPath), 'video')
    const thumbnailFilename = generateUniqueFilename(`${videoTitle}.jpg`, 'thumbnail')
    
    // Create temporary thumbnail file
    const tempThumbnailPath = path.join('/tmp', `thumbnail-${Date.now()}.jpg`)
    
    // Extract thumbnail
    await extractVideoThumbnail(videoPath, tempThumbnailPath)
    
    // Upload video
    const videoUrl = await uploadToR2(
      videoPath,
      `videos/${videoFilename}`,
      'video/mp4'
    )
    
    // Upload thumbnail
    const thumbnailUrl = await uploadToR2(
      tempThumbnailPath,
      `thumbnails/${thumbnailFilename}`,
      'image/jpeg'
    )
    
    // Clean up temporary thumbnail
    try {
      await fs.promises.unlink(tempThumbnailPath)
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary thumbnail:', cleanupError)
    }
    
    return { videoUrl, thumbnailUrl }
  } catch (error) {
    console.error('Error processing and uploading video:', error)
    throw error
  }
}

// Upload all videos from sample_videos directory
async function uploadSampleVideos() {
  const sampleVideosDir = path.join(process.cwd(), 'sample_videos')
  const results = []
  
  try {
    const files = await fs.promises.readdir(sampleVideosDir)
    const videoFiles = files.filter(file => file.endsWith('.mp4'))
    
    for (const file of videoFiles) {
      const filePath = path.join(sampleVideosDir, file)
      const title = path.basename(file, '.mp4')
      
      console.log(`Processing ${file}...`)
      
      try {
        const { videoUrl, thumbnailUrl } = await processAndUploadVideo(filePath, title)
        
        results.push({
          id: `fallback-${results.length + 1}`,
          title,
          videoUrl,
          thumbnailUrl,
          originalFilename: file
        })
        
        console.log(`✓ Uploaded ${file}`)
      } catch (error) {
        console.error(`✗ Failed to upload ${file}:`, error)
      }
    }
    
    return results
  } catch (error) {
    console.error('Error reading sample videos directory:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('Starting to upload sample videos to Cloudflare R2...')
    console.log('This may take a few minutes depending on video sizes.')
    
    const results = await uploadSampleVideos()
    
    console.log('\n=== Upload Results ===')
    console.log(`Successfully uploaded ${results.length} videos:`)
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`)
      console.log(`   Video URL: ${result.videoUrl}`)
      console.log(`   Thumbnail URL: ${result.thumbnailUrl}`)
    })
    
    // Output the data structure for updating getFallbackVideos
    console.log('\n=== Data for getFallbackVideos() ===')
    console.log('Copy the following structure to update your getFallbackVideos function:')
    console.log('\nconst uploadedVideos = ')
    console.log(JSON.stringify(results, null, 2))
    
  } catch (error) {
    console.error('Error uploading videos:', error)
    process.exit(1)
  }
}

main()