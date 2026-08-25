import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/session";

export const metadata = { title: "Register · Qrovia" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
