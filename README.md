# LULU LAB

[LULU LAB](https://lululab.site/) 是 Lulu 的个人工作室网站，用来展示项目、游戏、开源 Agent Skills 和个人资料，也提供 AI 资讯阅读入口。

| 模块 | 展示内容 | 维护方式 |
| --- | --- | --- |
| 首页 | 一屏展示站点介绍、标语、近况和模块索引 | 工作台发布。源码默认值在 [labContent.js](src/data/labContent.js) |
| 项目 | 按名称逐项展示项目介绍、功能清单、技术结构、使用流程和体验入口 | 工作台管理基本资料。原有项目、扫码入口与功能清单来自 [siteContent.js](src/data/siteContent.js) 和 [projectShowcases.js](src/data/projectShowcases.js) |
| 游戏 | 按名称切换游戏介绍和试玩入口 | 工作台管理 |
| Skills | 按名称查看开源技能说明与源码，另有作者主页和学习资料入口 | [labContent.js](src/data/labContent.js) 的 `agentSkills` 和 `authorProfiles` |
| AIHot | AIHOT 精选摘要与热点榜 | 服务端读取并按频道缓存上游数据 |
| 关于 | 可翻转工牌、个人物品胶囊和「随手一拍」 | 照片放在 [photo](src/assets/picture/photo) 目录，展开图库时加载 |

首页保持一屏，各模块在自己的内容区滚动。点击「翻到页脚」或在内容底部继续向下滚动，可打开叠放式页脚。Skills 列表展示带有 `published: true` 且至少提供一个仓库链接的条目。原 `/repositories` 地址会跳转到 `/skills`。

新增公开技能的字段示例

```js
{ id: 'skill-id', name: '技能名', description: '用途说明', tags: ['领域'],
  github: 'https://github.com/你的账号/技能仓库', gitee: 'https://gitee.com/你的账号/技能仓库', published: true }
```

## 线上更新指南

生产服务器的检出目录是 `/opt/lululab`，部署来源为 [Gitee 的 main 分支](https://gitee.com/wpc_123/lulu-space/tree/main)。[GitHub](https://github.com/Adore1224/luluSpcae) 同步存放源码。代码和静态内容更新分三步。

1. 在本地修改后运行 `npm run lint`、`npm run build`，将提交推送到 Gitee 的 `main`。
2. 登录服务器，从 Git 拉取更新并重建容器。

   ```bash
   cd /opt/lululab
   git pull --ff-only origin main && docker compose --profile https up -d --build --wait
   ```

3. 执行 `docker compose --profile https ps` 检查容器，再打开 [首页](https://lululab.site/) 和 [工作台](https://lululab.site/workbench) 验证。可用 `docker compose logs --tail=80 app` 查看应用日志，用 `docker compose --profile https logs --tail=80 caddy` 查看反代和证书日志。

当前代码部署由上述命令触发。若接入定时任务或 CI，可在检测到新提交后执行同一套更新命令。工作台数据存放在 Docker 卷 `lululab_app_data`，重建容器时沿用。可用 `docker compose cp app:/var/lib/lululab/data ./lululab-data-backup` 备份数据目录。

## 进入个人工作台

工作台是隐藏路由，直接在浏览器打开 [https://lululab.site/workbench](https://lululab.site/workbench)，输入私密口令并点击「解锁工作台」。线上口令保存在服务器 `/opt/lululab/.env` 的 `LAB_WORKBENCH_PASSPHRASE` 字段，可在自己的服务器终端中查看。

```bash
sudo sed -n 's/^LAB_WORKBENCH_PASSPHRASE=//p' /opt/lululab/.env
```

| 板块 | 操作 |
| --- | --- |
| 后台中心 | 预览和发布首页文案，在线新建、编辑或发布项目和游戏，配置关联到项目的外部后台入口 |
| 星标网站 | 用卡片打开网站，支持增删改查、分组和置顶 |
| 头脑风暴 | 在同一张可缩放的画布上手绘和放置 Markdown 文字，保存后可按标题或正文搜索 |
| 开源热点 | 浏览近期新建或有推送的 GitHub 仓库，按累计 Stars 排序，可一键收藏到星标网站 |

保存并发布项目或游戏后，公开页面刷新即可读取。工作台编辑原有项目时可保留源码截图，也可录入自己的 HTTPS 截图地址。已打开且可见的首页约 30 秒内刷新已发布文案。发布内容无需重新构建。

外部后台默认在新标签页打开。如需尝试页内预览，在服务器 `.env` 中用逗号分隔填写受信任的 HTTPS 来源，例如 `LAB_WORKBENCH_FRAME_ORIGINS=https://admin.example.com`，然后重建应用容器。目标后台还需允许本站嵌入，登录状态也取决于浏览器和目标站点的 Cookie 策略。每个入口都有新标签页按钮。[浏览器嵌入规则](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)

开源热点默认打开「GitHub Trending」日榜，也可以切换到周榜或月榜。站内沿用 [GitHub 公开趋势榜](https://github.com/trending) 的顺序，分别标出期间新增与累计 Stars。「仓库热度」使用 [GitHub 仓库搜索 API](https://docs.github.com/en/rest/search/search#search-repositories)，按创建或推送日期筛选后，以累计 Stars 排序。趋势榜从服务端读取，缓存 10 分钟，上游暂时不可用时可显示同一进程中的上次结果。可选的 `LAB_GITHUB_TOKEN` 仅用于服务端的仓库搜索。

### 修改工作台口令

在服务器终端执行 `sudoedit /opt/lululab/.env`，将 `LAB_WORKBENCH_PASSPHRASE` 改为自己记得住的 16–256 字符口令。保存后只重建应用容器，浏览器重新打开工作台并输入新口令。

```bash
cd /opt/lululab
docker compose --profile https up -d --force-recreate app
```

口令由服务端校验，解锁会话有效期为四小时。主动锁定、服务重启或容器重建后，需要重新解锁。

## 技术架构与 API

前端使用 React 和 Vite。生产服务使用 Node.js 内置的 `node:http`，[server/index.js](server/index.js) 负责提供构建后的页面和静态资源，[server/api.js](server/api.js) 处理 HTTP 请求。Docker Compose 启动应用和 Caddy，由 Caddy 提供 HTTPS 并转发请求。

API 采用 REST 风格的 HTTP 方法和 JSON 数据。首页与工作台内容存储在 `LAB_DATA_DIR` 的 JSON 文件中，解锁会话和资讯缓存在服务进程内存中。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/home` | 读取已发布的首页文案 |
| `GET` | `/api/catalog` | 读取项目和游戏的公开更新 |
| `GET` | `/api/aihot/selected` | 读取精选列表 |
| `GET` | `/api/aihot/hot` | 读取热点榜 |
| `GET` | `/api/workbench/session` | 检查工作台是否已配置和解锁 |
| `POST` | `/api/workbench/session` | 验证口令并创建解锁会话 |
| `DELETE` | `/api/workbench/session` | 注销会话并锁定工作台 |
| `PUT` | `/api/workbench/home` | 以已解锁会话发布首页文案 |
| `GET` | `/api/workbench/:collection` | 读取项目、游戏、外部后台、星标或笔记 |
| `PUT` / `DELETE` | `/api/workbench/:collection/:id` | 保存或删除记录 |
| `GET` | `/api/workbench/github` | 读取 GitHub 热点 |

## 本地开发

使用 Node.js 22.12 或更新版本。运行 `npm ci` 和 `npm run dev`，Vite 会同时提供页面和本地 API。

本地试用工作台时，将 `.env.example` 复制为 `.env`，设置至少 16 字符的独立随机口令，把 `LAB_ORIGIN` 设为浏览器实际使用的站点来源。若 Vite 启动在 `http://localhost:5173`，重启后访问 `http://localhost:5173/workbench`。协议、主机名和端口都需与 `LAB_ORIGIN` 一致。

## 首次部署

### Docker Compose

1. 在 Ubuntu 实例上准备 Git、[Docker Engine 和 Compose 插件](https://docs.docker.com/engine/install/ubuntu/)，执行 `docker compose version` 确认可用。以有部署权限的用户从 Gitee 拉取项目。

   ```bash
   git clone --branch main https://gitee.com/wpc_123/lulu-space.git /opt/lululab
   cd /opt/lululab
   ```

   私有仓库可通过部署公钥为服务器配置只读访问。
2. 在该目录执行 `[ -f .env ] || (umask 077; cp .env.example .env)`，再执行 `chmod 600 .env`。编辑 `.env`，填写至少 16 字符的独立随机 `LAB_WORKBENCH_PASSPHRASE`，保持 `LAB_ORIGIN=https://lululab.site`。可用 `openssl rand -hex 24` 在服务器生成口令。Docker 会自行设置容器内的监听地址、端口和数据路径。
3. 将 `lululab.site` 的 A 记录指向服务器公网 IPv4，腾讯云实例防火墙放行 TCP 80、443。首次启动前用 `sudo ss -ltn '( sport = :80 or sport = :443 or sport = :4178 )'` 检查已有服务。根据服务器当前配置选择启动方式：

   - **80、443 空闲**：执行 `docker compose --profile https up -d --build`。内置 Caddy 在 DNS 生效后自动签发和续期 HTTPS 证书，并把 HTTP 重定向到 HTTPS。[Caddy 自动 HTTPS 条件](https://caddyserver.com/docs/automatic-https)
   - **已有 Nginx、宝塔或其他 HTTPS 反代**：执行 `docker compose up -d --build`，再把域名站点的全部路径转发到宿主机 `127.0.0.1:4178`。如 4178 已被占用，在 `.env` 设置 `LULULAB_BIND_PORT=4278`，反代端口同步改为 4278。若现有反代也运行在容器中，让它加入应用所在的 Docker 网络，并指向 `app:4178`。

4. 用 `docker compose ps` 和 `docker compose logs --tail=80 app` 检查应用。使用内置 Caddy 时可用 `docker compose --profile https logs --tail=80 caddy` 查看证书或反代状态。打开首页和 `https://lululab.site/workbench` 验证。4178 仅绑定在宿主机回环地址，公开入口使用 HTTPS。

腾讯云实例直连 Docker Hub 超时时，可在服务器的 `.env` 为本站单独指定 [腾讯云内网镜像源](https://cloud.tencent.com/document/practice/1207/45596)：

```dotenv
LULULAB_NODE_IMAGE=mirror.ccs.tencentyun.com/library/node:22-bookworm-slim
LULULAB_CADDY_IMAGE=mirror.ccs.tencentyun.com/library/caddy:2-alpine
```

沿用现有反代时，在更新命令中省略 `--profile https`。更改口令后运行所选模式的 `docker compose up -d` 使容器读取新配置。

### 直接运行 Node.js

1. 在服务器准备 Node.js 22.12+，安装项目依赖并执行 `npm run build`。
2. 在服务器私下创建 `.env`：设置 `LAB_ORIGIN=https://lululab.site`、强随机口令，以及服务用户可写的持久目录 `LAB_DATA_DIR`（例如 `/var/lib/lululab`）。保留 `HOST=127.0.0.1`、`PORT=4178`，以 `npm start` 运行。生产环境用 systemd 等进程管理器保持服务运行，并备份 `home.json`。不要上传包含口令的 `.env` 至源码仓库。
3. 将域名解析至服务器，在 Nginx 或其他反代上配置 HTTPS。整个站点（含 `/api/` 与各模块路径）转发到 `127.0.0.1:4178`，保留 `Host`，不要缓存工作台与 `/api/`。示例 HTTPS 虚拟主机中的反代段：

   ```nginx
   location / {
       proxy_pass http://127.0.0.1:4178;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-Proto $scheme;
       client_max_body_size 8k;
   }
   ```

4. 确认首页、项目详情、工作台锁定状态与口令解锁均可用。工作台口令和编辑权限只在服务端验证，生产 HTTPS 会话 Cookie 设置 `Secure`。

## AIHot

使用 [AIHOT REST API](https://aihot.news/agent?tab=api) 的精选与热点榜。默认按个人非商业摘要阅读方式展示少量标题、摘要与出处；每个频道独立缓存，使用 ETag 和 `Retry-After`，不展示原文全文。页面分别标明 [KKKKhazix/AIHOT](https://github.com/KKKKhazix/AIHOT) 开源项目来源、实际数据站点，以及每条内容的原文链接。设置 `AIHOT_ENABLED=false` 可关闭实时取数。

上游框架代码采用 MIT，但 [README](https://github.com/KKKKhazix/AIHOT#readme) 说明线上运营数据未包含在开源仓库内，[NOTICE](https://github.com/KKKKhazix/AIHOT/blob/main/NOTICE) 也区分了代码许可、品牌和第三方内容。继续使用 `aihot.news` 的数据须遵循其 [公开使用规则](https://aihot.news/terms)，公开镜像、批量再分发或商业用途不能仅靠来源标注获得授权。若自行部署开源引擎并使用自己的信源，将 `AIHOT_BASE_URL` 改为该实例的 HTTP(S) 根地址，并通过 `AIHOT_SOURCE_NAME` 设置实际内容站名，重启后即可接入。

`npm run lint` 检查代码，`npm run build` 生成正式产物。仅部署 `dist/` 可展示默认首页和静态模块，但不会提供工作台发布和 AIHot 取数。
