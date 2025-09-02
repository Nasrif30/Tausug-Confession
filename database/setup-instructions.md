# Supabase Database Setup Instructions

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Open your project: `ibdsxlhxqgwkelqcvlegb.supabase.co`
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the contents of `schema.sql` into the SQL editor
5. Click **Run** to execute the SQL

## Option 2: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref ibdsxlhxqgwkelqcvlegb
   ```

4. Run the schema:
   ```bash
   supabase db push
   ```

## Quick Test

After setting up the database, test your API:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/db-status
curl "http://localhost:5000/api/confessions?page=1&limit=12&sortBy=created_at"
```

## Troubleshooting

If you still get errors:
1. Check that your backend server is running
2. Verify the database tables were created in Supabase Dashboard
3. Check the browser console for CORS errors
4. Ensure your frontend is running on port 3000
