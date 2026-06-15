import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Creators" };
export const revalidate = 120;

export default async function CreatorsDirectoryPage() {
  const supabase = await createClient();
  const { data: creators } = await supabase
    .from("creators")
    .select(
      "id, slug, display_name, tagline, bio, profile_image_url, cover_image_url, city, country",
    )
    .eq("is_listed", true)
    .order("display_name");

  return (
    <div className="container py-14">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Creators</h1>
        <p className="mt-2 text-muted-foreground">
          Portfolios from the most exciting creators on the platform.
        </p>
      </header>

      {!creators || creators.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No creators listed yet</CardTitle>
            <CardDescription>
              Creators appear here once they complete their profile and choose to be listed.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creators.map((c) => (
            <Link key={c.id} href={`/profile/${c.slug}`} className="group">
              <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
                <div
                  className="h-24 cw-gradient-bg bg-cover bg-center"
                  style={
                    c.cover_image_url
                      ? { backgroundImage: `url(${c.cover_image_url})` }
                      : undefined
                  }
                />
                <CardHeader>
                  <div className="-mt-12 mb-2 grid h-16 w-16 place-items-center overflow-hidden rounded-full border bg-background text-lg font-bold text-primary shadow-sm">
                    {c.profile_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.profile_image_url}
                        alt={c.display_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      c.display_name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <CardTitle className="text-base">{c.display_name}</CardTitle>
                  {c.tagline && <CardDescription>{c.tagline}</CardDescription>}
                </CardHeader>
                {c.bio && (
                  <CardContent className="line-clamp-3 text-sm text-muted-foreground">
                    {c.bio}
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
