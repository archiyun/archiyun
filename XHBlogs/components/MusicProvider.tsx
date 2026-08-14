"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { siteConfig } from '../siteConfig';

type PlayMode = 'loop' | 'single' | 'random';

interface MusicContextType {
  playlist: any[];
  currentIndex: number;
  currentSong: any;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;
  isShuffle: boolean;

  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playSong: (index: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
  toggleShuffle: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

function getConfiguredIds(): string[] {
  const youtubeIds = (siteConfig as { youtubeMusicIds?: string[] }).youtubeMusicIds || [];
  if (youtubeIds.length > 0) return youtubeIds;
  return siteConfig.cloudMusicIds || [];
}

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const win = window as any;
  if (win.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    const prev = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve();
    };
    if (!existing) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    if (win.YT?.Player) resolve();
  });
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyric, setCurrentLyric] = useState("正在连接 YouTube Music...");
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>(() => {
    if (typeof window === 'undefined') return 'loop';
    try {
      return localStorage.getItem('music-shuffle') === '1' ? 'random' : 'loop';
    } catch {
      return 'loop';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('music-shuffle', playMode === 'random' ? '1' : '0');
    } catch { /* ignore */ }
  }, [playMode]);

  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(false);
  const playModeRef = useRef<PlayMode>('loop');
  const playlistLengthRef = useRef(0);
  const volumeRef = useRef(1);
  const isMutedRef = useRef(false);

  isPlayingRef.current = isPlaying;
  playModeRef.current = playMode;
  playlistLengthRef.current = playlist.length;
  volumeRef.current = volume;
  isMutedRef.current = isMuted;

  useEffect(() => {
    let isMounted = true;
    const ids = getConfiguredIds();

    const fetchMusicData = async () => {
      try {
        const res = await fetch(`/api/music?ids=${ids.map(encodeURIComponent).join(',')}`);
        const rawResults = await res.json();
        const mergedPlaylist = (Array.isArray(rawResults) ? rawResults : [])
          .filter((song: any) => song && song.id && !song.error)
          .map((song: any) => ({
            id: song.id,
            title: song.name || '未知歌曲',
            artist: song.artist || song.author || 'YouTube Music',
            cover: song.cover || `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`,
            lyrics: [],
          }));

        if (isMounted) {
          if (mergedPlaylist.length > 0) {
            setPlaylist(mergedPlaylist);
            setCurrentLyric('YouTube Music');
          } else {
            setCurrentLyric('歌单为空或无法解析');
          }
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setCurrentLyric('网络初始化失败');
          setIsLoading(false);
        }
      }
    };

    if (ids.length > 0) fetchMusicData();
    else setIsLoading(false);

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (playlist.length === 0 || !containerRef.current) return;
    let destroyed = false;

    const initPlayer = async () => {
      await loadYouTubeAPI();
      if (destroyed || playerRef.current) return;

      const win = window as any;
      playerRef.current = new win.YT.Player(containerRef.current, {
        height: '180',
        width: '320',
        videoId: playlist[currentIndex]?.id,
        host: 'https://www.youtube.com',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            playerReadyRef.current = true;
            event.target.setVolume(isMutedRef.current ? 0 : volumeRef.current * 100);
            if (isPlayingRef.current) event.target.playVideo();
          },
          onStateChange: (event: any) => {
            const state = event.data;
            if (state === win.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (state === win.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (state === win.YT.PlayerState.ENDED) {
              if (playModeRef.current === 'single') {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } else {
                setIsPlaying(true);
                if (playModeRef.current === 'random') {
                  const len = playlistLengthRef.current;
                  if (len <= 1) {
                    event.target.seekTo(0, true);
                    event.target.playVideo();
                  } else {
                    setCurrentIndex((prev) => {
                      let next = Math.floor(Math.random() * len);
                      if (next === prev) next = (next + 1) % len;
                      return next;
                    });
                  }
                } else {
                  setCurrentIndex((prev) => (prev + 1) % playlistLengthRef.current);
                }
              }
            }
          },
        },
      });
    };

    initPlayer();

    return () => {
      destroyed = true;
    };
  }, [playlist.length]);

  useEffect(() => {
    const player = playerRef.current;
    if (!playerReadyRef.current || !player?.loadVideoById) return;
    const videoId = playlist[currentIndex]?.id;
    if (!videoId) return;
    player.loadVideoById(videoId);
    if (isPlayingRef.current) {
      player.playVideo();
    }
    setCurrentLyric('YouTube Music');
    setProgress(0);
    setCurrentTime(0);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!playerReadyRef.current || !player?.getCurrentTime) return;
      const time = player.getCurrentTime() || 0;
      const dur = player.getDuration() || 0;
      setCurrentTime(time);
      setDuration(dur);
      setProgress(dur ? (time / dur) * 100 : 0);
    }, 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!playerReadyRef.current || !player?.setVolume) return;
    if (isMuted) player.mute();
    else {
      player.unMute();
      player.setVolume(volume * 100);
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!playerReadyRef.current || !player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  };

  const wrapIndex = (from: number, delta: number) => {
    const len = playlist.length;
    return (from + delta + len) % len;
  };

  const nextSong = () => {
    if (playlist.length === 0) return;
    if (playMode === 'random') {
      if (playlist.length === 1) {
        setCurrentIndex(0);
        return;
      }
      let next = Math.floor(Math.random() * playlist.length);
      if (next === currentIndex) next = (next + 1) % playlist.length;
      setCurrentIndex(next);
      return;
    }
    setCurrentIndex((prev) => wrapIndex(prev, 1));
  };

  const prevSong = () => {
    if (playlist.length === 0) return;

    const player = playerRef.current;
    const time = playerReadyRef.current && player?.getCurrentTime
      ? player.getCurrentTime() || 0
      : currentTime;

    // YouTube 行为：超过约 3 秒先回到开头，已在开头再切上一首
    if (time > 3) {
      if (playerReadyRef.current && player?.seekTo) player.seekTo(0, true);
      setCurrentTime(0);
      setProgress(0);
      return;
    }

    if (playMode === 'random') {
      if (playlist.length === 1) return;
      let next = Math.floor(Math.random() * playlist.length);
      if (next === currentIndex) next = (next + 1) % playlist.length;
      setCurrentIndex(next);
      return;
    }
    setCurrentIndex((prev) => wrapIndex(prev, -1));
  };

  const playSong = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    const player = playerRef.current;
    if (playerReadyRef.current && player?.seekTo && duration) {
      player.seekTo((newProgress / 100) * duration, true);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlayMode = () => {
    setPlayMode((prev) => {
      if (prev === 'loop') return 'single';
      if (prev === 'single') return 'random';
      return 'loop';
    });
  };

  const toggleShuffle = () => {
    setPlayMode((prev) => (prev === 'random' ? 'loop' : 'random'));
  };

  const currentSong = playlist[currentIndex];

  return (
    <MusicContext.Provider value={{
      playlist, currentIndex, currentSong, isPlaying, progress, currentTime, duration, currentLyric, isLoading,
      volume, isMuted, playMode, isShuffle: playMode === 'random',
      togglePlay, nextSong, prevSong, handleSeek,
      playSong, setVolume, toggleMute, togglePlayMode, toggleShuffle,
    }}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 z-[-1] overflow-hidden"
        style={{ width: 1, height: 1, opacity: 0.01 }}
      >
        <div ref={containerRef} />
      </div>
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
};
