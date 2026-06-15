import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Brand Story" };

const TEAM = [
  {
    name: "Abner Yap",
    role: "Founder",
    body: "Visionary leader overseeing ecosystem growth, partnerships, and strategic direction — integrating brand, education, and technology for long-term sustainability.",
    pill: "Vision · Strategy · Learning Programs",
  },
  {
    name: "Vion Pek",
    role: "Head of Creative, Design & Branding",
    body: "Owns all creative design, branding, and visual campaigns that are central to Creative Wings' identity and sponsor appeal.",
  },
  {
    name: "Asyraf",
    role: "Head of Platform & Technology",
    body: "Building and maintaining the Creative Wings platform. Under him sit the Full-Stack Developer and UI/UX Designer, keeping the technical team cohesive.",
  },
  {
    name: "Sherene Chin",
    role: "Operations Manager of Events & Program",
    body: "Organising, coordinating, and executing the event pipeline and yearly programme calendar. Supports school outreach coordination.",
  },
  {
    name: "Amanda Yeo",
    role: "Head of Strategy & External Affairs",
    body: "Handles government relations, ESG partnerships, institutional sponsorships, and investor outreach — door-opener to corridors of power.",
  },
  {
    name: "Regine Yap · YW Chan",
    role: "Co-Managers of Finance & HR",
    body: "Manage cash flow, budget discipline, KPI tracking, and ensuring execution stays on track toward the 5-year milestones.",
  },
];

export default function BrandStoryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#0d0d12] py-20 text-white">
        <div className="container max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Brand Story</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            &ldquo;Together, We Help Young Talents Soar&rdquo;
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80">
            Every child carries hidden talents waiting to take flight. At Creative Wings, we
            believe students deserve more than just classroom grades — they deserve a platform
            to showcase their creativity, skills, and passions.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-16">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Born from a vision to nurture the next generation, Creative Wings was created as a
          safe, inspiring space where young people can learn, compete, and shine. From art to
          sports, STEM to storytelling, our contests and exhibitions help students build real
          portfolios that reflect who they truly are.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          We are here to help every student spread their wings, soar higher, and step
          confidently into their future.
        </p>
      </section>

      {/* Vision + Mission */}
      <section className="container max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              To be Asia&apos;s most trusted youth platform where every student can discover
              their creativity, build confidence, and soar into a brighter future.
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Empowering students through fun, accessible contests that nurture creativity and diverse skills.</p>
              <p>Connecting young talents with mentors, schools, NGOs, and industry partners for guidance and inspiration.</p>
              <p>Showcasing achievements through online portfolios and offline exhibitions, giving recognition beyond grades.</p>
              <p>Preparing the next generation with confidence, creativity, and community spirit to thrive in life and careers.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partners */}
      <section className="container max-w-4xl py-16">
        <h2 className="text-3xl font-bold tracking-tight">Our Partners</h2>
        <p className="mt-4 text-muted-foreground">
          Creative Wings is made possible through the support of passionate partners:
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { t: "NGOs", b: "championing youth empowerment and education" },
            { t: "Media partners", b: "amplifying student voices and achievements" },
            { t: "Community & Industry", b: "contributing expertise, resources and mentorship" },
          ].map((p) => (
            <li key={p.t} className="rounded-xl border bg-card p-5">
              <div className="text-base font-semibold">{p.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{p.b}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          Every partnership is a step towards building a stronger, more connected platform
          for students.
        </p>
      </section>

      {/* Team */}
      <section className="bg-muted/30 py-16">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold tracking-tight">Organisation &amp; Leadership</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Creative Wings is powered by a multidisciplinary team of educators, creators,
            operators, and builders. Together, we design learning experiences that unlock
            youth potential and create meaningful impact across schools and communities.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((m) => (
              <Card key={m.name}>
                <CardHeader>
                  <div className="grid h-14 w-14 place-items-center rounded-full cw-gradient-bg text-lg font-bold text-white">
                    {m.name
                      .split(/[\s·]+/)
                      .map((p) => p[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <CardTitle className="mt-3 text-lg">{m.name}</CardTitle>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {m.role}
                  </p>
                  {m.pill && (
                    <p className="text-xs text-muted-foreground">{m.pill}</p>
                  )}
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {m.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
