import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BottomNav from '../components/BottomNav'
import API_BASE_URL from '../config/api.js'

const UserProfile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true })
        const me = res.data?.user
        const r = res.data?.role
        setUser(me)
        setRole(r)
        if (r === 'food_partner' && me?._id) {
          navigate(`/food-partner/${me._id}`)
          return
        }
        // Fetch saved count for simple activity summary
        try {
          const savedRes = await axios.get(`${API_BASE_URL}/api/food/saved`, { withCredentials: true })
          setSavedCount((savedRes.data?.data || []).length)
        } catch (e) {
          setSavedCount(0)
        }
      } catch (e) {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/auth/user/logout`, { withCredentials: true })
      navigate('/')
    } catch (e) {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading profile...</div>
    )
  }

  if (!user || role !== 'normal_user') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white pb-24">
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-orange-500">
              <img src={user.profileImage || 'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(user.username || user.email)} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.username || 'User'}</h1>
              <p className="text-zinc-400 text-sm">{user.email}</p>
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">Normal User</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-zinc-800/60 p-4 text-center">
              <div className="text-2xl font-extrabold text-orange-500">{savedCount}</div>
              <div className="text-xs text-zinc-400">Saved Reels</div>
            </div>
            <div className="rounded-xl bg-zinc-800/60 p-4 text-center">
              <div className="text-2xl font-extrabold text-zinc-200">—</div>
              <div className="text-xs text-zinc-400">Likes</div>
            </div>
            <div className="rounded-xl bg-zinc-800/60 p-4 text-center">
              <div className="text-2xl font-extrabold text-zinc-200">—</div>
              <div className="text-xs text-zinc-400">Comments</div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-2">Activity</h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-400 text-sm">
              Your recent activity will appear here.
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => navigate('/saved')} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 font-semibold">View Saved</button>
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-semibold">Back Home</button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default UserProfile


