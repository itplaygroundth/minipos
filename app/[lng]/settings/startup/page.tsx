 
import { AccountForm } from "@/components/settings/account/account-form"
import { SettingForm } from "@/components/settings/setting-form"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui"
import { getSession } from "@/lib/session"

export default async function startup() {

  const session = await getSession()

  const config = JSON.parse(session.config)

  const conf = {customer:"ar-0001",
    data:JSON.stringify({price:"price1",whcode:"01",shelfcode:"01"})}
  return (
    <Dialog open={true} >
          
    <DialogContent> 
    <DialogTitle>กรุณาค่าเริ่มต้นก่อน</DialogTitle>
    <SettingForm config={conf} />
    </DialogContent>
    </Dialog>
  )
 
}
