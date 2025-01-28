import { Airplay, Icon, Settings2,User2 } from "lucide-react"

export interface IMenu {
    Label:string
    Link:string
    ShowIcon:boolean
    Icon:typeof Icon
    Roles: string[]; 
}

export const Menu:IMenu[] = [{
    Label:"overview",
    Link:"home",
    Icon: Airplay,
    ShowIcon:false,
    Roles: ["user", "admin", "sa","root"]
},
// {
//     Label:"customers",
//     Link:"customers",
//     Icon: Airplay,
//     ShowIcon:false,
//     Roles: ["user", "admin", "sa","root"]
// },
{
    Label:"settings",
    Link:"settings/account",
    Icon: Settings2,
    ShowIcon:false,
    Roles: ["admin", "sa","root"] 
}]

export const Sidebar:IMenu[] = [
{
    Label:"account",
    Link:"settings/account",
    Icon: User2,
    ShowIcon:false,
    Roles: ["user", "admin", "sa","root"]
},
{
    Label:"settings",
    Link:"settings",
    Icon: Settings2,
    ShowIcon:false,
    Roles: ["admin", "sa","root"] 
}
]