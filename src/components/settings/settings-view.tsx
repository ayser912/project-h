"use client";

import { useState } from "react";
import { Download, Lock, RotateCcw, Trash2 } from "lucide-react";
import { topics } from "@/lib/data/topics";
import { getSeedProfile } from "@/lib/data/repository";
import { actions, useDemoState } from "@/lib/store/demo-store";
import { clearMedia } from "@/lib/store/media-db";
import { useI18n } from "@/i18n/provider";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { SelectChip } from "@/components/topic/topic-chip";
import { LanguageSwitch } from "@/components/layout/language-switch";

function Section({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="border-b border-line px-4 py-6 sm:px-5">
      <h2 id={id} className="mb-4 text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl bg-surface-2 px-3 py-2.5 text-[0.95rem] ring-1 ring-inset ring-transparent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary";

export function SettingsView() {
  const { m, pick } = useI18n();
  const state = useDemoState();
  const toast = useToast();
  const [draft, setDraft] = useState<typeof state.me | null>(null);
  const me = draft ?? state.me;

  const exportData = () => {
    // Data portability: everything this demo stores about the person.
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-h-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header className="border-b border-line px-4 pt-6 pb-4 sm:px-5">
        <h1 className="text-2xl font-bold">{m.settings.title}</h1>
      </header>

      <Section title={m.settings.profile} id="s-profile">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            actions.updateMe({
              displayName: me.displayName.trim().slice(0, 50),
              bio: me.bio.trim().slice(0, 300),
              country: me.country,
              showCountry: me.showCountry,
            });
            setDraft(null);
            toast(m.settings.saved);
          }}
        >
          <label className="block">
            <span className="text-sm font-medium">{m.settings.displayName}</span>
            <input
              value={me.displayName}
              maxLength={50}
              dir="auto"
              placeholder={m.common.you}
              onChange={(e) => setDraft({ ...me, displayName: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{m.settings.username}</span>
            <input value="you.demo" readOnly dir="ltr" aria-describedby="username-hint" className={`${inputClass} text-muted`} />
            <span id="username-hint" className="text-xs text-muted">
              {m.settings.usernameLocked}
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium">{m.settings.bio}</span>
            <textarea
              value={me.bio}
              maxLength={300}
              rows={3}
              dir="auto"
              onChange={(e) => setDraft({ ...me, bio: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{m.settings.country}</span>
            <select
              value={me.country}
              onChange={(e) => setDraft({ ...me, country: e.target.value })}
              className={inputClass}
            >
              <option value="">{m.settings.countryNone}</option>
              {Object.entries(m.countries).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={me.showCountry}
              onChange={(e) => setDraft({ ...me, showCountry: e.target.checked })}
              className="size-4 accent-[var(--ph-primary)]"
            />
            {m.settings.showCountry}
          </label>
          <Button type="submit" disabled={!draft}>
            {m.settings.saveChanges}
          </Button>
        </form>
      </Section>

      <Section title={m.settings.language} id="s-language">
        <LanguageSwitch />
      </Section>

      <Section title={m.settings.interests} id="s-interests">
        <p className="-mt-2 mb-3 flex items-center gap-1.5 text-sm text-muted">
          <Lock className="size-3.5" aria-hidden />
          {m.settings.interestsHint}
        </p>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const on = state.interests.includes(t.slug);
            return (
              <SelectChip
                key={t.slug}
                icon={t.icon}
                selected={on}
                onClick={() =>
                  actions.setInterests(on ? state.interests.filter((x) => x !== t.slug) : [...state.interests, t.slug])
                }
              >
                {pick(t.name)}
              </SelectChip>
            );
          })}
        </div>
      </Section>

      <Section title={m.settings.privacy} id="s-privacy">
        <ul className="space-y-2 text-sm text-muted">
          {m.settings.privacyNotes.map((n) => (
            <li key={n} className="flex items-start gap-2">
              <Lock className="mt-1 size-3.5 shrink-0 text-primary" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <h3 className="mt-6 mb-2 font-semibold">{m.settings.blocked}</h3>
        {state.blocked.length === 0 ? (
          <p className="text-sm text-muted">{m.settings.blockedNone}</p>
        ) : (
          <ul>
            {state.blocked.map((id) => {
              const p = getSeedProfile(id);
              if (!p) return null;
              return (
                <li key={id} className="flex items-center gap-3 py-2">
                  <Avatar profile={p} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-medium" dir="auto">
                    {p.displayName}
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => actions.unblock(id)}>
                    {m.block.unblock}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title={m.settings.account} id="s-account">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>
            <Download className="size-4" aria-hidden />
            {m.settings.exportData}
          </Button>
          <Button variant="secondary" disabled title={m.settings.accountNote}>
            <Trash2 className="size-4" aria-hidden />
            {m.settings.deleteAccount}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">{m.settings.accountNote}</p>

        <h3 className="mt-6 font-semibold">{m.settings.demo}</h3>
        <p className="mt-1 text-sm text-muted">{m.settings.demoBody}</p>
        <Button
          variant="danger"
          className="mt-3"
          onClick={async () => {
            if (!window.confirm(m.settings.resetConfirm)) return;
            actions.reset();
            await clearMedia();
            setDraft(null);
            toast(m.settings.resetDone);
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          {m.settings.reset}
        </Button>
      </Section>
    </div>
  );
}
