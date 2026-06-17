"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToasts, ToastTray } from "../../components/Toast";
import { isHtmlEmpty, isHtmlTooLarge } from "@/lib/validate";
import { getLocalEditToken } from "@/lib/storage";

export default function ManagePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toasts, showToast } = useToasts();

  const [editToken, setEditToken] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [html, setHtml] = useState("");
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function unlockAndLoad(token: string) {
    setLoadState("loading");
    setLoadError("");
    try {
      const res = await fetch(`/api/get?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoadState("error");
        setLoadError(data.error || "We could not find that page.");
        return;
      }
      setHtml(data.html);
      setEditToken(token);
      setUnlocked(true);
      setLoadState("idle");
    } catch {
      setLoadState("error");
      setLoadError("You appear to be offline. Check your connection and try again.");
    }
  }

  useEffect(() => {
    const local = getLocalEditToken(id);
    if (local) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void unlockAndLoad(local);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUnlock() {
    if (!keyInput.trim()) {
      showToast("Please paste your secret key.", "error");
      return;
    }
    setUnlocking(true);
    try {
      await unlockAndLoad(keyInput.trim());
    } finally {
      setUnlocking(false);
    }
  }

  async function handleSave() {
    if (isHtmlEmpty(html)) {
      showToast("Please paste some code first.", "error");
      return;
    }
    if (isHtmlTooLarge(html)) {
      showToast("That page is too large. The limit is 1 MB.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, editToken, html }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || "Something went wrong saving your page. Please try again.", "error");
        return;
      }
      showToast("Saved.", "success");
    } catch {
      showToast("You appear to be offline. Check your connection and try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, editToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || "Something went wrong. Please try again.", "error");
        return;
      }
      setDeleted(true);
      showToast("Deleted.", "success");
    } catch {
      showToast("You appear to be offline. Check your connection and try again.", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (deleted) {
    return (
      <div className="page-shell">
        <div className="wordmark">PageMint</div>
        <div className="card center-text">
          <h1 className="success-heading">Page deleted.</h1>
          <p>Your page has been removed.</p>
          <div className="btn-row">
            <Link className="btn btn-primary" href="/">
              Go home
            </Link>
          </div>
        </div>
        <ToastTray toasts={toasts} />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="page-shell">
        <div className="wordmark">PageMint</div>
        <div className="card">
          {loadState === "error" ? (
            <>
              <p className="hint" style={{ marginBottom: 16 }}>
                {loadError}
              </p>
              <div className="btn-row">
                <button className="btn btn-secondary" onClick={() => setLoadState("idle")}>
                  Try again
                </button>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="key-input">Paste your secret key to edit this page</label>
              <div className="field-row">
                <input
                  id="key-input"
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
              </div>
              <div className="btn-row">
                <button className="btn btn-primary" onClick={handleUnlock} disabled={unlocking}>
                  {unlocking ? (
                    <>
                      <span className="spinner" /> Working...
                    </>
                  ) : (
                    "Unlock"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
        <ToastTray toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="wordmark">PageMint</div>
      <div className="card">
        <label htmlFor="manage-html">Your code</label>
        <textarea id="manage-html" value={html} onChange={(e) => setHtml(e.target.value)} />
        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span className="spinner" /> Working...
              </>
            ) : (
              "Save changes"
            )}
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Working..." : "Delete page"}
          </button>
        </div>
      </div>
      <ToastTray toasts={toasts} />
    </div>
  );
}
