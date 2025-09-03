"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import {ShoppingBasket} from "lucide-react";

// This is sample data.
const data = {
  user: {
    name: "root",
    email: "sample@mail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Categorias",
      url: "#",
      icon: ShoppingBasket,
      isActive: true,
      items: [
        {
          title: "Cat1",
          url: "#",
        },
        {
          title: "Cat2",
          url: "#",
        },
        {
          title: "Cat3",
          url: "#",
        },
      ],
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarContent>
                <NavMain items={data.navMain}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
}
