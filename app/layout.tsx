import "./globals.css";

export const metadata = {
  title: "Hunt: Showdown 1896 — loadout randomizer",
  description: "Random loadout generator for Hunt: Showdown 1896"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
