# ASMR Audio Service 使用文档

## 简介
这是一个自动生成的音频服务，用于管理 ASMR 音乐播放器的音频资源。

## 使用方法

### 1. 导入服务
```javascript
import { audioService } from '@/services/audio-service';
```

### 2. 获取音频 URL
```javascript
const audioUrl = audioService.getAudioUrl('rain');
```

### 3. 预加载音频
```javascript
const audio = await audioService.preloadAudio('ocean');
audio.play();
```

### 4. 按分类获取音频
```javascript
const focusSounds = audioService.getSoundsByCategory('Focus');
```

## 音频分类
- **Focus**
- **Relax**
- **Sleep**
- **Nature**
- **Ambient**

## 可用音频文件
- Birds
- Cafe
- Fireplace
- Focus
- Noise
- Ocean
- Rain
- River
- Thunder
- Wind

## 注意事项
- 音频文件优先使用云端 URL，失败时自动回退到本地文件
- 服务提供音频缓存功能，避免重复加载
- 支持跨域音频访问
- 所有音频文件都设置为循环播放

## 配置文件位置
- 音频配置：`src/config/audio-config.json`
- 音频服务：`src/services/audio-service.js`
