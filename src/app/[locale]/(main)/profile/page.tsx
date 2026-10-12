"use client";

import { useMeProfile } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { ProfileView } from "@/components/profile/profile-view";

/** The signed-in person's own profile (demo identity until phase 2 auth). */
export default function MyProfilePage() {
  const { m } = useI18n();
  const me = useMeProfile(m.common.you);
  return <ProfileView profile={me} />;
}
