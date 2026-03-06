import { createClient } from "@supabase/supabase-js";

const getClient = () => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

const normalizeSlug = (value = "") =>
  value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const slug = normalizeSlug(body.slug);

    if (!slug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Slug is required" })
      };
    }

    const supabase = getClient();

    const payload = {
      slug,
      site_url: body.siteUrl || "",
      page_title: body.pageTitle || "Demo Website",
      cookie_script: body.cookieScript || "",
      body_html: body.bodyHtml || ""
    };

    const { error } = await supabase
      .from("cookieyes_demos")
      .upsert(payload, { onConflict: "slug" });

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, slug })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Save failed" })
    };
  }
}
