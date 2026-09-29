<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/24833649-d0f2-4773-9f68-8f651abb97ef

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` from your Supabase project API settings. Run the SQL shown in the app's Supabase SQL section to create the `cafe_menu` table and its public read/insert policies.
4. Run the app:
   `npm run dev`

Without Supabase settings, orders are stored in this browser's local storage.
