import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Badges" };

export default async function BadgesPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const [{ data: catalog }, { data: earned }] = await Promise.all([
    supabase.from("badges").select("*").eq("is_active", true).order("tier"),
    supabase
      .from("user_badges")
      .select("badge_id, awarded_at, badges:badge_id(slug, name, description, tier, icon_url)")
      .eq("user_id", user.id),
  ]);

  const earnedSlugs = new Set(
    (earned ?? []).map((row) => {
      const b = Array.isArray(row.badges) ? row.badges[0] : row.badges;
      return b?.slug;
    }),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Badges</h1>
        <p className="text-muted-foreground">
          Earn badges as you participate in campaigns and grow on Creative Wings.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(catalog ?? []).map((b) => {
          const owned = earnedSlugs.has(b.slug);
          return (
            <Card key={b.id} className={owned ? undefined : "opacity-70"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{b.name}</CardTitle>
                  {b.tier && <Badge variant="outline" className="capitalize">{b.tier}</Badge>}
                </div>
                <CardDescription>{b.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {owned ? (
                  <Badge variant="success">Earned</Badge>
                ) : (
                  <Badge variant="secondary">Not yet</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
