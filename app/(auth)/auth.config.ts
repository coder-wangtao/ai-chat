import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    // signIn: "/login" → 登录页地址
    // newUser: "/" → 新用户注册成功后跳转页面
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {},
} satisfies NextAuthConfig;
