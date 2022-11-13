import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
  }
  interface User {
    accessToken: string;
    image: string | undefined;
  }
}
