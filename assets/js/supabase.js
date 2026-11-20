// Supabase publishable (public) config for the static build.
// Same project the TanStack source uses (src/integrations/supabase/client.ts
// ships this publishable key in its client bundle). Only the publishable key
// is ever used here; the service-role key is never shipped to the browser.
// Tables: newsletter_subscribers, contact_messages. RLS decides what the
// anonymous key may do; anything it cannot do falls back honestly (see the
// form scripts), never silently.
window.TOOLWOOLS_SUPABASE = {
  url: "https://lvlswkgpxpovrzdoyigt.supabase.co",
  key: "sb_publishable_2eLBJh68TOK7-k8uZCjBLQ_d17iK0q2"
};
