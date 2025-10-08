'use client'


import TaskAwait from "@/components/ui/task-await";
import nextApi from "@/lib/fetching";

export default function Logout() {
    return (
        <TaskAwait action={async () => {
            const res = await nextApi.delete('/api/session')
            console.log('response logout:', res)
        }} redirectTo={'/site'} label="cerrando sesion..."/>
    )
}
