// 用于在请求到达页面或 API 之前进行拦截和处理。它主要处理 认证、访客重定向、Playwright 测试兼容 等逻辑。
import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    // ：Playwright 测试启动时，会先访问 /ping 确认开发服务器已经启动
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth")) {
    // /api/auth 相关请求（登录、注册、JWT 验证等）直接放行，不做拦截
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);
    // 如果没有 token，则认为用户未登录
    // 重定向到 /api/auth/guest（生成访客账户）
    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
    );
  }

  const isGuest = guestRegex.test(token?.email ?? "");

  if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
    // 如果用户已经登录 并且不是访客 
    // 尝试访问 /login 或 /register 时
    // 自动重定向到首页 /，避免已登录用户重复访问登录页面
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 对于不需要拦截的请求，直接继续往下处理（访问页面或 API）
  return NextResponse.next();
}

export const config = {
  // 定义哪些路径会触发 middleware
  // /、/chat/:id、/api/:path*、/login、/register 会执行
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",

    
    // 最后一条规则：匹配除 _next/static、_next/image、favicon、sitemap、robots.txt 之外的所有路径
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
