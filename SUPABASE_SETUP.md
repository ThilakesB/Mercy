# Mercy Supabase setup

## 1. Create the project

Create a Supabase project, then copy its project URL and anon key into a local `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never put a service-role key in the browser or commit it to the repository.

## 2. Create the database

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor or apply it with the Supabase CLI:

```powershell
supabase db push
```

The migration creates the court registry, users, cases, people, lawyers, investigators, evidence, chain of custody, documents, hearings, judgments, punishments, notifications, legal authorities, AI research sessions, audit logs, RLS policies, and the private `case-documents` Storage bucket.

## 3. Create the first user

Create a user in **Authentication → Users**. Then add the matching profile:

```sql
insert into public.profiles (id, full_name, official_email, role, court_id)
select
  'AUTH_USER_UUID',
  'Hon. R. Venkataraman',
  'judge@example.gov',
  'judge',
  id
from public.courts
where code = 'CHE';
```

Use the user email and password on the login screen. When Supabase environment variables are absent, the UI intentionally stays in demo mode and accepts the existing preview OTP flow.

## 4. Production requirements

- Enable MFA in Supabase Auth.
- Restrict allowed redirect URLs to the deployed court application.
- Configure SMTP or an approved government identity provider.
- Enable database backups and point-in-time recovery.
- Keep Storage private and serve files using short-lived signed URLs.
- Review every RLS policy with the court security administrator before production use.
- Add an Edge Function for document malware scanning, PDF generation, scheduled reminders, and AI retrieval.
