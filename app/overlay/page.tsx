import { redirect } from "next/navigation";

// Old bare /overlay URL from before the three-layout rewrite — send it to
// the default layout instead of 404ing on an existing OBS browser source.
export default function OverlayRedirectPage() {
  redirect("/overlay/dossier");
}
