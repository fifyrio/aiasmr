# 🎵 ASMR Audio Cloud Pipeline

完整的音频云端化处理系统，将本地 MP3 文件转换为 AAC 格式并上传到 Cloudflare R2，同时自动生成前端配置。

## 🚀 快速开始

### 一键执行完整流程
```bash
npm run audio:process
```

### 查看帮助信息
```bash
npm run audio:help
```

## 📋 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    音频云端化处理系统                         │
├─────────────────────────────────────────────────────────────┤
│  1. 转换层 (convert.js)                                      │
│     ├── MP3 → AAC 格式转换                                   │
│     ├── 压缩优化 (平均压缩率 30-50%)                          │
│     └── 批量处理，支持错误重试                               │
│                                                             │
│  2. 存储层 (upload.js)                                      │
│     ├── Cloudflare R2 云端上传                               │
│     ├── 断点续传，重复文件检测                               │
│     └── 上传验证和完整性检查                                 │
│                                                             │
│  3. 配置层 (url-generator.js)                               │
│     ├── URL 映射生成                                         │
│     ├── 前端配置自动更新                                     │
│     └── 音频服务模块生成                                     │
│                                                             │
│  4. 控制层 (process-audio.js)                               │
│     ├── 一键式完整流程控制                                   │
│     ├── 依赖检查和错误处理                                   │
│     └── 详细日志和报告生成                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📦 依赖要求

### 必需软件
- **Node.js** >= 14.0.0
- **FFmpeg** (用于音频转换)
  ```bash
  # macOS
  brew install ffmpeg
  
  # Ubuntu/Debian
  sudo apt-get install ffmpeg
  
  # Windows
  # 下载并安装 https://ffmpeg.org/download.html
  ```

### 必需的 npm 包
已包含在项目依赖中：
- `@aws-sdk/client-s3` - R2 上传
- `dotenv` - 环境变量管理

### 环境配置
在 `.env.local` 中配置以下变量：
```env
# Cloudflare R2 配置
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_endpoint.r2.dev
```

## 🛠 使用方法

### 完整流程命令

#### 1. 一键完整处理
```bash
npm run audio:process
```
执行完整流程：转换 → 上传 → 配置更新

#### 2. 带选项的处理
```bash
# 跳过转换，只上传现有 AAC 文件
npm run audio:process -- --skip-convert

# 转换并上传，验证结果
npm run audio:process -- --validate

# 完整流程，完成后清理临时文件
npm run audio:process -- --clean

# 模拟运行（不执行实际操作）
npm run audio:process -- --dry-run
```

### 分步执行命令

#### 1. 仅音频转换
```bash
npm run audio:convert
```
- 将 `public/sounds/*.mp3` 转换为 AAC
- 输出到 `temp/sounds-aac/`
- 生成转换报告

#### 2. 仅云端上传
```bash
npm run audio:upload
```
- 上传 `temp/sounds-aac/*.aac` 到 R2
- 自动跳过已存在文件
- 生成 URL 映射文件

#### 3. 仅 URL 管理
```bash
npm run audio:urls
```
- 验证上传的文件可访问性
- 生成前端配置文件
- 创建音频服务模块

## 📁 文件结构

```
scripts/
├── process-audio.js              # 主控制脚本
├── audio-pipeline/
│   ├── convert.js               # 音频格式转换
│   ├── upload.js                # R2 云端上传
│   └── url-generator.js         # URL 管理
├── audio-urls.json              # URL 映射 (自动生成)
└── AUDIO_SERVICE_DOCS.md        # 服务文档 (自动生成)

src/
├── config/
│   └── audio-config.json        # 前端音频配置 (自动生成)
└── services/
    └── audio-service.js         # 音频服务模块 (自动生成)

temp/                            # 临时文件目录
└── sounds-aac/                  # 转换后的 AAC 文件
```

## 🎯 输出文件说明

### 1. `src/config/audio-config.json`
前端音频配置文件，包含：
- 音频文件元数据
- 云端和本地 URL 映射
- 分类信息
- R2 配置

### 2. `src/services/audio-service.js`
音频服务模块，提供：
- 音频文件加载和缓存
- URL 获取和管理
- 分类查询功能
- 错误处理和回退

