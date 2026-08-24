import { Shell } from "@/components/shell";
import { CloudArchitecture } from "@/components/platform";

export const metadata = {
  title: "Renewable Energy Intelligence Cloud | PowerChain",
  description: "PowerChain cloud, fabric, runtime, studio and ecosystem capability catalog.",
};

export default function PlatformPage() {
  return (
    <Shell>
      <div className="content-container space-y-7">
        <header className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-[#0b4f3e] via-[#0f5a46] to-[#102f29] p-6 text-white shadow-[0_24px_70px_-30px_rgba(15,90,70,.8)] sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-100">PowerChain Next-Generation Digital Ecosystem</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-5xl">Renewable Energy Intelligence Cloud</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/85 sm:text-base">A unified enterprise architecture connecting foundations, platform clouds, fabrics, managed runtimes, visual studios, intelligence products, marketplaces and global ecosystem services.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
              {["Energy Infrastructure", "Digital Infrastructure", "Financial Infrastructure", "Enterprise Infrastructure", "Ecosystem Infrastructure"].map((pillar) => <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur" key={pillar}>{pillar}</span>)}
            </div>
          </div>
        </header>
        <CloudArchitecture />
      </div>
    </Shell>
  );
}
