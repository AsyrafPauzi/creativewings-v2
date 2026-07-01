import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import { PageMotion } from "@/components/site/animations/page-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Organizers" };
export const revalidate = 120;

export default async function OrganizersDirectoryPage() {
  const supabase = await createClient();
  const { data: organizers } = await supabase
    .from("organizers")
    .select("id, slug, name, logo_url, banner_url, industry, about, is_verified, city, country")
    .eq("is_listed", true)
    .order("name");

  return (
    <PageMotion hero>
    <div className="cw-container py-14 md:py-20">
      <header data-motion="hero" className="mb-10">
        <span data-motion="hero-item" className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Trusted partners</span>
        <h1 data-motion="hero-item" className="mt-3 text-4xl font-extrabold tracking-tight text-body md:text-5xl">Organizers</h1>
        <p data-motion="hero-item" className="mt-3 max-w-2xl text-text-secondary">
          The brands, NGOs, and institutions running campaigns on Creative Wings.
        </p>
      </header>

      {!organizers || organizers.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No listed organizers yet</CardTitle>
            <CardDescription>
              Organizers appear here once they publish their first campaign.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizers.map((o) => (
            <Link key={o.id} href={`/organizer/${o.slug}`} className="group" data-motion="card">
              <Card className="overflow-hidden transition-all group-hover:-translate-y-0.5 group-hover:shadow-elevated will-change-transform">
                <div
                  className="h-28 cw-gradient-bg bg-cover bg-center"
                  style={o.banner_url ? { backgroundImage: `url(${o.banner_url})` } : undefined}
                />
                <CardHeader>
                  <div className="-mt-12 mb-2 grid h-16 w-16 place-items-center rounded-md border bg-card text-lg font-extrabold text-secondary shadow-soft">
                    {o.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.logo_url} alt={o.name} className="h-full w-full rounded-md object-cover" />
                    ) : (
                      o.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {o.name}
                    {o.is_verified && (
                      <span className="inline-flex items-center gap-1 text-success text-xs">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
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
                  <CardContent className="line-clamp-3 text-sm text-text-secondary">
                    {o.about}
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
    </PageMotion>
  );
}
