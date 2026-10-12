import {
  Apple,
  Baby,
  Brain,
  BriefcaseMedical,
  Droplet,
  Dumbbell,
  Flower2,
  HeartPulse,
  Moon,
  Pill,
  Ribbon,
  ShieldCheck,
  Smile,
  Sparkles,
  Sprout,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Apple,
  Baby,
  Brain,
  BriefcaseMedical,
  Droplet,
  Dumbbell,
  Flower2,
  HeartPulse,
  Moon,
  Pill,
  Ribbon,
  ShieldCheck,
  Smile,
  Sparkles,
  Sprout,
  Stethoscope,
  Users,
};

export function TopicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Stethoscope;
  return <Icon className={className} aria-hidden />;
}
