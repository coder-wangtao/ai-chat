import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { createGuestUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },  // 用于处理 API 请求
  auth,   // 中间件，用于保护页面
  signIn,  // 前端调用的函数，登录和登出
  signOut, // 前端调用的函数，登录和登出
} = NextAuth({
  ...authConfig,
  providers: [
    // 普通用户登录
    Credentials({
      credentials: {}, // 可以定义登录表单需要哪些字段，比如 { email, password }，这里为空表示自己处理。
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) {
          // 如果用户不存在：
          // 用 DUMMY_PASSWORD 验证，防止黑客通过响应时间判断用户是否存在。
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return { ...user, type: "regular" };
      },
    }),
    // 游客登录
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    // 登录成功时，把用户 id 和 type 存入 JWT。
    // 后续请求都会携带 JWT，用来验证身份。
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    session({ session, token }) {
      // 前端通过 useSession() 获取 session 时，会包含 id 和 type，方便在页面里区分普通用户和游客。
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }
      return session;
    },
  },
});
