import fs from 'fs';
import path from 'path';

console.log('\n🔧 正在扫描双端 siteConfig.ts...');

const commonConfigs = [
  { key: 'title', snippet: `\n  title: "Arsenova",` },
  { key: 'faviconUrl', snippet: `\n  faviconUrl: "https://github.com/archiyun.png",` },
  { key: 'authorName', snippet: `\n  authorName: "arsenova",` },
  { key: 'bio', snippet: `\n  bio: "MyGo!!!!!",` },
  { key: 'navTitle', snippet: `\n  navTitle: "Arsenova",` },
  { key: 'navSuffix', snippet: `\n  navSuffix: "の",` },
  { key: 'navAfter', snippet: `\n  navAfter: "Home",` },
  { key: 'avatarUrl', snippet: `\n  avatarUrl: "https://github.com/archiyun.png",` },
  { key: 'useGradient', snippet: `\n  useGradient: true,` },
  { key: 'themeColors', snippet: `\n  themeColors: ["#33aaff", "#7777ff", "#33bbaa", "#a1c4fd"],` },
  { key: 'bgImages', snippet: `\n  bgImages: [] as string[],` },
  { key: 'defaultPostCover', snippet: `\n  defaultPostCover: "https://github.com/archiyun.png",` },
  { key: 'photoWallImage', snippet: `\n  photoWallImage: "https://github.com/archiyun.png",` },
  { key: 'cloudMusicIds', snippet: `\n  cloudMusicIds: [] as string[],` },
  { key: 'social', snippet: `\n  social: {\n    github: "https://github.com/archiyun",\n    gitee: "",\n    google: "",\n    email: "furina.see.fun@gmail.com",\n    qq: "",\n    wechat: "",\n  },` },
  { key: 'counts', snippet: `\n  counts: {\n    photos: 0,\n  },` },
  { key: 'chatterTitle', snippet: `\n  chatterTitle: "杂谈",` },
  { key: 'chatterDescription', snippet: `\n  chatterDescription: "代码、安全与日常的碎片记录",` },
  { key: 'danmakuList', snippet: `\n  danmakuList: ["今天写代码了吗？", "MyGo!!!!!", "编译通过！", "深夜两点，还在转"],` },
  { key: 'gitalkConfig', snippet: `\n  gitalkConfig: {\n    clientID: "",\n    clientSecret: "",\n    repo: "",\n    owner: "",\n    admin: [""],\n  },` },
  { key: 'buildDate', snippet: `\n  buildDate: "2026-04-17T00:00:00",` },
  { key: 'footerBadges', snippet: `\n  footerBadges: [{"name": "Next.js", "color": "text-sky-500", "svg": "<path d=\\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\\"/>"}],` },
  { key: 'icpConfig', snippet: `\n  icpConfig: {\n    name: "",\n    link: "",\n  },` },
  { key: 'geminiConfig', snippet: `\n  geminiConfig: {\n    modelId: "gemini-2.5-flash-lite",\n    systemPrompt: "你是一只简洁的助手，回答尽量简短。",\n    maxOutputTokens: 150,\n    temperature: 0.85,\n  },` },
  { key: 'friendLinkApplyFormat', snippet: `\n  friendLinkApplyFormat: "名称：Arsenova\\n简介：MyGo!!!!!\\n链接：https://arsenova.xyz\\n头像：https://github.com/archiyun.png",` },
  { key: 'enableLevelSystem', snippet: `\n  enableLevelSystem: false,` },
];

const managerSpecificConfigs = [
  { key: 'picBedName', snippet: `\n  picBedName: "图床",` },
  { key: 'picBedUrl', snippet: `\n  picBedUrl: "",` },
  { key: 'picBedToken', snippet: `\n  picBedToken: "",` },
];

const tasks = [
  {
    name: '[后台]',
    filePath: path.resolve('./my-blog-manager/siteConfig.ts'),
    configs: [...commonConfigs, ...managerSpecificConfigs],
  },
  {
    name: '[前端]',
    filePath: path.resolve('./XHBlogs/siteConfig.ts'),
    configs: [...commonConfigs],
  },
];

tasks.forEach((task) => {
  if (!fs.existsSync(task.filePath)) {
    console.log(`⚠️ 未找到 ${task.name} 的 siteConfig.ts，已跳过。`);
    return;
  }

  let content = fs.readFileSync(task.filePath, 'utf8');
  let isUpdated = false;

  task.configs.forEach((item) => {
    if (!content.includes(`${item.key}:`) && !content.includes(`${item.key} :`)) {
      console.log(`🔍 ${task.name} 补全缺失项: [${item.key}]`);
      const lastBraceIndex = content.lastIndexOf('};');
      if (lastBraceIndex !== -1) {
        content = content.slice(0, lastBraceIndex) + item.snippet + '\n' + content.slice(lastBraceIndex);
        isUpdated = true;
      }
    }
  });

  if (isUpdated) {
    fs.writeFileSync(task.filePath, content, 'utf8');
    console.log(`✨ ${task.name} 配置已修复。`);
  } else {
    console.log(`✅ ${task.name} 配置完整。`);
  }
});
