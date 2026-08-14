// siteConfig.ts - 全站配置

export const siteConfig = {
  title: "Arsenova",
  faviconUrl: "https://github.com/archiyun.png",
  authorName: "arsenova",
  bio: "MyGo!!!!!",

  navTitle: "Arsenova",
  navSuffix: "の",
  navAfter: "Home",

  avatarUrl: "https://github.com/archiyun.png",

  useGradient: true,
  themeColors: ["#33aaff", "#7777ff", "#33bbaa", "#a1c4fd"],
  bgImages: [] as string[],

  defaultPostCover: "https://github.com/archiyun.png",
  photoWallImage: "https://github.com/archiyun.png",
  cloudMusicIds: [] as string[],
  youtubeMusicIds: [
    "https://music.youtube.com/watch?v=3EcPGUyzujc",
    "https://music.youtube.com/watch?v=UdPF2TAU9RQ",
    "https://music.youtube.com/watch?v=cUiqPvPnRII",
    "https://music.youtube.com/watch?v=bdn6XFdVOWM",
    "https://music.youtube.com/watch?v=Iupq4GUgiQ8",
    "https://music.youtube.com/watch?v=S0GgBcNKK5g",
    "https://music.youtube.com/watch?v=8tbD2TpKpiI",
    "https://music.youtube.com/playlist?list=PLZCfAvgzDjXtnTvVQK5k3haUkhZqaME9z",
  ],

  social: {
    github: "https://github.com/archiyun",
    google: "https://www.google.com/",
    email: "furina.see.fun@gmail.com",
    qq: "",
    wechat: "",
  },

  counts: {
    photos: 0,
  },

  chatterTitle: "杂谈",
  chatterDescription: "代码、安全与日常的碎片记录",

  danmakuList: [
    "今天写代码了吗？",
    "MyGo!!!!!",
    "编译通过！",
    "深夜两点，还在转",
  ],

  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },

  buildDate: "2026-04-17T00:00:00",
  footerBadges: [
    {
      name: "Next.js",
      color: "text-sky-500",
      svg: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
    },
    {
      name: "React 19",
      color: "text-cyan-400",
      svg: '<path d="M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z"/>',
    },
    {
      name: "Tailwind 4",
      color: "text-teal-400",
      svg: '<path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z"/>',
    },
  ],

  icpConfig: {
    name: "",
    link: "",
  },

  geminiConfig: {
    modelId: "gemini-2.5-flash-lite",
    systemPrompt: "你是一只聪明、简洁的助手，回答尽量简短。",
    maxOutputTokens: 150,
    temperature: 0.85,
  },

  friendLinkApplyFormat:
    "名称：Arsenova\n简介：MyGo!!!!!\n链接：https://arsenova.xyz\n头像：https://github.com/archiyun.png",

  enableLevelSystem: false,
};
