export type Project = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl: string;
  tags: string[];
};

export const projectsData: Project[] = [
  {
    id: "coropact",
    name: "CoroPact",
    description:
      "C++23 异步网络运行时与 L7 网关，基于显式协程 I/O 语义，支持 epoll 与 io_uring 双后端。",
    icon: "⚡",
    githubUrl: "https://github.com/archiyun/CoroPact",
    tags: ["C++23", "Coroutine", "io_uring", "Gateway", "Networking"],
  },
];
