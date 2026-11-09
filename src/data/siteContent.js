import qixiao1Url from "../assets/picture/qixiao1.png";
import qixiao2Url from "../assets/picture/qixiao2.png";
import qixiao3Url from "../assets/picture/qixiao3.png";
import qixiao4Url from "../assets/picture/qixiao4.png";
import qixiaoCodeUrl from "../assets/picture/qixiao_code.jpg";
import mxai1Url from "../assets/picture/mxai1.png";
import mxai2Url from "../assets/picture/mxai2.png";
import mxai3Url from "../assets/picture/mxai3.png";
import mxai4Url from "../assets/picture/mxai4.png";
import mxai5Url from "../assets/picture/mxai5.png";
import mxai6Url from "../assets/picture/mxai6.png";
import mxai7Url from "../assets/picture/mxai7.png";
import zkda1Url from "../assets/picture/zkda1.png";
import zkda2Url from "../assets/picture/zkda2.png";
import zkda3Url from "../assets/picture/zkda3.png";
import msccCodeUrl from "../assets/picture/mscc_code.jpg";
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
    technologies: ["Vue 3", "TypeScript", "Java Spring Boot", "MySQL", "UniApp", "Nginx", "Docker"],
    name: "课生万象",
    href: "https://www.skuture.com",
    qrCode: qixiaoCodeUrl,
    overview: "课生万象是面向教培机构的管理系统，覆盖教务、财务、经营数据和校区管理。",
    platformSummary: "Web 管理端与微信小程序端协同使用。教师可在小程序查看课表、班级并处理考勤，学员与家长可查课表、扫码签到、查看或支付课程订单。",
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
    id: "zkda",
    technologies: ["n8n", "Nginx", "Proxy", "React", "Python", "Java", "PostgreSQL", "Docker"],
    name: "智库底案",
    href: "http://47.109.76.18/",
    overview: "面向智库报告等公开信息源，通过自动化工作流完成信息采集、处理、汇总及报告上传，并提供报告制作、专题编排、分类检索等能力，形成从公开信息采集到结构化报告交付的自动化链路。配套数据看板可视化展示主题分布、来源机构、地区热度与简报数量趋势，辅助快速掌握信息动态。(当前处于试运营阶段，部分功能不方便展示)",
    gallery: [
      {
        image: zkda1Url,
        description: "平台地图态势页面。",
      },
      {
        image: zkda2Url,
        description: "平台每日简报页面。",
      },
      {
        image: zkda3Url,
        imageFit: "contain",
        description: "平台数据看板页面，汇总全球智库大事件，展示主题分布、来源机构排名、地区热度及各期简报数量趋势。",
      },
    ],
  },
  {
    id: "mscc",
    technologies: ["微信小程序", "uni-app x", "UTS", "TypeScript", "Node.js", "Fastify", "Drizzle ORM", "MySQL", "CloudBase 云托管", "微信支付", "Docker"],
    name: "买手川川",
    href: "",
    qrCode: msccCodeUrl,
    hideGallery: true,
    overview: "“买手川川”是一款面向日常消费优惠场景的微信小程序，整合餐饮代下单与会员权益直充服务。用户可按城市与附近门店选购餐饮商品，在线支付后查看取餐码，也可分类检索音视频、办公教育、生活工具等会员权益并完成充值。系统打通微信登录、支付、供应商履约、订单状态同步及退款售后，并提供用户、订单和经营数据等管理员运营能力。",
    gallery: [],
  },
  {
    id: "zpmf",
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
    id: "zigbee",
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
    technologies: ["React", "Nginx", "Java", "AI", "PostgreSQL", "Docker"],
    name: "SelfLab",
    href: "http://139.199.222.116/",
    overview: "面向自媒体创作者的资源站，按创作方向整理工具、教程和起号指南，帮助创作者找到适合当前阶段的参考资料。目前为原型，部分内容待完善。",
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
