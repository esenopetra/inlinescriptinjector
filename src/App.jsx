import { useEffect, useMemo, useState } from "react";

const defaultHead = `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Preview Site</title>

<!-- Paste your Cookie Banner script below -->
<!-- Example:
<script id="cookieyes" type="text/javascript" src="https://cdn-cookieyes.com/client_data/your-id/script.js"></script>
-->
`;

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
  <p>
    Use this page to test whether your banner script loads correctly in a live preview.
  </p>
  <button style="padding:10px 16px; border:none; background:#2563eb; color:white; border-radius:6px;">
    Sample Button
  </button>
</main>`;

const HEAD_KEY = "cookie_preview_head";
const BODY_KEY = "cookie_preview_body";

export default function App() {
  const [headCode, setHeadCode] = useState(defaultHead);
  const [bodyCode, setBodyCode] = useState(defaultBody);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const savedHead = localStorage.getItem(HEAD_KEY);
    const savedBody = localStorage.getItem(BODY_KEY);

    if (savedHead) setHeadCode(savedHead);
    if (savedBody) setBodyCode(savedBody);
  }, []);

  const previewDocument = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
${headCode}
<style>
  body {
    margin: 0;
    background: #ffffff;
  }
</style>
</head>
<body>
${bodyCode}
</body>
</html>`;
  }, [headCode, bodyCode, refreshKey]);

  const showMessage = (text) => {
    setMessage(text);
    window.clearTimeout(window.__previewMessageTimer);
    window.__previewMessageTimer = window.setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const handleSave = () => {
    localStorage.setItem(HEAD_KEY, headCode);
    localStorage.setItem(BODY_KEY, bodyCode);
    showMessage("Saved successfully");
  };

  const handleReset = () => {
    localStorage.removeItem(HEAD_KEY);
    localStorage.removeItem(BODY_KEY);
    setHeadCode(defaultHead);
    setBodyCode(defaultBody);
    setRefreshKey((v) => v + 1);
    showMessage("Reset to default");
  };

  const handleReloadPreview = () => {
    setRefreshKey((v) => v + 1);
    showMessage("Preview reloaded");
  };

  return (
    <div className="app-shell">
      <aside className="editor-panel">
        <h1>Cookie Banner Preview Tool</h1>
        <p className="subtitle">
          Edit head and body code, then preview the banner in the iframe.
        </p>

        <div className="button-row">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleReloadPreview} className="secondary">
            Reload Preview
          </button>
          <button onClick={handleReset} className="danger">
            Reset
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        <label className="editor-label">Head Editor</label>
        <textarea
          value={headCode}
          onChange={(e) => setHeadCode(e.target.value)}
          className="code-editor"
          spellCheck="false"
        />

        <label className="editor-label">Body Editor</label>
        <textarea
          value={bodyCode}
          onChange={(e) => setBodyCode(e.target.value)}
          className="code-editor"
          spellCheck="false"
        />
      </aside>

      <main className="preview-panel">
        <div className="preview-header">
          <h2>Live Preview</h2>
          <p>
            Paste your Cookie Banner script in the head editor and reload preview if needed.
          </p>
        </div>

        <iframe
          key={refreshKey}
          title="Cookie Banner Preview"
          srcDoc={previewDocument}
          className="preview-frame"
        />
      </main>
    </div>
  );
}