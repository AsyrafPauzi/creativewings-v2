import { ProgrammeTypePage } from "@/components/site/programme-type-page";

export const metadata = {
  title: "Competitions",
  description:
    "Judged briefs with prizes, mentorship, and a public showcase. Submit work, get recognised.",
};
export const revalidate = 60;

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>;
}) {
  const { sub } = await searchParams;
  return <ProgrammeTypePage type="competition" activeSub={sub ?? null} />;
}
