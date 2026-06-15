import { notFound } from "next/navigation";
import { Globe, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("display_name, tagline")
    .eq("slug", slug)
    .maybeSingle();
  return {
    title: data?.display_name ?? "Creator",
    description: data?.tagline ?? undefined,
  };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "id, slug, display_name, tagline, bio, profile_image_url, cover_image_url, city, country, website, facebook_url, instagram_url, behance_url, dribbble_url, tiktok_url, owner_id",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!creator) notFound();

  return (
    <div>
      <div
        className="h-56 cw-gradient-bg bg-cover bg-center md:h-72"
        style={
          creator.cover_image_url
            ? { backgroundImage: `url(${creator.cover_image_url})` }
            : undefined
        }
      />
      <div className="container -mt-16 pb-16 md:-mt-20">
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border bg-background text-lg font-bold text-primary shadow-sm">
              {creator.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={creator.profile_image_url}
                  alt={creator.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                creator.display_name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{creator.display_name}</h1>
              {creator.tagline && (
                <p className="text-muted-foreground">{creator.tagline}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {(creator.city || creator.country) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[creator.city, creator.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {creator.website && (
                  <a
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    href={creator.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe className="h-3 w-3" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {creator.bio && (
            <div className="prose prose-neutral mt-8 max-w-3xl">{creator.bio}</div>
          )}
        </div>

        {/* TODO: portfolio items grid lives here once the portfolio feature ships. */}
      </div>
    </div>
  );
}
