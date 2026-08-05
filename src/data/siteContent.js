import qixiao1Url from "../assets/picture/qixiao1.png";
import qixiao2Url from "../assets/picture/qixiao2.png";
import qixiao3Url from "../assets/picture/qixiao3.png";
import qixiao4Url from "../assets/picture/qixiao4.png";
import mxai1Url from "../assets/picture/mxai1.png";
import mxai2Url from "../assets/picture/mxai2.png";
import mxai3Url from "../assets/picture/mxai3.png";
import mxai4Url from "../assets/picture/mxai4.png";
import mxai5Url from "../assets/picture/mxai5.png";
import mxai6Url from "../assets/picture/mxai6.png";
import mxai7Url from "../assets/picture/mxai7.png";
import zkda1Url from "../assets/picture/zkda1.png";
import zkda2Url from "../assets/picture/zkda2.png";
import zpmf1Url from "../assets/picture/zpmf1.png";
import zpmf2Url from "../assets/picture/zpmf2.png";
import zpmf3Url from "../assets/picture/zpmf3.png";
import zpmf4Url from "../assets/picture/zpmf4.png";
import zpmf5Url from "../assets/picture/zpmf5.png";
import zpmf6Url from "../assets/picture/zpmf6.png";
import zpmf7Url from "../assets/picture/zpmf7.png";
import zpmf8Url from "../assets/picture/zpmf8.png";
import zigbee1Url from "../assets/picture/zigbee1.jpg";
import zigbee2Url from "../assets/picture/zigbee2.png";
import zigbee3Url from "../assets/picture/zigbee3.png";
import zigbee4Url from "../assets/picture/zigbee4.png";
import selflab1Url from "../assets/picture/selflab1.png";
import selflab2Url from "../assets/picture/selflab2.png";
import selflab3Url from "../assets/picture/selflab3.png";
import selflab4Url from "../assets/picture/selflab4.png";
import selflab5Url from "../assets/picture/selflab5.png";
import selflab6Url from "../assets/picture/selflab6.png";



const pictureModules = import.meta.glob(
  "../assets/picture/photo/*.{avif,jpeg,jpg,png,webp}",
  { eager: true, import: "default", query: "?url" },
);

const pictureGallery = Object.entries(pictureModules)
  .sort(([first], [second]) => first.localeCompare(second, "zh-CN"))
  .map(([path, thumbnail], index) => ({
    id: `picture-${index + 1}`,
    name: path.split("/").pop() ?? `picture-${index + 1}`,
    displayName: `照片 ${String(index + 1).padStart(2, "0")}`,
    type: "album",
    size: "image",
    modified: "",
    tags: [],
    thumbnail,
  }));

export const siteProfile = {
  name: "Lulu",
  chineseName: "王培聪",
  location: "Chengdu, CN",
  age: "25岁 新青年",
  occupation: "全栈开发工程师｜AIGC 应用方向",
  birthday: "🎂 12 - 24",
  education: "一个有·🥬的电子信息双非硕",
  badgeInterests: ["热爱工作", "痴迷Agent", "向往户外", "享受音乐", "喜欢美食"],
  lifeAttitude: "生活中偶尔迷茫但依然保持热爱，当闭上眼开始对世间万物的思考，一些‘亮点’从脑海中冒出，于是我拖着好奇扛着毅力去探索去实现...",
};

