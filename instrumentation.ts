import { registerOTel } from "@vercel/otel";
// Vercel 会自动收集请求追踪（HTTP 请求链路）
// 收集性能指标（延迟、吞吐量）
// 可以将数据发送到 Vercel 监控面板，或外部 OTel 后端
export function register() {
  registerOTel({ serviceName: "ai-chat" });
}
