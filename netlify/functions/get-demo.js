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
    const slug = normalizeSlug(event.queryStringParameters?.slug || "");

    if (!slug) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Slug is required" })
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

    return {
      statusCode: 200,
      body: JSON.stringify({ demo: data || null })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Load failed" })
    };
  }
}
