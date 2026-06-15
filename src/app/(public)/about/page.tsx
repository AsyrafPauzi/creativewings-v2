import { Award, GraduationCap, Sparkles, Trophy } from "lucide-react";

export const metadata = { title: "About Creative Wings" };

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-16">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        About <span className="cw-gradient-text">Creative Wings</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Creative Wings is a national platform run by Yibon Mag Enterprise to make
        creative competitions and school activities accessible — for contestants,
        creators, schools, and the organisations that sponsor them.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Feature
          icon={<Trophy className="h-5 w-5" />}
          title="Run national campaigns"
          body="Organisers launch competitions with age brackets, prize pools, judging criteria, sponsor coupons and KPI tracking."
        />
        <Feature
          icon={<GraduationCap className="h-5 w-5" />}
          title="Connect with schools"
          body="Schools register, receive tokenised upload portals and bulk-submit student artwork for partners to review."
        />
        <Feature
          icon={<Sparkles className="h-5 w-5" />}
          title="Build a creator profile"
          body="Every creator gets a public portfolio at /profile/your-name to showcase work and history across campaigns."
        />
        <Feature
          icon={<Award className="h-5 w-5" />}
          title="Earn certificates and badges"
          body="Automatic e-certificates for participants, plus a badge ledger that grows with every submission."
        />
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
