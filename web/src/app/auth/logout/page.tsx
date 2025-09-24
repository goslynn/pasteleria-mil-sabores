'use client'


import TaskAwait from "@/components/ui/task-await";
import {api} from "@/lib/fetching";

export default function Logout() {
    return (
        <TaskAwait action={async () => {
            const res = await api.delete('/api/session')
            console.log('response logout:', res)
        }} redirectTo={'/site'} label="cerrando sesion..."/>
    )
}
