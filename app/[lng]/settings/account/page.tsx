 
import { AccountForm } from "@/components/settings/account/account-form"
import { getSession } from "@/lib/session"

export default async function SettingsAccountPage() {

  const session = await getSession()

  const config = JSON.parse(session.config)
 
  return (
      <AccountForm config={config} />
  )
 
}
