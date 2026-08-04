import qixiao1Url from "../assets/picture/qixiao1.png";
import qixiao2Url from "../assets/picture/qixiao2.png";
import qixiao3Url from "../assets/picture/qixiao3.png";
import qixiao4Url from "../assets/picture/qixiao4.png";
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



const pictureModules = import.meta.glob(
  "../assets/picture/*.{avif,jpeg,jpg,png,webp}",
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
    name: "麦星AI",
    href: "https://mxai.myunlab.com/",
    overview: "面向电商商家和运营人员，整合图片、视频与营销文案生成能力，将通用生成式AI能力封装为更贴近商品营销场景的内容生产工具，带有完整的支付/会员体系。",
    gallery: [
      {
        image: qixiao1Url,
        description: "空间化日程的核心视觉实验：通过环形轨迹、前后景深与聚焦状态，让不同时间事件形成可感知的远近关系。",
      },
    ],
  },
  {
    id: "zkda",
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
    id: "zpmf",
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
  }
];

export const archiveFolders = [
  {
    id: "projects",
    label: "个人项目",
    englishLabel: "Projects",
    color: "#d9b06f",
    description: "做过的完整可用项目",
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
        id: "fluid",
        name: "fluid-background.shader",
        displayName: "流体光场",
        type: "experiment",
        size: "GLSL",
        modified: "今天",
        tags: ["Shader", "WebGL"],
        content: "一张会呼吸、也会回应鼠标移动的柔性数字底布。",
      },
      {
        id: "orbit",
        name: "idea-orbit.scene",
        displayName: "灵感生态舱",
        type: "experiment",
        size: "Three.js",
        modified: "今天",
        tags: ["R3F", "3D"],
        content: "把兴趣做成围绕核心缓慢运动的几何物件，并与页面目录连接。",
      },
      {
        id: "motion",
        name: "micro-motion.lab",
        displayName: "微动效练习",
        type: "experiment",
        size: "Motion",
        modified: "本周",
        tags: ["Framer Motion"],
        content: "研究怎样用很小的位移、惯性与延迟，让界面显得更有触感。",
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
        displayName: "细节里的手艺",
        type: "note",
        size: "2 min read",
        modified: "本周",
        tags: ["设计思考"],
        content:
          "好的体验不只存在于第一眼，也存在于空状态、等待、退出和那些没人提醒你的边缘情况。界面的可靠感，往往来自这些不显眼的地方。",
      },
      {
        id: "ambiguity",
        name: "from-ambiguity.note",
        displayName: "从模糊到清晰",
        type: "note",
        size: "3 min read",
        modified: "四月",
        tags: ["方法"],
        content:
          "面对模糊的问题时，我习惯先寻找可以验证的最小切口。清晰不是一开始就知道答案，而是知道下一步应该验证什么。",
      },
    ],
  },
];
