import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Create test user
  const { data, error } = await supabase.auth.admin.createUser({
    email: "test@test.com",
    password: "test",
    email_confirm: true,
  });

  if (error && error.message.includes("already been registered")) {
    return new Response(JSON.stringify({ message: "Test user already exists" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ message: "Test user created", id: data.user.id }), {
    headers: { "Content-Type": "application/json" },
  });
});
