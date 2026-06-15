import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Organisers" };
export const revalidate = 120;

export default async function OrganizersDirectoryPage() {
  const supabase = await createClient();
  const { data: organizers } = await supabase
    .from("organizers")
    .select("id, slug, business_name, logo_url, banner_url, industry, about, is_verified, city, country")
    .eq("is_listed", true)
    .order("business_name");

  return (
    <div className="container py-14">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Organisers</h1>
        <p className="mt-2 text-muted-foreground">
          The businesses, NGOs and institutions running campaigns on Creative Wings.
        </p>
      </header>

      {!organizers || organizers.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No listed organisers yet</CardTitle>
            <CardDescription>
              Organisers appear here once they publish their first campaign.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizers.map((o) => (
            <Link key={o.id} href={`/organizer/${o.slug}`} className="group">
              <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
                <div
                  className="h-28 cw-gradient-bg bg-cover bg-center"
                  style={o.banner_url ? { backgroundImage: `url(${o.banner_url})` } : undefined}
                />
                <CardHeader>
                  <div className="-mt-12 mb-2 grid h-16 w-16 place-items-center rounded-xl border bg-card text-lg font-bold text-primary shadow-sm">
                    {o.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.logo_url} alt={o.business_name} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      o.business_name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {o.business_name}
                    {o.is_verified && (
                      <Badge variant="success" className="text-[10px]">
                        Verified
                      </Badge>
                    )}
                  </CardTitle>
                  {(o.industry || o.city) && (
                    <CardDescription>
                      {o.industry}
                      {o.industry && o.city ? " · " : ""}
                      {[o.city, o.country].filter(Boolean).join(", ")}
                    </CardDescription>
                  )}
                </CardHeader>
                {o.about && (
                  <CardContent className="line-clamp-3 text-sm text-muted-foreground">
                    {o.about}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
