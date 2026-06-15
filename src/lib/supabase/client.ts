import { createBrowserClient } from "@supabase/ssr";

// NOTE: once you run `npm run db:gen-types`, change `createBrowserClient(...)`
// below to `createBrowserClient<Database>(...)` and import { Database } from
// "./database.types" to get full table-level types in the browser client.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
