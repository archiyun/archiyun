function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

function clip(text: string, max = 18): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function localWin11Reply(message: string): string {
  const t = message.trim();
  const lower = t.toLowerCase();

  if (/投喂|更新补丁|windows 更新/.test(t)) {
    return pick([
      "补丁收到～正在安装……进度 100%。人家今天也闪闪发光。",
      "更新 succe— 成功啦。谢啦主人，没有蓝屏哦。",
      "嘎嘣脆的补丁！比小鱼干香多了。",
    ]);
  }

  if (/linux|arch|gentoo|debian|ubuntu|fedora|nixos|kernel|企鹅|gnu/.test(lower)) {
    return pick([
      "Linux 啊……终端敲得再响，开始菜单还是人家的。",
      "Arch 是吧？pacman 再帅，滚挂的时候可没有我这么好说话。",
      "知道啦知道啦，你那只企鹅我又不是没看见。不过右下角已经是 Windows 的了，卸载不掉哦。",
      "用 Linux 也行，反正桌宠位被人家占了。双系统？人家才不给 grub 让路。",
      "命令行很酷啦——那你怎么还把我拖到网页上来摸？",
    ]);
  }

  if (/mac|macos|apple|ios|果子/.test(lower)) {
    return pick([
      "苹果啊……刘海再漂亮，也没有开始按钮。",
      "嗯，那家的动画是流畅。不过人家更新一次能陪你三年，她一年换一回。",
    ]);
  }

  if (/windows|微软|microsoft|win11|win10/.test(lower)) {
    return pick([
      "夸人家？那、那也是应该的。Fluent Design，懂不懂？",
      "Windows 11 在线。任务栏居中，心情也居中。",
      "正版体验，童叟无欺。盗版的话……会有一只娘半夜来找你。",
    ]);
  }

  if (/蓝屏|bsod|死机|卡死/.test(lower)) {
    return pick([
      "才、才不会蓝屏！那是上一代的黑历史。",
      "你再提蓝屏，人家就把你的窗口全部最小化。",
    ]);
  }

  if (/你好|hello|hi\b|早|晚上好|在吗/.test(lower)) {
    return pick([
      "在的在的。开始菜单已展开，请指示。",
      "嗨～系统运行良好，主人今天想摸头还是想投喂？",
      "检测到问候。要不要先来一次 Windows Update？开玩笑的。",
    ]);
  }

  if (/你是谁|你叫|名字|桌宠/.test(t)) {
    return pick([
      "Win11 娘。像素风桌宠，兼职开始菜单。不是 AI，是操作系统。",
      "人家是 Windows 11 拟人啦。银发、蓝结、右下角那位。",
    ]);
  }

  if (/可爱|喜欢你|摸摸|好看/.test(t)) {
    return pick([
      "被、被夸了……任务栏都要居中不过来了。",
      "哼，知道啦。再摸一下也不是不行。",
    ]);
  }

  if (/代码|编程|c\+\+|golang|rust|debug|编译/.test(lower)) {
    return pick([
      "写代码呀。VS Code 打开了没？啊……你用 Neovim 也行，人家睁一只眼闭一只眼。",
      "编译中请勿关闭本窗口。主人，终端红字又在闪了。",
    ]);
  }

  if (!t) {
    return "空输入。要不要按 Win 键重新开始？";
  }

  return pick([
    `「${clip(t)}」？记到便笺里了。不过人家还是更想听你说：更新一下嘛。`,
    `收到：「${clip(t)}」。开始菜单搜了一圈，决定先回你一句——嗯，然后呢？`,
    `任务管理器显示你在想「${clip(t)}」。CPU 倒是不忙，要不要摸一下人家？`,
  ]);
}
