import { useMemo, useState } from "react";

const defaultBody = `<header style="padding:20px; background:#0f172a; color:white;">
  <h1 style="margin:0;">Demo Website</h1>
  <nav style="margin-top:10px;">
    <a href="#" style="color:#93c5fd; margin-right:16px;">Home</a>
    <a href="#" style="color:#93c5fd; margin-right:16px;">About</a>
    <a href="#" style="color:#93c5fd;">Contact</a>
  </nav>
</header>

<main style="padding:24px; font-family:Arial, sans-serif;">
  <h2>Cookie Banner Test Page</h2>
  <p>This is a public demo page for CookieYes verification and scanning.</p>
  <button style="padding:10px 16px; border:none; border-radius:6px; background:#2563eb; color:#fff;">
    Sample Button
  </button>
</main>`;

const defaultScript = `<!-- Start cookieyes banner -->
<script id="cookieyes" type="text/javascript" src=""></script>
<!-- End cookieyes banner -->`;

export default function App() {
  const [slug, setSlug] = useState("my-brand");
  const [siteUrl, setSiteUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("Demo Website");
  const [cookieScript, setCookieScript] = useState(defaultScript);
  const [bodyHtml, setBodyHtml] = useState(defaultBody);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const demoUrl = useMemo(() => {
    const base = window.location.origin;
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    return `${base}/demo/${cleanSlug || "my-brand"}`;
  }, [slug]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/save-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug,
          siteUrl,
          pageTitle,
          cookieScript,
          bodyHtml
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save demo");
      }

      showMessage("Saved successfully");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/get-demo?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load demo");
      }

      if (!data.demo) {
        showMessage("No saved demo found for this slug");
        return;
      }

      setSiteUrl(data.demo.site_url || "");
      setPageTitle(data.demo.page_title || "Demo Website");
      setCookieScript(data.demo.cookie_script || defaultScript);
      setBodyHtml(data.demo.body_html || defaultBody);
      showMessage("Loaded successfully");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="editor-panel">
        <h1>CookieYes Demo Builder</h1>
        <p className="subtitle">
          Use the demo URL below during CookieYes onboarding. After CookieYes gives
          you the script, paste it here and save. Verification should use the same demo URL.
        </p>

        <div className="field">
          <label>Demo Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-brand"
          />
        </div>

        <div className="field">
          <label>Website URL used in CookieYes</label>
          <input
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://example.com or the demo URL"
          />
        </div>

        <div className="field">
          <label>Page Title</label>
          <input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder="Demo Website"
          />
        </div>

        <div className="demo-url-box">
          <div className="demo-label">Public Demo URL</div>
          <a href={demoUrl} target="_blank" rel="noreferrer">
            {demoUrl}
          </a>
        </div>

        <div className="button-row">
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button onClick={handleLoad} className="secondary" disabled={loading}>
            Load
          </button>
          <a className="link-button" href={demoUrl} target="_blank" rel="noreferrer">
            Open Demo URL
          </a>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="field">
          <label>CookieYes Script</label>
          <textarea
            value={cookieScript}
            onChange={(e) => setCookieScript(e.target.value)}
            rows={8}
            spellCheck="false"
          />
        </div>

        <div className="field">
          <label>Body HTML</label>
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            rows={16}
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
