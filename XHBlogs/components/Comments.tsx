"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { siteConfig } from '../siteConfig';

declare global {
  interface Window {
    twikoo?: {
      init: (options: Record<string, unknown>) => void;
    };
  }
}

function loadTwikoo(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.twikoo) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-twikoo]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Twikoo 脚本加载失败')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://lib.baomitu.com/twikoo/1.7.15/twikoo.all.min.js';
    script.async = true;
    script.dataset.twikoo = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Twikoo 脚本加载失败'));
    document.head.appendChild(script);
  });
}

function commentPath(pathname: string, override?: string) {
  if (override) return override;
  if (pathname.startsWith('/posts/')) return `/${pathname.slice('/posts/'.length)}`;
  return pathname.replace(/\/$/, '') || '/';
}

export default function Comments({ path, compact }: { path?: string; compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        await loadTwikoo();
        if (cancelled || !containerRef.current || !window.twikoo) return;
        containerRef.current.innerHTML = '';
        window.twikoo.init({
          envId: siteConfig.twikooConfig.envId,
          el: containerRef.current,
          path: commentPath(pathname, path),
        });
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.textContent = '评论区加载失败，请稍后刷新。';
        }
        console.error(error);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [pathname, path]);

  return (
    <div className={`w-full relative ${compact ? '' : 'mt-16'}`}>
      {!compact && <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none z-0"></div>}
      <div ref={containerRef} className={`relative z-10 twikoo-glass ${compact ? '' : 'pt-6 border-t border-slate-200/50 dark:border-slate-700/50'}`} />
      <style jsx global>{`
        .twikoo-glass .tk-comments,
        .twikoo-glass .tk-submit {
          color: inherit;
        }
        .twikoo-glass .tk-input,
        .twikoo-glass .tk-meta-input input,
        .twikoo-glass textarea {
          background: rgba(255, 255, 255, 0.12) !important;
          border: 1px solid rgba(148, 163, 184, 0.35) !important;
          border-radius: 16px !important;
        }
        .dark .twikoo-glass .tk-input,
        .dark .twikoo-glass .tk-meta-input input,
        .dark .twikoo-glass textarea {
          background: rgba(15, 23, 42, 0.45) !important;
        }
        .twikoo-glass .tk-preview-container {
          border-radius: 16px !important;
        }
      `}</style>
    </div>
  );
}
