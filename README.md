# LULU LAB

Lulu 的个人工作室。公开站包含一屏首页、项目档案及图集、游戏、Agent Skills、AIHot 和关于；旧学习资料仍可从 Skills 页进入。关于页保留个人物品胶囊，照片在展开后按需加载，素材存放在 `src/assets/picture/photo`。模块内容在视口内部滚动；到达底部继续滚动或点击“翻到页脚”，进入约三分之一屏的叠放页脚卡片，向上滚动、按 Escape 或点击“返回页面”即可返回，网页总高度不变。

游戏维护在 `src/data/labContent.js` 的 `games` 中。Skills 页的数据结构已就绪，目前 `agentSkills` 为空；只展示带有 `published: true` 且至少提供一个源码链接的条目。GitHub / Gitee 个人主页链接维护在 `authorProfiles` 中。原 `/repositories` 地址兼容至 `/skills`。

新增公开技能的字段示例（不是当前展示内容）：

```js
{ id: 'skill-id', name: '技能名', description: '用途说明', tags: ['领域'],
  github: 'https://github.com/你的账号/技能仓库', gitee: 'https://gitee.com/你的账号/技能仓库', published: true }
```

## 本地开发

需要 Node.js 22.12+。运行 `npm ci` 和 `npm run dev`，Vite 会同时提供页面和本地 API。

如需试用工作台，将 `.env.example` 复制为 `.env`，把 `LAB_ORIGIN` 改为实际浏览器地址（例如 `http://localhost:5173`），设置一个至少 16 字符的独立随机口令，然后重启服务。浏览器直接访问 `/workbench` 解锁；公开页面不提供入口。不同端口或 `localhost` 与 `127.0.0.1` 不可混用。

编辑器提供预览、撤销未发布修改和发布。发布后内容写入 `LAB_DATA_DIR/home.json`；首页新请求立即读取，已经打开的可见首页约 30 秒内刷新内容。更新不需重构建。工作台不注册账号；会话有效期四小时，主动锁定或重启服务会清除会话。

## 部署到 lululab.site

### Docker Compose

1. 在 Ubuntu 实例上准备 Git、[Docker Engine 和 Compose 插件](https://docs.docker.com/engine/install/ubuntu/)，执行 `docker compose version` 确认可用。首次部署时从 Gitee 拉取项目：

   ```bash
   git clone --branch main https://gitee.com/wpc_123/lulu-space.git ~/lululab
   cd ~/lululab
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

推送更新后，服务器可通过 Git 快进更新和 Compose 重建部署新版本。内置 Caddy 模式下执行：

```bash
cd ~/lululab
git pull --ff-only origin main && docker compose --profile https up -d --build
```

沿用现有反代时省略 `--profile https`。首页发布数据存放在 Compose 数据卷 `lululab_app_data` 中，重建容器时继续使用该卷。首次发布后可在服务器运行 `docker compose cp app:/var/lib/lululab/data/home.json ./home.backup.json` 备份。更改口令后运行所选模式的 `docker compose up -d` 使容器读取新配置。

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
