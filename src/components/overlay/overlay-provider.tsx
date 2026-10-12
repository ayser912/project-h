"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import type { RankReason } from "@/lib/feed/rank";
import { actions, useAllPosts, useProfileResolver } from "@/lib/store/demo-store";
import { useI18n } from "@/i18n/provider";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CredentialDetails } from "@/components/trust/credential-details";
import { TransparencyPanel } from "@/components/trust/transparency-panel";
import { ReportForm } from "./report-form";

export type Overlay =
  | { kind: "credential"; profileId: string }
  | { kind: "transparency"; postId: string }
  | { kind: "report"; postId?: string; profileId?: string }
  | { kind: "block"; profileId: string }
  | { kind: "why"; reasons: RankReason[] };

const OverlayContext = createContext<{ open: (o: Overlay) => void; close: () => void } | null>(null);

/**
 * One host for app-wide dialogs, so feeds with many posts don't each mount
 * their own modals. Any component can call open({...}).
 */
export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const close = useCallback(() => setOverlay(null), []);
  const value = useMemo(() => ({ open: setOverlay, close }), [close]);

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <OverlayHost overlay={overlay} setOverlay={setOverlay} close={close} />
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used inside <OverlayProvider>");
  return ctx;
}

function OverlayHost({
  overlay,
  setOverlay,
  close,
}: {
  overlay: Overlay | null;
  setOverlay: (o: Overlay | null) => void;
  close: () => void;
}) {
  const { m, fmt } = useI18n();
  const toast = useToast();
  const posts = useAllPosts();
  const resolve = useProfileResolver(m.common.you);

  const post = overlay && "postId" in overlay && overlay.postId ? posts.find((p) => p.id === overlay.postId) : undefined;
  const profileId =
    overlay && "profileId" in overlay && overlay.profileId ? overlay.profileId : post?.authorId;
  const profile = profileId ? resolve(profileId) : undefined;

  return (
    <>
      <Dialog
        open={overlay?.kind === "credential" && !!profile}
        onClose={close}
        title={profile?.organization ? m.credential.orgTitle : m.credential.title}
        description={profile?.displayName}
      >
        {profile && <CredentialDetails profile={profile} />}
      </Dialog>

      <Dialog open={overlay?.kind === "transparency" && !!post && !!profile} onClose={close} title={m.trust.dialogTitle}>
        {post && profile && (
          <TransparencyPanel
            post={post}
            author={profile}
            onViewCredentials={() => setOverlay({ kind: "credential", profileId: profile.id })}
            onReport={() => setOverlay({ kind: "report", postId: post.id })}
          />
        )}
      </Dialog>

      <Dialog
        open={overlay?.kind === "report"}
        onClose={close}
        title={overlay?.kind === "report" && !overlay.postId ? m.report.profileTitle : m.report.title}
        description={m.report.intro}
      >
        {overlay?.kind === "report" && (
          <ReportForm
            onCancel={close}
            onSubmit={(reason, details) => {
              actions.addReport({
                reason,
                details,
                postId: overlay.postId,
                profileId: overlay.postId ? undefined : overlay.profileId,
              });
              close();
              toast(m.report.sent);
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={overlay?.kind === "block" && !!profile}
        onClose={close}
        title={fmt(m.block.title, { name: profile?.displayName ?? "" })}
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              {m.common.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!profile) return;
                actions.block(profile.id);
                close();
                toast(fmt(m.block.done, { name: profile.displayName }), {
                  label: m.common.undo,
                  onAction: () => actions.unblock(profile.id),
                });
              }}
            >
              {m.block.confirm}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">{m.block.body}</p>
      </Dialog>

      <Dialog open={overlay?.kind === "why"} onClose={close} title={m.feed.whyTitle}>
        {overlay?.kind === "why" && (
          <div>
            <p className="text-sm text-muted">{m.feed.whyIntro}</p>
            <ul className="mt-3 space-y-2">
              {(overlay.reasons.length ? overlay.reasons : []).map((r) => (
                <li key={r} className="flex items-center gap-2.5 text-sm">
                  <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-primary">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {m.feed.reasons[r]}
                </li>
              ))}
              {overlay.reasons.length === 0 && <li className="text-sm">{m.feed.whyNone}</li>}
            </ul>
            <p className="mt-4 rounded-2xl bg-surface-2 p-3 text-xs text-muted">{m.feed.whySafety}</p>
          </div>
        )}
      </Dialog>
    </>
  );
}
