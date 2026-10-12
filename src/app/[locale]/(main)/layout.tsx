import { AppShell } from "@/components/layout/app-shell";

export default function MainLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell>{children}</AppShell>;
}
