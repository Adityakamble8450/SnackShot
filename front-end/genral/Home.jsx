import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BottomNav from '../src/components/BottomNav'

const API_BASE_URL = 'https://snacksh-2.onrender.com'

const Home = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState(null) // 'normal_user' | 'food_partner' | null
  const [authChecked, setAuthChecked] = useState(false)
  const [videos, setVideos] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [likeStatus, setLikeStatus] = useState({}) // { [videoId]: true/false }
  const [saveStatus, setSaveStatus] = useState({}) // { [videoId]: true/false }
  const [likeAnimating, setLikeAnimating] = useState({}) // { [videoId]: true/false }
  const [saveAnimating, setSaveAnimating] = useState({}) // { [videoId]: true/false }

  const handleLogout = async () => {
    try {
      const logoutEndpoint = role === 'food_partner' ? '/api/auth/foodpartner/logout' : '/api/auth/user/logout'
      await axios.get(`${API_BASE_URL}${logoutEndpoint}`, { withCredentials: true })
      setRole(null)
      setCurrentUser(null)
      setVideos([])
      navigate('/')
    } catch (error) {
      // Force logout on client side even if server request fails
      setRole(null)
      setCurrentUser(null)
      setVideos([])
      navigate('/')
    }
  }

  // Fetch user info
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true })
        setRole(res.data.role)
        setCurrentUser(res.data.user)
      } catch (e) {
        setRole(null)
        setCurrentUser(null)
      } finally {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [])

  // Fetch feed and like/save status
  useEffect(() => {
    const loadFeed = async () => {
      if (!role) return
      setLoadingFeed(true)
      try {
        const response = await axios.get(`${API_BASE_URL}/api/food`, { withCredentials: true })
        const transformed = (response.data?.data || []).map((foodItem) => ({
          id: foodItem._id,
          videoUrl: foodItem.video,
          storeName: foodItem.foodPartner?.name || 'Unknown Store',
          description: foodItem.description || 'No description available',
          foodPartnerId: foodItem.foodPartner?._id || null,
          count: typeof foodItem.count === 'number' ? foodItem.count : 0
        }))
        setVideos(transformed)

        // Fetch like/save status for all videos
        if (transformed.length > 0) {
          const ids = transformed.map(v => v.id)
          // Like status
          const likeRes = await axios.post(
            `${API_BASE_URL}/api/food/like-status`,
            { foodIds: ids },
            { withCredentials: true }
          )
          setLikeStatus(likeRes.data.status || {})
          // Save status
          const saveRes = await axios.post(
            `${API_BASE_URL}/api/food/save-status`,
            { foodIds: ids },
            { withCredentials: true }
          )
          setSaveStatus(saveRes.data.status || {})
        }
      } catch (error) {
      } finally {
        setLoadingFeed(false)
      }
    }
    loadFeed()
  }, [role])

  // Like handler
  const handleLike = async (videoId) => {
    if (!currentUser) return
    setLikeAnimating((prev) => ({ ...prev, [videoId]: true }))
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/food/like`,
        { foodId: videoId },
        { withCredentials: true }
      )
      const serverLiked = res.data?.liked
      const newCount = typeof res.data?.count === 'number' ? res.data.count : undefined
      setLikeStatus((prev) => ({
        ...prev,
        [videoId]: typeof serverLiked === 'boolean' ? serverLiked : !prev[videoId]
      }))
      if (typeof newCount === 'number') {
        setVideos((prev) => prev.map(v => v.id === videoId ? { ...v, count: newCount } : v))
      } else {
        // Fallback optimistic count update
        setVideos((prev) => prev.map(v => v.id === videoId ? { ...v, count: (likeStatus[videoId] ? Math.max(0, (v.count||0) - 1) : (v.count||0) + 1) } : v))
      }
    } catch (err) {
      // Optionally show error
    } finally {
      setTimeout(() => {
        setLikeAnimating((prev) => ({ ...prev, [videoId]: false }))
      }, 500)
    }
  }

  // Save handler
  const handleSave = async (videoId) => {
    if (!currentUser) return
    setSaveAnimating((prev) => ({ ...prev, [videoId]: true }))
    try {
      await axios.post(
        `${API_BASE_URL}/api/food/save`,
        { foodId: videoId },
        { withCredentials: true }
      )
      setSaveStatus((prev) => ({
        ...prev,
        [videoId]: !prev[videoId]
      }))
    } catch (err) {
      // Optionally show error
    } finally {
      setTimeout(() => {
        setSaveAnimating((prev) => ({ ...prev, [videoId]: false }))
      }, 500)
    }
  }

  if (!authChecked) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Logged out: show role selection cards
  if (!role) {
    return (
      <div className="min-h-screen w-full bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="text-center mb-12">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center ring-1 ring-zinc-800">
              <img src="/logo.png" alt="SnackShot" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Welcome to SnackShot</h1>
            <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
              Choose how you want to explore and grow on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Normal User Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.236.8 5.879 2.137M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold">Normal User</h2>
            </div>
            <ul className="space-y-2 text-slate-300 mb-6 list-disc list-inside">
              <li>View food partner profiles</li>
              <li>Watch reels/videos</li>
              <li>Check restaurant addresses</li>
              <li className="text-slate-400">Cannot upload anything</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/user/login')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/user/register')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Register
              </button>
            </div>
          </div>

          {/* Food Partner Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 3h16a1 1 0 011 1v3H3V4a1 1 0 011-1z" />
                  <path d="M3 8h18v9a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold">Food Partner</h2>
            </div>
            <ul className="space-y-2 text-slate-300 mb-6 list-disc list-inside">
              <li>Upload videos (business promos, food reels)</li>
              <li>Add restaurant details</li>
              <li>Track total meals served</li>
              <li>Promote business via profile page</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/foodpartner/login')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/foodpartner/register')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Register
              </button>
            </div>
          </div>
          </div>

          <div className="text-center mt-10 text-slate-400 text-sm">
            You can always switch roles by logging out and selecting a different option.
          </div>
        </div>
      </div>
    )
  }

  // Like and Save Button SVGs
  const HeartIcon = ({ filled, animating }) => (
    <svg
      className={`w-10 h-10 transition-all duration-300 ${filled ? 'text-red-500' : 'text-white/70'} ${animating ? 'scale-125' : 'scale-100'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      style={{ filter: filled ? 'drop-shadow(0 0 8px #ef4444)' : undefined }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a5.5 5.5 0 017.778 0l.904.904.904-.904a5.5 5.5 0 117.778 7.778l-8.682 8.682a1 1 0 01-1.414 0l-8.682-8.682a5.5 5.5 0 010-7.778z"
      />
    </svg>
  )

  const SaveIcon = ({ filled, animating }) => (
    <svg
      className={`w-9 h-9 transition-all duration-300 ${filled ? 'text-yellow-400' : 'text-white/70'} ${animating ? 'scale-125' : 'scale-100'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      style={{ filter: filled ? 'drop-shadow(0 0 8px #facc15)' : undefined }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z"
      />
    </svg>
  )

  // Logged in: show reel feed; add Upload CTA for food partners
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar video-container">
        {loadingFeed && (
          <div className="h-screen w-screen flex items-center justify-center bg-black">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border-4 border-white/20 border-t-red-500 animate-spin"></div>
              <div className="mt-4 text-white text-sm tracking-wide">Loading reels...</div>
            </div>
          </div>
        )}
        {!loadingFeed && videos.map((video, index) => (
          <div key={video.id} className="relative h-screen w-screen snap-start flex-shrink-0">
            <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline preload='metadata'>
              <source src={video.videoUrl} type="video/mp4" />
            </video>
            {/* Like/Save Buttons - right side */}
            <div className="absolute right-6 bottom-1/3 flex flex-col items-center gap-6 z-20">
              <button
                onClick={() => handleLike(video.id)}
                className="focus:outline-none group"
                aria-label={likeStatus[video.id] ? "Unlike" : "Like"}
              >
                <div className="rounded-full bg-black/40 p-2 flex items-center justify-center shadow-lg group-hover:bg-black/60 transition-all duration-200">
                  <HeartIcon filled={!!likeStatus[video.id]} animating={!!likeAnimating[video.id]} />
                </div>
                <span className="block text-xs text-white mt-1 font-semibold select-none">
                  {(videos.find(v => v.id === video.id)?.count) ?? 0}
                </span>
              </button>
              <button
                onClick={() => handleSave(video.id)}
                className="focus:outline-none group"
                aria-label={saveStatus[video.id] ? "Unsave" : "Save"}
              >
                <div className="rounded-full bg-black/40 p-2 flex items-center justify-center shadow-lg group-hover:bg-black/60 transition-all duration-200">
                  <SaveIcon filled={!!saveStatus[video.id]} animating={!!saveAnimating[video.id]} />
                </div>
                <span className="block text-xs text-white mt-1 font-semibold select-none">
                  {saveStatus[video.id] ? "Saved" : "Save"}
                </span>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="mb-4">
                <h3
                  className="text-white text-lg font-semibold mb-2 cursor-pointer underline hover:text-red-400 transition-colors"
                  onClick={() => video.foodPartnerId && navigate(`/food-partner/${video.foodPartnerId}`)}
                  title="Visit Food Partner Profile"
                >
                  {video.storeName}
                </h3>
                <p className="text-white text-sm leading-relaxed line-clamp-2">{video.description}</p>
              </div>
              <button
                onClick={() => video.foodPartnerId && navigate(`/food-partner/${video.foodPartnerId}`)}
                className="self-start bg-red-600/90 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 inline-flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Visit Store
              </button>
            </div>
            {index === 0 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-2">Scroll for more</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {role === 'food_partner' && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => navigate(`/food-partner/${currentUser._id}`)}
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold shadow-lg"
          >
            My Profile
          </button>
        </div>
      )}
      <BottomNav />
    </div>
  )
}

export default Home
