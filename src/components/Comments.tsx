"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { addCommentAction, deleteCommentAction } from "@/app/community/actions";
import type { BuildComment } from "@/lib/communityBuilds";

export default function Comments({
  buildId,
  comments,
  currentUserId,
  admin,
  loggedIn,
}: {
  buildId: string;
  comments: BuildComment[];
  currentUserId: string | null;
  admin: boolean;
  loggedIn: boolean;
}) {
  const t = useTranslations("community");
  const locale = useLocale();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const fmt = (iso: string) => {
    try { return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); } catch { return ""; }
  };

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    start(async () => {
      await addCommentAction(buildId, text);
      setBody("");
      router.refresh();
    });
  };
  const del = (id: string) => start(async () => { await deleteCommentAction(buildId, id); router.refresh(); });

  return (
    <section className="card cb-section">
      <h2>{t("commentsTitle")} ({comments.length})</h2>
      {comments.length === 0 && <p className="muted">{t("noComments")}</p>}
      <div className="cb-comments">
        {comments.map((c) => (
          <div key={c.id} className="cb-comment">
            <div className="cb-comment-h">
              <b>{c.authorName}</b>
              <span className="muted">{fmt(c.createdAt)}</span>
              {(c.userId === currentUserId || admin) && (
                <button type="button" className="cb-comment-del" disabled={pending} onClick={() => del(c.id)}>{t("deleteC")}</button>
              )}
            </div>
            <p className="cb-comment-body">{c.body}</p>
          </div>
        ))}
      </div>
      {loggedIn ? (
        <div className="cb-comment-form">
          <textarea className="cb-input cb-textarea" rows={3} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("commentPh")} />
          <button type="button" className="btn btn-primary" disabled={pending || !body.trim()} onClick={submit}>{t("post")}</button>
        </div>
      ) : (
        <p className="muted">{t("loginToComment")}</p>
      )}
    </section>
  );
}
