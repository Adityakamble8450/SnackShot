import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import BottomNav from '../components/BottomNav'

const API_BASE_URL = "https://snacksh-2.onrender.com";

const Profile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [foodPartner, setFoodPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const videoRefs = useRef({})

  const handleLogout = async () => {
    try {
      const logoutEndpoint = userRole === 'food_partner' ? '/api/auth/foodpartner/logout' : '/api/auth/user/logout'
      await axios.get(`${API_BASE_URL}${logoutEndpoint}`, { withCredentials: true })
      navigate('/')
    } catch (error) {
      navigate('/')
    }
  }

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true })
        setCurrentUser(res.data.user)
        setUserRole(res.data.role)
        setIsOwner(res.data.role === 'food_partner' && res.data.user._id === id)
      } catch (e) {
        setCurrentUser(null)
        setUserRole(null)
        setIsOwner(false)
      }
    }
    checkCurrentUser()

    const fetchFoodPartnerProfile = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/api/food-partner/profile/${id}`)
        const apiProfile = response.data.data || {}
        const normalizedProfile = {
          ...apiProfile,
          videos: (apiProfile.videos || []).map((v) => ({
            ...v,
            url: v.url || v.video || v.thumbnail,
            thumbnail: v.thumbnail || v.url || v.video
          }))
        }
        setFoodPartner(normalizedProfile)
        setError(null)
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load profile')
        setFoodPartner({
          name: "Spice Garden Restaurant",
          address: "123 Main Street, Downtown District, City 12345",
          totalMealsServed: 15420,
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          videos: [
            {
              id: 1,
              thumbnail: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=400&fit=crop",
              url: "https://cdn.coverr.co/videos/coverr-pouring-milk-on-iced-coffee-4080/1080p.mp4",
              views: "12.5K",
              likes: "1.2K",
              title: "Signature Biryani Recipe"
            },
            {
              id: 2,
              thumbnail: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=400&fit=crop",
              url: "https://cdn.coverr.co/videos/coverr-slicing-a-fresh-baguette-6581/1080p.mp4",
              views: "8.7K",
              likes: "890",
              title: "Fresh Curry Preparation"
            },
            {
              id: 3,
              thumbnail: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=400&fit=crop",
              url: "https://cdn.coverr.co/videos/coverr-strawberries-dropped-into-water-1917/1080p.mp4",
              views: "15.2K",
              likes: "2.1K",
              title: "Tandoor Cooking Process"
            },
            {
              id: 4,
              thumbnail: "https://images.unsplash.com/photo-1563379091339-03246963d4d0?w=300&h=400&fit=crop",
              url: "https://cdn.coverr.co/videos/coverr-cooking-on-a-grill-1132/1080p.mp4",
              views: "6.3K",
              likes: "567",
              title: "Kitchen Behind the Scenes"
            },
            {
              id: 5,
              thumbnail: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=400&fit=crop",
              url: "https://cdn.coverr.co/videos/coverr-pizza-in-a-wood-fired-oven-3573/1080p.mp4",
              views: "9.8K",
              likes: "1.1K",
              title: "Fresh Ingredients Showcase"
            },
            {
              id: 6,
              thumbnail: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=400&fit=crop",
              url: "https://cdn.coverr.co/videos/coverr-chocolate-cake-icing-4111/1080p.mp4",
              views: "11.4K",
              likes: "1.5K",
              title: "Dessert Special"
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchFoodPartnerProfile()
    } else {
      setError('No food partner ID provided')
      setLoading(false)
    }
  }, [id])

  // Ensure all videos are paused when navigating away
  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach((videoEl) => {
        if (videoEl) {
          videoEl.pause()
        }
      })
    }
  }, [])

  const handleVideoClick = (videoId) => {
    const clickedVideo = videoRefs.current[videoId]
    if (!clickedVideo) return

    // Pause any other playing video
    if (activeVideoId && activeVideoId !== videoId) {
      const previousVideo = videoRefs.current[activeVideoId]
      if (previousVideo) {
        previousVideo.pause()
        previousVideo.currentTime = 0
      }
    }

    if (clickedVideo.paused) {
      clickedVideo.play()
      setActiveVideoId(videoId)
    } else {
      clickedVideo.pause()
      setActiveVideoId(null)
    }
  }

  // Format views and likes for display
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading food partner profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !foodPartner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Profile Not Found</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 pb-24">
      {/* Logout Button */}
      {userRole && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      {/* Profile Header Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black shadow-lg rounded-b-3xl pb-8">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-xl ring-4 ring-orange-600">
                <img 
                  src={foodPartner.profileImage} 
                  alt="Food Partner" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                ✓
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 break-words">
                {foodPartner.name}
              </h1>
              <p className="text-gray-400 text-base sm:text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="truncate max-w-[80vw] sm:max-w-xs">{foodPartner.address}</span>
              </p>
              
              {/* Additional Info */}
              {foodPartner.cuisineType && (
                <p className="text-gray-500 text-xs sm:text-sm mb-4 flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                  {foodPartner.cuisineType}
                </p>
              )}
              
              {/* Total Meals Served Card */}
              <div className="bg-gradient-to-r from-orange-600 to-yellow-500 rounded-2xl p-5 sm:p-6 text-white shadow-xl max-w-xs sm:max-w-sm mx-auto md:mx-0 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm font-medium">Total Meals Served</p>
                    <p className="text-2xl sm:text-3xl font-bold">{foodPartner.totalMealsServed.toLocaleString()}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Short Video Section */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Videos</h2>
          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden sm:inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                Upload Video
              </button>
            )}
            <div className="flex items-center gap-2 text-orange-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">Reels ({foodPartner.videos.length})</span>
            </div>
          </div>
        </div>

        {/* Video Grid (Reels-style) */}
        {foodPartner.videos.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {foodPartner.videos.map((video) => (
              <div 
                key={video.id}
                className="group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Video Thumbnail (using <video> with poster) */}
                <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => handleVideoClick(video.id)}>
                  <video
                    ref={(el) => { videoRefs.current[video.id] = el }}
                    src={video.url}
                    poster={video.thumbnail}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    preload="metadata"
                    playsInline
                    webkit-playsinline="true"
                    muted
                  />
                  
                  {/* Play Button Overlay */}
                  <div className={`absolute inset-0 bg-black ${activeVideoId === video.id ? 'bg-opacity-0' : 'bg-opacity-30'} flex items-center justify-center ${activeVideoId === video.id ? 'opacity-0' : 'opacity-100 group-hover:opacity-100'} transition-opacity duration-300`}>
                    <div className="bg-white bg-opacity-90 rounded-full p-3 sm:p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {typeof video.views === 'number' ? formatNumber(video.views) : video.views}
                      </div>
                    </div>
                    <div className="bg-red-500 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {typeof video.likes === 'number' ? formatNumber(video.likes) : video.likes}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-white text-base sm:text-lg mb-2 group-hover:text-orange-400 transition-colors duration-300 truncate">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                    <span>{video.createdAt ? formatDate(video.createdAt) : 'Recently'}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 text-6xl mb-4">📹</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No Videos Yet</h3>
            <p className="text-gray-500">This food partner hasn't uploaded any videos yet.</p>
          </div>
        )}

        {/* Load More Button */}
        {foodPartner.videos.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base">
              Load More Videos
            </button>
          </div>
        )}
      </div>

      {/* Upload Button for Food Partners (only show if they own this profile) */}
      {isOwner && (
        <div className="fixed bottom-24 right-4 z-50">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Upload Video
          </button>
        </div>
      )}

      {/* Bottom Spacing */}
      <div className="h-8"></div>
      <BottomNav />
    </div>
  )
}

export default Profile