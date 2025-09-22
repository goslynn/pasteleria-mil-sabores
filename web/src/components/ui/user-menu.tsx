'use client'

import Link from "next/link"
import * as React from "react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type UserMenuProps = {
    trigger?: React.ReactNode
    userName?: string
    userEmail?: string
    userAvatar?: string
    loginHref?: string
    items?: UserMenuItem[]
}

export type UserMenuItem = {
    key: string;
    label: string;
    href?: string;
    destructive?: boolean;
    separatorAbove?: boolean
}

export function UserMenu({
                             trigger,
                             userName,
                             userEmail,
                             userAvatar,
                             items = [],
                         }: UserMenuProps) {

    const initials = (userName ?? "")
        .trim().split(/\s+/).map(p => p[0]?.toUpperCase() ?? "").join("").slice(0, 2)

    const Trigger =
        trigger ??
        (
            <div
                className="h-9 px-2 py-0 inline-flex items-center hover:bg-accent hover:text-accent-foreground rounded-md">
                {userAvatar?.trim() ? (
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={userAvatar} alt={userName}/>
                        <AvatarFallback className="text-xs">{initials || "?"}</AvatarFallback>
                    </Avatar>
                ) : (
                    <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <span className="text-[10px] font-semibold">{initials || "?"}</span>
          </span>
                )}
                <span className="sr-only">User menu</span>
            </div>
        )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{Trigger}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {userName && (
                    <>
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                {!!userEmail?.trim() && (
                                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                    </>
                )}

                {items.map((it, idx) => (
                    <React.Fragment key={it.key ?? `${it.label}-${idx}`}>
                        {it.separatorAbove && <DropdownMenuSeparator/>}
                        <DropdownMenuItem
                            asChild={!!it.href}
                            className={it.destructive ? "text-destructive focus:text-destructive focus:bg-destructive/10" : undefined}
                        >
                            {it.href ? <Link href={it.href} prefetch={false}>{it.label}</Link> :
                                <span>{it.label}</span>}
                        </DropdownMenuItem>
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
