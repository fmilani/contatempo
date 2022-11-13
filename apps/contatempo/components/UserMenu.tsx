"use client";

import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User as UserIcon } from "lucide-react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: Pick<User, "name" | "email" | "image">;
}

export default function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="p-4">
        <Avatar.Root className="h-8 w-8 flex items-center justify-center overflow-hidden rounded-full bg-slate-200">
          <Avatar.Image alt="User picture" src={user.image} />
          <Avatar.Fallback delayMs={500}>
            <span className="sr-only">{user.name}</span>
            <UserIcon />
          </Avatar.Fallback>
        </Avatar.Root>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="w-60 mt-2 overflow-hidden rounded-xl bg-white drop-shadow-sm animate-in slide-in-from-top-1"
        >
          <div className="flex items-center justify-start gap-2 p-4">
            <div className="flex flex-col space-y-1 leading-none">
              {user.name && <p className="font-medium">{user.name}</p>}
              {user.email && <p className="truncate text-sm">{user.email}</p>}
            </div>
          </div>
          <DropdownMenu.Separator className="h-px bg-slate-200" />
          <DropdownMenu.Item
            className="flex cursor-pointer select-none items-center py-2 px-4 text-sm outline-none focus:bg-slate-50 focus:text-black"
            onSelect={(event) => {
              event.preventDefault();
              signOut({ callbackUrl: "/" });
            }}
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
