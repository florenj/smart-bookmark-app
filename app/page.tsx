"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("Study")
  const [filter, setFilter] = useState("All")

  // ================= AUTH =================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) fetchBookmarks(data.session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchBookmarks(session.user.id)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // ================= FETCH =================
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error) setBookmarks(data || [])
  }

  // ================= ADD =================
  const addBookmark = async () => {
    if (!name || !url) return

    const { error } = await supabase.from("bookmarks").insert([
      {
        name,
        url,
        category,
        user_id: user.id,
      },
    ])

    if (!error) {
      setName("")
      setUrl("")
    }
  }

  // ================= DELETE =================
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
  }

  // ================= REALTIME =================
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => fetchBookmarks(user.id)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const login = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  })
}

  const logout = async () => {
    await supabase.auth.signOut()
    setBookmarks([])
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <button
          onClick={login}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
        >
          Login with Google
        </button>
      </div>
    )
  }

  const filteredBookmarks =
    filter === "All"
      ? bookmarks
      : bookmarks.filter((b) => b.category === filter)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Smart Bookmark Manager</h1>
          <button
            onClick={logout}
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark Card */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Bookmark</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              className="bg-gray-800 p-3 rounded-lg outline-none"
              placeholder="Bookmark Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="bg-gray-800 p-3 rounded-lg outline-none"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <select
              className="bg-gray-800 p-3 rounded-lg"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Study</option>
              <option>Work</option>
              <option>Entertainment</option>
              <option>Personal</option>
            </select>

            <button
              onClick={addBookmark}
              className="bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            className="bg-gray-800 p-3 rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Study</option>
            <option>Work</option>
            <option>Entertainment</option>
            <option>Personal</option>
          </select>
        </div>

        {/* Bookmark List */}
        <div className="space-y-4">
          {filteredBookmarks.length === 0 ? (
            <p className="text-gray-400">No bookmarks yet</p>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-gray-900 p-4 rounded-xl flex justify-between items-center"
              >
                <div>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    {bookmark.name}
                  </a>
                  <p className="text-sm text-gray-400">
                    {bookmark.category}
                  </p>
                </div>

                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
