import { ProgrammeTypePage } from "@/components/site/programme-type-page";

export const metadata = {
  title: "Activities",
  description:
    "Participation-based programmes — open to everyone. Show up, take part, and earn your e-certificate.",
};
export const revalidate = 60;

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>;
}) {
  const { sub } = await searchParams;
  return <ProgrammeTypePage type="activity" activeSub={sub ?? null} />;
}
