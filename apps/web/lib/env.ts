export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(
    /\/$/,
    "",
  );
}

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}
