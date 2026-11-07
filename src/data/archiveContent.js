import { pictureGallery } from "./photoGallery";
import { projects } from "./siteContent";

export const archiveFolders = [
  {
    id: "projects",
    label: "个人项目",
    englishLabel: "Projects",
    color: "#d9b06f",
    description: "做过的落地项目和实验项目",
    icon: "briefcase",
    files: projects.map((project) => ({
      id: project.id,
      name: `${project.id}/`,
      displayName: project.name,
      type: "project-folder",
      size: "Project",
      modified: "",
      tags: [],
      content: project,
      thumbnail: project.gallery[0]?.image,
    })),
  },
  {
    id: "experiments",
    label: "待做任务",
    englishLabel: "Experiments",
    color: "#76bd9c",
    description: "有想法开启的下一个项目任务",
    icon: "sparkles",
    files: [
      {
        id: "game",
        name: "game",
        displayName: "小游戏",
        type: "experiment",
        size: "GLSL",
        modified: "今天",
        tags: ["Cocos", "Godot"],
        content: "想试试做个小型游戏，也许是手机端小程序的，也可能是PC端的。类型还没确定，应该是2D/2.5D游戏。目前正在琢磨游戏玩法和机制。试试看吧！GoGoGo!",
      },
    ],
  },
  {
    id: "photos",
    label: "照片图库",
    englishLabel: "Photo Gallery",
    color: "#df918b",
    description: "不经意间留下的那一瞬",
    icon: "camera",
    files: pictureGallery,
  },
  {
    id: "notes",
    label: "灵感随笔",
    englishLabel: "Notes",
    color: "#a993d1",
    description: "生活中奇思妙想产生的随笔",
    icon: "note",
    files: [
      {
        id: "details",
        name: "craft-lives-in-details.note",
        displayName: "怎么对抗人性",
        type: "note",
        size: "2 min read",
        modified: "本周",
        tags: ["思考"],
        content:
          "对抗人性不是自我阉割，而是用理性驾驭本能。我们无法消灭贪婪、懒惰或恐惧，但能通过制度与环境设计来引导——如用自动储蓄对抗消费冲动，用公开承诺抵御懈怠。这场博弈的精髓在于放弃正面强攻，转而布设“认知陷阱”：让正确选择成为最舒适的选择。真正的胜利不是你战胜了人性，而是你学会了与它共舞，并悄悄改变了舞步的方向。",
      },
      {
        id: "ambiguity",
        name: "from-ambiguity.note",
        displayName: "AI浪潮中的生存",
        type: "note",
        size: "3 min read",
        modified: "本周",
        tags: ["思考"],
        content:
          "当AI在计算与模式识别上碾压人类时，我们的价值转向感性、创造与意义构建。与其在AI擅长的领域比快，不如深耕它无法复制的领域：提出好问题的能力、在不确定中决策的勇气、对美的独特感悟。未来属于“骑手型”人才——他们驾驭AI工具，却始终紧握价值观的方向盘。记住：AI越强大，人类那些“无用的热爱”和“看似低效的思考”就越显珍贵。",
      },
    ],
  },
];
