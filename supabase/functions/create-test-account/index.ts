import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Try to create test account
  const { data, error } = await supabase.auth.admin.createUser({
    email: "test@test.com",
    password: "test123",
    email_confirm: true,
  });

  if (error && error.message.includes("already been registered")) {
    // Update password instead
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users?.users?.find((u) => u.email === "test@test.com");
    if (testUser) {
      await supabase.auth.admin.updateUser(testUser.id, { password: "test123" });
      return new Response(JSON.stringify({ message: "Password updated" }));
    }
  }

  return new Response(JSON.stringify({ data, error }));
});
