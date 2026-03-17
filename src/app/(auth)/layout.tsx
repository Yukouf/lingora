import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="atmo-page relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="relative z-10 mb-10 font-mono text-2xl font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white"
      >
        Lingora
      </Link>
      <div className="relative z-10 w-full max-w-[400px]">{children}</div>
    </div>
  );
}
