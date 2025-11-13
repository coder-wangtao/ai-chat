// biome-ignore lint/performance/noBarrelFile: "Required"
// [...nextauth] 是一个 Catch-All Route（捕获所有子路径）。
// 意味着：
// /api/auth/signin
// /api/auth/signout
// /api/auth/callback/google
// /api/auth/session
// 都会被这个单文件路由处理。
export { GET, POST } from "@/app/(auth)/auth";
