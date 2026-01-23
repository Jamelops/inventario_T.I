import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const getClientIp = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return req.headers.get("cf-connecting-ip");
};

const isStrongPassword = (password: string) => {
  if (password.length < 10) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, {
      error:
        "Missing server configuration. Ensure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set.",
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse(401, { error: "Missing Authorization header" });
  }

  let payload: { targetUserId?: string; newPassword?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const targetUserId = payload?.targetUserId;
  const newPassword = payload?.newPassword;

  if (!targetUserId || typeof targetUserId !== "string") {
    return jsonResponse(400, { error: "targetUserId is required" });
  }

  if (!newPassword || typeof newPassword !== "string") {
    return jsonResponse(400, { error: "newPassword is required" });
  }

  if (!isStrongPassword(newPassword)) {
    return jsonResponse(400, {
      error:
        "Password must have at least 10 characters, including uppercase, lowercase, and a number.",
    });
  }

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabaseUser.auth.getUser();
  const caller = userData?.user;

  if (userError || !caller) {
    return jsonResponse(401, { error: "Invalid or expired session" });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  let callerRole: string | null = null;
  const { data: roleData, error: roleError } = await supabaseAdmin.rpc("get_user_role", {
    _user_id: caller.id,
  });

  if (roleError) {
    const { data: roleRow, error: roleRowError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (roleRowError) {
      console.error("[admin-change-password] Role lookup failed:", roleRowError);
      return jsonResponse(500, { error: "Failed to validate admin role" });
    }

    callerRole = roleRow?.role ?? null;
  } else {
    callerRole = roleData ?? null;
  }

  if (callerRole !== "admin") {
    await supabaseAdmin
      .from("audit_logs")
      .insert([
        {
          action: "UNAUTHORIZED_ACCESS_ATTEMPT",
          resource_type: "user",
          resource_id: targetUserId,
          user_id: caller.id,
          success: false,
          error_message: "Caller is not admin",
          metadata: {
            actor_id: caller.id,
            target_id: targetUserId,
            user_agent: req.headers.get("user-agent"),
            timestamp: new Date().toISOString(),
          },
          ip_address: getClientIp(req),
        },
      ])
      .catch(() => {});

    return jsonResponse(403, { error: "Only admins can change passwords" });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (updateError) {
    await supabaseAdmin
      .from("audit_logs")
      .insert([
        {
          action: "ROLE_CHANGE",
          resource_type: "user",
          resource_id: targetUserId,
          user_id: caller.id,
          success: false,
          error_message: updateError.message,
          metadata: {
            actor_id: caller.id,
            target_id: targetUserId,
            action: "password_change",
            user_agent: req.headers.get("user-agent"),
            timestamp: new Date().toISOString(),
          },
          ip_address: getClientIp(req),
        },
      ])
      .catch(() => {});

    return jsonResponse(400, { error: updateError.message });
  }

  await supabaseAdmin
    .from("audit_logs")
    .insert([
      {
        action: "ROLE_CHANGE",
        resource_type: "user",
        resource_id: targetUserId,
        user_id: caller.id,
        changes: { password: "updated" },
        success: true,
        metadata: {
          actor_id: caller.id,
          target_id: targetUserId,
          action: "password_change",
          user_agent: req.headers.get("user-agent"),
          timestamp: new Date().toISOString(),
        },
        ip_address: getClientIp(req),
      },
    ])
    .catch(() => {});

  return jsonResponse(200, {
    success: true,
    message: "Password updated successfully",
    targetUserId,
  });
});
