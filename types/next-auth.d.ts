import "next-auth";
declare module "next-auth" {
  interface User {
    role?: string;
    universityVerified?: boolean;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      universityVerified: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    universityVerified?: boolean;
  }
}
