import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // List users to find existing test account
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users?.find((u: any) => u.email === "test@test.com");
  
  if (testUser) {
    // Delete and recreate with new password
    await supabase.auth.admin.deleteUser(testUser.id);
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: "test@test.com",
    password: "test123",
    email_confirm: true,
  });

  return new Response(JSON.stringify({ data, error }));
});
