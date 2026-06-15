import { SDG_GOALS } from "@/lib/utils";

export function SdgRow({
  goals,
  size = "sm",
}: {
  goals: number[];
  size?: "sm" | "md";
}) {
  if (!goals || goals.length === 0) return null;

  const dim = size === "md" ? "h-10 w-10 text-xs" : "h-8 w-8 text-[10px]";

  return (
    <div className="flex flex-wrap gap-1.5">
      {goals.map((goal) => {
        const meta = SDG_GOALS[goal];
        return (
          <span
            key={goal}
            title={meta ? `SDG ${goal} · ${meta.title}` : `SDG ${goal}`}
            className={`grid ${dim} place-items-center rounded-md font-bold text-white shadow-sm`}
            style={{ backgroundColor: meta?.color ?? "#666" }}
          >
            {goal}
          </span>
        );
      })}
    </div>
  );
}
