"use client";

import { Button } from "@/components/ui/button";
import type { CWRole } from "@/lib/supabase/database.types";
import { setUserAdminAction, setUserRoleAction } from "@/app/dashboard/admin/users/actions";

const ROLES: CWRole[] = ["contestant", "creator", "organizer", "admin"];

export function UserAdminControls({
  userId,
  currentRole,
  isAdmin,
  isSelf,
}: {
  userId: string;
  currentRole: CWRole;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="rounded-md border px-2 py-1 text-xs"
        defaultValue={currentRole}
        disabled={isSelf}
        onChange={async (e) => {
          await setUserRoleAction(userId, e.target.value as CWRole);
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {!isSelf && (
        <form action={async () => {
          await setUserAdminAction(userId, !isAdmin);
        }}>
          <Button type="submit" size="sm" variant={isAdmin ? "outline" : "default"}>
            {isAdmin ? "Revoke admin" : "Grant admin"}
          </Button>
        </form>
      )}
    </div>
  );
}
