import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./lib/db/schema.ts",  // 数据库定义文件
  out: "./lib/db/migrations",   // 生成的数据库迁移文件 
  dialect: "postgresql",  // 数据库类型
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: process.env.POSTGRES_URL!,  // 数据库连接 URL
  },
});


// npx drizzle-kit generate ==> 根据 schema.ts 文件生成 SQL 迁移文件到 ./lib/db/migrations
// npx drizzle-kit migrate  ==> 将迁移应用到 PostgreSQL 数据库
