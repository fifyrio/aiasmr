'use client';

/**
 * 推荐码追踪器 - 多层存储确保推荐码在整个用户会话中持久化
 * 支持从首页到注册页面的完整流程
 */
export class ReferralTracker {
  private static readonly STORAGE_KEY = 'aiasmr_ref_code';
  private static readonly COOKIE_KEY = 'aiasmr_ref';
  private static readonly SESSION_KEY = 'aiasmr_session_ref';
  private static readonly EXPIRE_DAYS = 30;

  /**
   * 设置推荐码 - 使用多层存储策略
   */
  static setReferralCode(code: string): void {
    const timestamp = Date.now();
    const expires = timestamp + (this.EXPIRE_DAYS * 24 * 60 * 60 * 1000);

    try {
      // 1. localStorage 存储 (最持久)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          code,
          timestamp,
          expires
        }));
      }

      // 2. sessionStorage 存储 (会话期间)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(this.SESSION_KEY, code);
      }

      // 3. Cookie 存储 (跨页面，服务端可读)
      if (typeof document !== 'undefined') {
        document.cookie = `${this.COOKIE_KEY}=${code}; max-age=${this.EXPIRE_DAYS * 24 * 60 * 60}; path=/; secure; samesite=lax`;
      }

      console.log('[ReferralTracker] Referral code stored:', code);
    } catch (error) {
      console.error('[ReferralTracker] Failed to store referral code:', error);
    }
  }

  /**
   * 获取推荐码 - 按优先级尝试多个存储源
   */
  static getReferralCode(): string | null {
    try {
      // 1. 优先从 sessionStorage 获取 (当前会话最新)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const sessionRef = sessionStorage.getItem(this.SESSION_KEY);
        if (sessionRef) {
          return sessionRef;
        }
      }

      // 2. 从 localStorage 获取 (检查过期时间)
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.expires > Date.now()) {
            // 同步到 sessionStorage
            sessionStorage?.setItem(this.SESSION_KEY, data.code);
            return data.code;
          } else {
            // 过期清理
            localStorage.removeItem(this.STORAGE_KEY);
          }
        }
      }

      // 3. 备选：从 Cookie 获取
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp(`${this.COOKIE_KEY}=([^;]+)`));
        if (match) {
          const code = match[1];
          // 同步到其他存储
          sessionStorage?.setItem(this.SESSION_KEY, code);
          return code;
        }
      }

      return null;
    } catch (error) {
      console.error('[ReferralTracker] Failed to get referral code:', error);
      return null;
    }
  }

  /**
   * 从 URL 提取并存储推荐码
   */
  static extractFromURL(url?: string): string | null {
    try {
      const urlToCheck = url || (typeof window !== 'undefined' ? window.location.href : '');
      if (!urlToCheck) return null;

      const urlObj = new URL(urlToCheck);
      const ref = urlObj.searchParams.get('ref');
      
      if (ref && this.validateReferralCode(ref)) {
        this.setReferralCode(ref);
        return ref;
      }
      
      return null;
    } catch (error) {
      console.error('[ReferralTracker] Failed to extract referral code from URL:', error);
      return null;
    }
  }

  /**
   * 清除推荐码
   */
  static clearReferralCode(): void {
    try {
      // 清除所有存储
      if (typeof window !== 'undefined') {
        localStorage?.removeItem(this.STORAGE_KEY);
        sessionStorage?.removeItem(this.SESSION_KEY);
      }
      
      if (typeof document !== 'undefined') {
        document.cookie = `${this.COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
      
      console.log('[ReferralTracker] Referral code cleared');
    } catch (error) {
      console.error('[ReferralTracker] Failed to clear referral code:', error);
    }
  }

  /**
   * 验证推荐码格式
   */
  private static validateReferralCode(code: string): boolean {
    // 推荐码应该是8位大写字母数字组合
    return /^[A-Z0-9]{8}$/.test(code);
  }

  /**
   * 获取推荐码状态信息（用于调试）
   */
  static getStatus() {
    return {
      localStorage: typeof window !== 'undefined' ? localStorage.getItem(this.STORAGE_KEY) : null,
      sessionStorage: typeof window !== 'undefined' ? sessionStorage.getItem(this.SESSION_KEY) : null,
      cookie: typeof document !== 'undefined' ? 
        document.cookie.match(new RegExp(`${this.COOKIE_KEY}=([^;]+)`))?.[1] : null,
      current: this.getReferralCode()
    };
  }

  /**
   * 在链接中添加推荐码参数
   */
  static appendToUrl(baseUrl: string): string {
    const code = this.getReferralCode();
    if (!code) return baseUrl;
    
    try {
      const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : undefined);
      url.searchParams.set('ref', code);
      return url.toString();
    } catch (error) {
      console.error('[ReferralTracker] Failed to append referral code to URL:', error);
      return baseUrl;
    }
  }
}

// Note: useReferralTracker hook is available in /src/hooks/useReferralTracker.ts