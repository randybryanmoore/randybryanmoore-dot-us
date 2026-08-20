import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Richmond Symphony — Advancement & Operations Candidate Dossier",
  description: "Confidential candidate portfolio for Randy Bryan Moore, MSW — Assistant Director, Advancement Systems & Operations.",
  robots: { index: false, follow: false, nocache: true },
};

export default function SymphonyPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/symphony/index.html"
        title="Richmond Symphony Candidate Dossier"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="autoplay; clipboard-write"
      />
    </div>
  );
}
