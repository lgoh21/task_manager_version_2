// Auth login page — placeholder for MVP

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm w-full space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tempus</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to get started
          </p>
        </div>
        {/* Auth form will be implemented with Supabase Auth */}
        <p className="text-sm text-muted-foreground">
          Authentication coming soon. Connect your Supabase project to enable sign-in.
        </p>
      </div>
    </div>
  );
}
