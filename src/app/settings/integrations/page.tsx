import { redirect } from "next/navigation";


export default function IntegrationsRedirectPage() {
  redirect("/settings?tab=integrations&panel=slack");
}
