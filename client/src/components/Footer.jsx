import { Zap } from "lucide-react";

const SERVICES = [
  { label: "PostgreSQL", desc: "Database" },
  { label: "Blob Storage", desc: "Images" },
  { label: "Computer Vision", desc: "AI Tags" },
  { label: "Language AI", desc: "Sentiment" },
  { label: "Translator", desc: "i18n" },
  { label: "App Insights", desc: "Monitoring" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white fill-white" />
              </div>
              <span className="font-bold text-zinc-900">ShopCloud</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              A cloud-native product catalogue<br />

            </p>
          </div>

          {/* Azure Services */}
          <div className="md:col-span-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Powered by Azure
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {SERVICES.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xs font-semibold text-zinc-700">{s.label}</div>
                  <div className="text-[11px] text-zinc-400">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <p className="text-xs text-zinc-400">Built with React, Node.js & Microsoft Azure</p>
          <p className="text-xs text-zinc-300"></p>
        </div>
      </div>
    </footer>
  );
}
