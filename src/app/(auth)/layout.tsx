import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden cw-gradient-bg p-10 text-white md:flex md:flex-col md:justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
            CW
          </span>
          Creative Wings
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Where creativity takes flight.
          </h2>
          <p className="mt-3 max-w-md text-white/85">
            Join thousands of contestants, creators and organisations running
            national art competitions and school activities.
          </p>
        </div>
        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} Creative Wings · Yibon Mag Enterprise
        </p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
