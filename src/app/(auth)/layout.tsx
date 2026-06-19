import { AuthFrameHeader, AuthSlimFooter } from "@/components/auth/auth-ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AuthFrameHeader />
      <main className="flex flex-1">{children}</main>
      <AuthSlimFooter />
    </div>
  );
}
