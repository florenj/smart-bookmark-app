# Smart Bookmark Manager

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Features

- Google OAuth login
- Add bookmarks (name + URL + category)
- Private bookmarks per user
- Real-time updates
- Delete bookmarks
- Dark UI
- Deployed on Vercel

## Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- Vercel

## Database Structure

Table: bookmarks

Columns:
- id (uuid)
- created_at (timestamp)
- name (text)
- url (text)
- category (text)
- user_id (uuid)

## RLS Policies

SELECT:
auth.uid() = user_id

INSERT:
WITH CHECK (auth.uid() = user_id)

DELETE:
auth.uid() = user_id

## Challenges Faced

1. 400 error due to NOT NULL constraint on extra column.
   - Fixed by removing unnecessary column.

2. RLS blocking data.
   - Fixed by adding proper policies using auth.uid().

## How to Run

Add environment variables:

NEXT_PUBLIC_SUPABASE_URL  
NEXT_PUBLIC_SUPABASE_ANON_KEY  

Then run:

npm install  
npm run dev
