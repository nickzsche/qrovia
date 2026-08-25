import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/session";
import { ensureSeed } from "@/lib/seed";

export const metadata = { title: "Log in · Qrovia" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSeed();
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  return <AuthForm mode="login" hint="demo@qrovia.app / demo1234" />;
}