### 3. `scripts/audio-urls.json`
简单的 URL 映射文件：
```json
{
  "rain": "https://your-r2.dev/sounds/rain.aac",
  "ocean": "https://your-r2.dev/sounds/ocean.aac"
}
```

## 🔧 高级选项

### 命令行参数
```bash
--skip-convert     # 跳过音频格式转换
--skip-upload      # 跳过云端上传
--skip-urls        # 跳过URL管理和前端配置
--validate         # 验证上传的文件可访问性
--clean            # 完成后清理临时文件
--verbose          # 显示详细日志
--dry-run          # 模拟运行，不执行实际操作
-h, --help         # 显示帮助信息
```

### 环境变量覆盖
可通过环境变量临时覆盖配置：
```bash
R2_BUCKET_NAME=test-bucket npm run audio:process
```

## 📊 处理报告

每次运行都会生成详细报告：

### 转换报告
- `scripts/audio-pipeline/conversion-report.json`
- 包含压缩率、处理时间等统计信息

### 上传报告
- `scripts/audio-pipeline/upload-report.json`
- 包含上传速度、成功率等信息

### URL 管理报告
- `scripts/audio-pipeline/url-management-report.json`
- 包含 URL 验证结果和配置信息

### 总体报告
- `scripts/pipeline-report.json`
- 完整流程的汇总报告

## 🎵 前端集成

### 使用音频服务
```javascript
import { audioService } from '@/services/audio-service';

// 获取音频 URL
const audioUrl = audioService.getAudioUrl('rain');

// 预加载音频
const audio = await audioService.preloadAudio('ocean');
audio.play();

// 按分类获取音频
const focusSounds = audioService.getSoundsByCategory('Focus');
```

### 更新 ASMR Music 组件
生成的配置文件可以直接在现有的 ASMR Music 页面中使用，只需要将音频 URL 从本地路径替换为云端 URL。

## ⚠️ 注意事项

### 1. 网络环境
- 上传大文件需要稳定的网络连接
- 海外 R2 可能需要代理

### 2. 成本控制
- R2 存储费用按文件大小计算
- 建议监控存储使用情况

### 3. 缓存策略
- 云端文件设置了 1 年缓存期
- 更新文件需要更改文件名

### 4. 错误处理
- 转换失败会自动重试
- 上传失败会保留本地文件
- 支持断点续传

## 🔍 故障排除

### 常见问题

#### FFmpeg 未找到
```bash
Error: FFmpeg not found
```
**解决方案**: 安装 FFmpeg
```bash
brew install ffmpeg  # macOS
```

#### R2 认证失败
```bash
Error: Access Denied
```
**解决方案**: 检查 `.env.local` 中的 R2 配置

#### 网络连接超时
```bash
Error: Network timeout
```
**解决方案**: 检查网络连接，考虑使用代理

#### 存储空间不足
```bash
Error: No space left
```
**解决方案**: 清理 `temp/` 目录或增加磁盘空间

### 调试技巧

#### 1. 详细日志
```bash
npm run audio:process -- --verbose
```

#### 2. 模拟运行
```bash
npm run audio:process -- --dry-run
```

#### 3. 分步调试
```bash
npm run audio:convert   # 先测试转换
npm run audio:upload    # 再测试上传
```

## 🚀 性能优化

### 转换优化
- AAC 格式比 MP3 压缩率更高
- 默认使用 128kbps，平衡质量和大小
- 支持批量并行处理

### 上传优化
- 自动跳过已存在的文件
- 支持断点续传
- 智能重试机制

### 缓存优化
- R2 文件设置长期缓存
- 前端音频服务提供本地缓存
- 支持预加载和懒加载策略

## 🔄 更新和维护

### 定期任务
1. **检查存储使用情况**
   - 监控 R2 存储费用
   - 清理无用文件

2. **更新音频文件**
   - 添加新音频到 `public/sounds/`
   - 运行 `npm run audio:process`

3. **备份配置**
   - 定期备份生成的配置文件
   - 版本控制管理

### 扩展功能
- 支持更多音频格式
- 添加音频质量选择
- 实现增量更新机制
- 集成 CDN 加速

---

## 📞 支持

如果遇到问题，请：
1. 查看生成的报告文件
2. 使用 `--verbose` 参数获取详细日志
3. 检查环境配置和依赖安装