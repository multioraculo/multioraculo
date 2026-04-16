// TEMPORARY — delete this file and the test-supabase/ folder when done
import { createClient } from "@/lib/supabase/server"

export default async function TestSupabasePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  const connected = !error || error.message !== "Failed to fetch"
  const status = connected ? "Supabase connection OK" : "Supabase connection FAILED"
  const detail = error ? error.message : "No active session (expected when no user is logged in)"

  return (
    <div style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1 style={{ color: connected ? "green" : "red" }}>{status}</h1>
      <p><strong>Detail:</strong> {detail}</p>
      <p><strong>User:</strong> {user ? user.email : "none"}</p>
      <hr />
      <small>Remove this page by deleting <code>app/test-supabase/</code></small>
    </div>
  )
}
