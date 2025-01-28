 
import SettingsProfile from "@/components/settings/settings-profile"
import { getSession } from "@/lib/session"

export default async function SettingsProfilePage() {
  const session = await getSession()
  
  const config = JSON.parse(session.config || "")

  return (
   <SettingsProfile config={config} />
  )
}
