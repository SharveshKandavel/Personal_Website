import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { Universe } from "@/components/Universe";
import { SplashIntro } from "@/components/SplashIntro";
import { SiteHUD } from "@/components/SiteHUD";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  const handleBuildingEnter = useCallback(
    (route: string) => {
      navigate({ to: route });
    },
    [navigate],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <SplashIntro />
      <SiteHUD />
      <Universe onBuildingEnter={handleBuildingEnter} />
    </div>
  );
}
