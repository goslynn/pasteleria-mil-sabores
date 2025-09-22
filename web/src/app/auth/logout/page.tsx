'use client'

import { apiFetch } from '@/lib/fetching'
import TaskAwait from "@/components/ui/task-await";

export default function Logout() {
    return (
        <TaskAwait action={async () => {
            const res = await apiFetch('/api/session', { method: 'DELETE' })
            console.log('response logout:', res)
        }} redirectTo={'/site'} label="cerrando sesion..."/>
    )
}
