vercel-template.json
当别人点 “Deploy with Vercel” 按钮部署这个模板时，Vercel 会：
自动要求绑定 Neon（Postgres 数据库）
自动绑定 Upstash KV（键值存储）
开启 Blob 存储 功能（Vercel 自带）
也就是说，别人只要一键部署，Vercel 会帮他们：
✅ 自动创建数据库、KV、存储桶
✅ 自动把连接信息注入环境变量
✅ 部署完就能直接使用

playwright.config.ts
Playwright = 自动帮你打开浏览器 + 像真人一样点网页 + 检查页面功能有没有问题。

components.json(shanCN ui)

biome.jsonc 类型检测
