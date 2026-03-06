import { createClient } from "@supabase/supabase-js";

const getClient = () => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

const normalizeSlug = (value = "") =>
  value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

const escapeHtml = (str = "") =>
  str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export async function handler(event) {
  try {
    const slug = normalizeSlug(event.queryStringParameters?.slug || "");

    if (!slug) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: "<h1>Missing slug</h1>"
      };
    }

    const supabase = getClient();

    const { data, error } = await supabase
      .from("cookieyes_demos")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: `<h1>Demo not found</h1><p>No saved demo for slug: ${escapeHtml(slug)}</p>`
      };
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(data.page_title || "Demo Website")}</title>
${data.cookie_script || ""}
</head>
<body>
${data.body_html || ""}
</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: html
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: `<h1>Server error</h1><pre>${escapeHtml(error.message || "Unknown error")}</pre>`
    };
  }
}
