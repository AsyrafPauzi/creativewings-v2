import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// NOTE: once you run `npm run db:gen-types`, swap `createServerClient(...)`
// below to `createServerClient<Database>(...)` to get table-level typing.
// Until then we use the looser shape so the app builds without a real Supabase
// project.

type CookiesToSet = { name: string; value: string; options?: CookieOptions }[];

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Setting cookies from a Server Component is a no-op when there's
            // a middleware refreshing sessions on every request — safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Only use in trusted server contexts (route handlers,
 * server actions, cron). Bypasses RLS — never expose to the browser.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}
