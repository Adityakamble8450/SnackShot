import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
// import API_BASE_URL from '../config/api.js'

const Saved = () => {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`https://snackshot-2-91cx.onrender.com/api/food/saved`, { withCredentials: true })
        const items = (res.data?.data || []).map((f) => ({
          id: f._id,
          videoUrl: f.video,
          description: f.description,
          count: typeof f.count === 'number' ? f.count : 0
        }))
        setReels(items)
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading saved...</div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Saved Reels</h1>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-zinc-800 rounded-lg">Back</button>
        </div>
        {reels.length === 0 ? (
          <div className="text-center text-zinc-400">No saved reels yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reels.map((r) => (
              <div key={r.id} className="relative rounded-xl overflow-hidden bg-zinc-900">
                <video className="w-full h-64 object-cover" controls>
                  <source src={r.videoUrl} type="video/mp4" />
                </video>
                <div className="p-3 text-sm text-zinc-300 line-clamp-2">{r.description}</div>
                <div className="px-3 pb-3 text-xs text-zinc-400">❤ {r.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

export default Saved


