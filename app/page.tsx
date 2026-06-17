"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useToasts, ToastTray } from "./components/Toast";
import { isHtmlEmpty, isHtmlTooLarge } from "@/lib/validate";
import { getSavedPages, saveLocalPage, type SavedPage } from "@/lib/storage";

const PLACEHOLDER = `<!DOCTYPE html>
<html>
  <body>
    <h1>Hello world</h1>
  </body>
</html>`;

type SuccessState = {
  id: string;
  editToken: string;
};

export default function Home() {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [history, setHistory] = useState<SavedPage[]>(() => getSavedPages());
  const { toasts, showToast } = useToasts();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  async function handleCreate() {
    if (isHtmlEmpty(html)) {
      showToast("Please paste some code first.", "error");
      return;
    }
    if (isHtmlTooLarge(html)) {
      showToast("That page is too large. The limit is 1 MB.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        showToast(data.error || "Something went wrong saving your page. Please try again.", "error");
        return;
      }
      saveLocalPage({ id: data.id, editToken: data.editToken, createdAt: Date.now() });
      setHistory(getSavedPages());
      setSuccess({ id: data.id, editToken: data.editToken });
      showToast("Your page is live.", "success");
    } catch {
      showToast("You appear to be offline. Check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, fallbackRef: React.RefObject<HTMLInputElement | null>, label: string) {
    try {
      navigator.clipboard.writeText(text).then(
        () => showToast(`${label} copied.`, "success"),
        () => fallbackCopy(fallbackRef)
      );
    } catch {
      fallbackCopy(fallbackRef);
    }
  }

  function fallbackCopy(ref: React.RefObject<HTMLInputElement | null>) {
    ref.current?.select();
    showToast("Copy failed. The link is selected, press Ctrl+C / Cmd+C.", "error");
  }

  if (success) {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/v/${success.id}`;
    return (
      <div className="page-shell">
        <div className="wordmark">PageMint</div>
        <p className="tagline">Paste your HTML, get a link to share</p>
        <div className="card">
          <h1 className="success-heading">Your page is live.</h1>

          <label htmlFor="share-url">Your shareable link</label>
          <div className="field-row">
            <input id="share-url" ref={linkInputRef} type="text" readOnly value={url} />
            <button className="btn btn-secondary" onClick={() => copyText(url, linkInputRef, "Link")}>
              Copy link
            </button>
          </div>
          <div className="btn-row">
            <a className="btn btn-primary" href={url} target="_blank" rel="noopener noreferrer">
              Open page
            </a>
          </div>

          <div className="key-box">
            <label htmlFor="edit-key">Save your secret key</label>
            <div className="field-row">
              <input id="edit-key" ref={keyInputRef} type="text" readOnly value={success.editToken} />
              <button className="btn btn-secondary" onClick={() => copyText(success.editToken, keyInputRef, "Key")}>
                Copy key
              </button>
            </div>
            <p>This is the only way to edit or delete your page later. Save it somewhere safe.</p>
          </div>

          <div className="btn-row">
            <a className="btn btn-secondary" href={`/manage/${success.id}`}>
              Manage this page
            </a>
          </div>

          <div className="btn-row">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSuccess(null);
                setHtml("");
              }}
            >
              Create another
            </button>
          </div>
        </div>
        <ToastTray toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="hero">
        <span className="badge">Free forever &middot; No account needed</span>
        <div className="wordmark">PageMint</div>
        <h1 className="hero-title">Paste your HTML. Get a link to share.</h1>
        <p className="tagline">
          PageMint turns any pasted HTML into a live, public web page in one click — no code to write,
          nothing to install, and no sign up.
        </p>
      </div>

      <div className="card card-elevated">
        <label htmlFor="html-input">Paste your code here</label>
        <textarea
          id="html-input"
          placeholder={PLACEHOLDER}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />
        <p className="hint">
          Pasted pages run their own code, so only paste content you trust or created yourself.
        </p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Working...
              </>
            ) : (
              "Create my link"
            )}
          </button>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h3>Live in one click</h3>
          <p>Paste, click, done. Your page is online instantly with a link anyone can open.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🔒</span>
          <h3>Only you can edit it</h3>
          <p>You get a secret key at creation. It&apos;s the only way to change or delete the page later.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">∞</span>
          <h3>Free, forever</h3>
          <p>No account, no credit card, no expiring links. Your page stays up until you remove it.</p>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history">
          <h2>Your pages on this device</h2>
          <ul>
            {history.map((p) => (
              <li key={p.id}>
                <Link href={`/manage/${p.id}`}>/v/{p.id}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ToastTray toasts={toasts} />
    </div>
  );
}
