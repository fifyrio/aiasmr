// Credit calculation based on provider, model, duration, and quality

export interface VideoOptions {
  provider: 'runway' | 'veo3';
  model?: string; // For VEO3: 'veo3_fast' or 'veo3'
  duration?: 5 | 8; // For Runway only
  quality?: '720p' | '1080p';
}

export function calculateCredits(options: VideoOptions): number {
  const { provider, model, duration, quality } = options;
  
  if (provider === 'runway') {
    // Runway credit calculation based on duration and quality
    if (duration === 8 && quality === '720p') {
      return 30;
    } else if (duration === 5 && quality === '720p') {
      return 12;
    }
    // Default fallback (shouldn't happen with proper validation)
    return 12;
  } else if (provider === 'veo3') {
    // VEO3 credit calculation based on model
    if (model === 'veo3_fast') {
      return 60;
    } else if (model === 'veo3') {
      return 300;
    }
    // Default to veo3_fast if no model specified
    return 60;
  }
  
  // Default fallback
  return 20;
}

export function getProviderModelOptions(provider: 'runway' | 'veo3') {
  if (provider === 'runway') {
    return [
      { value: 'runway-duration-5-generate', label: 'Runway Gen3', description: 'Fast Generation' }
    ];
  } else {
    return [
      { value: 'veo3_fast', label: 'VEO3 Fast', description: 'Quick generation' },
      { value: 'veo3', label: 'VEO3 Standard', description: 'High quality' }
    ];
  }
}

export function getAvailableDurations(provider: 'runway' | 'veo3'): (5 | 8)[] {
  if (provider === 'runway') {
    return [5, 8];
  } else {
    // VEO3 doesn't support duration selection
    return [];
  }
}

export function getAvailableAspectRatios(provider: 'runway' | 'veo3'): string[] {
  // Both providers now only support 16:9 and 9:16
  return ['16:9', '9:16'];
}