export const projects = [
  {
    id: "qixiao",
    projectType: "落地项目",
    technologies: ["Vue 3", "TypeScript", "Java Spring Boot", "MySQL", "UniApp", "Nginx", "Docker"],
    name: "课生万象",
    href: "https://www.skuture.com",
    overview: "“课生万象”是一个面向教培机构管理和运营的综合系统，围绕 教务、财务、数据、管理四个方向提供全方位的支持，助力机构高效运营、降本增效。",
    gallery: [
      {
        image: qixiao1Url,
        description: "平台Web端的员工工作台主页。",
      },
      {
        image: qixiao2Url,
        description: "平台Web的学员管理页面。",
      },
      {
        image: qixiao3Url,
        description: "平台Web端的机构核心数据可视化展示页面（部分画面）。",
      },
      {
        image: qixiao4Url,
        description: "平台Web端的课表管理页面（部分视图）。",
      },
    ],
  },
  {
    id: "mxai",
    projectType: "落地项目",
    technologies: ["Agent", "WebSocket", "React", "Java", "PostgreSQL", "Redis", "Docker", "Http SSE", "Nginx"],
    name: "麦星AI",
    href: "https://mxai.myunlab.com/",
    overview: "面向电商商家和运营人员，整合图片、视频与营销文案生成能力，将通用生成式AI能力封装为更贴近商品营销场景的内容生产工具，具有完整的支付/会员体系。",
    gallery: [
      {
        image: mxai1Url,
        description: "平台爆款专区页面，提供热门高质量的图片/视频模板。",
      },
      {
        image: mxai2Url,
        description: "平台图片创作Agent页面，通过系统设定的高质量提示词生成所选电商平台的目标图片。",
      },
      {
        image: mxai3Url,
        description: "平台视频创作Agent页面，通过系统设定的高质量提示词生成所选电商平台的目标视频。",
      },
      {
        image: mxai4Url,
        description: "平台文案创作Agent页面，通过系统设定的高质量提示词生成所选电商平台的目标营销文案。",
      },
      {
        image: mxai5Url,
        description: "平台百宝箱页面，提供各类工具辅助用户进行内容创作。",
      },
      {
        image: mxai6Url,
        description: "平台Agent工作页面，在画布展示生成的过程，生成后可对图片/视频进行编辑导出等操作",
      },
      {
        image: mxai7Url,
        description: "平台活动中心页面，包含会员订阅、积分订购、活动内容等板块。",
      },
    ],
  },
  {
    id: "zpmf",
    projectType: "落地项目",
    technologies: ["Dify", "node.js", "playwright", "React", "Nginx", "Python", "Java",  "Redis", "PostgreSQL", "Docker"],
    name: "智铺魔方",
    href: "",
    overview: "面向电商客服团队，提供企业级知识库问答、客服情景训练、员工考试考核及直播间智能回复，并配套本地自动化智能体完成店铺运营数据的分析与处理。",
    gallery: [
      {
        image: zpmf1Url,
        description: "平台店铺罗盘页面，展示全店铺的运营数据。",
      },
      {
        image: zpmf2Url,
        description: "平台业务分析页面，注重店铺售后相关数据。",
      },
      {
        image: zpmf3Url,
        description: "平台企训云管页面的情景演练板块，模拟客服与客户之间的互动场景并提供反馈与建议，用于员工技能培训。",
      },
      {
        image: zpmf4Url,
        description: "平台企训云管页面的技能培训板块，通过试卷形式对员工进行技能考核。",
      },
      {
        image: zpmf5Url,
        description: "平台轻问客服页面的对话助手板块，基于知识库提供合规的问答服务。",
      },
      {
        image: zpmf6Url,
        description: "平台轻问客服页面的话术库板块，用于展示和使用客服的固定回复模板。",
      },
      {
        image: zpmf7Url,
        description: "平台直播助手页面，用于在直播过程中查看实时弹幕并提供回复支持。",
      },
      {
        image: zpmf8Url,
        description: "平台后台中心页面。",
      },
    ],
  },
  {
    id: "zkda",
    projectType: "待落地项目",
    technologies: ["n8n", "Nginx", "Proxy", "React", "Python", "Java", "PostgreSQL", "Docker"],
    name: "智库底案(试运营)",
    href: "http://47.109.76.18/",
    overview: "面向智库报告等公开信息源，通过自动化工作流完成信息采集、处理、汇总及报告上传，并提供报告制作、专题编排、分类检索等能力，形成从公开信息采集到结构化报告交付的自动化链路。(当前处于试运营阶段，部分功能不方便展示)",
    gallery: [
      {
        image: zkda1Url,
        description: "平台地图态势页面。",
      },
      {
        image: zkda2Url,
        description: "平台每日简报页面。",
      },
    ],
  },
  {
    id: "zigbee",
    projectType: "实验项目",
    technologies: ["嵌入式", "C / C++", "PCB", "电路设计", "Qt", "Zigbee", "AI"],
    name: "物联网嵌入式项目",
    href: "",
    overview: "结合无线通信、数据融合、人工智能等技术实现对大棚无线传感网络的管理以及大棚作物生长环境的实时监测与适宜度评价系统。",
    gallery: [
      {
        image: zigbee1Url,
        description: "自己设计的采集端硬件模块实物，用于采集和传输传感器数据。",
      },
      {
        image: zigbee2Url,
        description: "硬件模块的PCB图，电路原理图就不放了，比较简单。",
      },
      {
        image: zigbee3Url,
        description: "系统桌面端上位机软件，用于管理和配置采集端硬件模块的界面。",
      },
      {
        image: zigbee4Url,
        description: "系统桌面端上位机软件，用于监控系统运行状态和数据处理的运行界面，包括部分算法的集成实现。",
      },
    ],
  },
  {
    id: "selflab",
    projectType: "实验项目",
    technologies: ["React", "Nginx", "Java", "AI", "PostgreSQL", "Docker"],
    name: "SelfLab",
    href: "http://139.199.222.116/",
    overview: "面向自媒体创作者，免费提供工具教程、创作引流变现指南、起号辅助等一站式辅助平台。（当前仅处于项目中期，内容并不完全符合需求，仅作为实验项目展示，且属于个人想法，不一定会结项）",
    gallery: [
      {
        image: selflab1Url,
        description: "平台概览首页（部分画面），展示入口。",
      },
      {
        image: selflab2Url,
        description: "平台指南页面，展示不同赛道的自媒体创作指南。",
      },
      {
        image: selflab3Url,
        description: "平台指南页面具体赛道的专属指南详情页。",
      },
      {
        image: selflab4Url,
        description: "平台资源页面的工具板块，展示搜集的不同类型的优质工具链接。",
      },
      {
        image: selflab5Url,
        description: "平台资源页面的教程板块，展示搜集的不同类型的优质视频或图文教程。",
      },
            {
        image: selflab6Url,
        description: "平台打造页面，选定赛道和AI助手一起打造自媒体账号。",
      },
    ],
  },
];

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
