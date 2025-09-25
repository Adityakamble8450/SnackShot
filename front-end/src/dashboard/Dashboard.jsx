import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config/api.js'

const MAX_SIZE_BYTES = 100 * 1024 * 1024 // 100MB
const ACCEPTED_MIME = ['video/mp4', 'video/quicktime'] // mp4, mov

const Dashboard = () => {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [description, setDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)

  const fileInputRef = useRef(null)

  const isDescriptionValid = useMemo(() => description.trim().length <= 200, [description])
  const remainingChars = 200 - description.trim().length

  useEffect(() => {
    // Get current user info
    const getCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true })
        if (res.data.role === 'food_partner') {
          setCurrentUser(res.data.user)
        } else {
          navigate('/')
        }
      } catch (e) {
        navigate('/')
      }
    }
    getCurrentUser()

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, navigate])

  const resetState = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setDescription('')
    setError('')
    setIsUploading(false)
    setProgress(0)
  }

  const validateFile = (file) => {
    if (!file) return 'No file selected.'
    if (!ACCEPTED_MIME.includes(file.type)) return 'Unsupported format. Use MP4 or MOV.'
    if (file.size > MAX_SIZE_BYTES) return 'File too large. Max size is 100MB.'
    return ''
  }

  const handleFiles = (files) => {
    const file = files && files[0]
    const validationMsg = validateFile(file)
    if (validationMsg) {
      setError(validationMsg)
      return
    }
    setError('')
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const onFileChange = (e) => {
    handleFiles(e.target.files)
  }

  const startUpload = async () => {
    if (!selectedFile || !isDescriptionValid || description.trim().length === 0) return
    setIsUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('videoFile', selectedFile)
      formData.append('description', description)

      const response = await axios.post(`${API_BASE_URL}/api/food/upload-video`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percentCompleted)
        }
      })

      setProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        // Redirect to home page where food partner can see reels
        navigate('/')
      }, 1000)

    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed')
      setIsUploading(false)
      setProgress(0)
    }
  }

  const canUpload = useMemo(() => {
    return !!selectedFile && description.trim().length > 0 && isDescriptionValid && !isUploading
  }, [selectedFile, description, isDescriptionValid, isUploading])

  return (
    <div className="min-h-[calc(100vh-0px)] bg-black py-8 px-4 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Upload Video</h1>
          <p className="text-slate-400 mt-1">Share your moments with a clean and simple flow.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Upload + Description */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`rounded-2xl border ${isDragging ? 'border-red-400 bg-zinc-900' : 'border-zinc-800 bg-zinc-900'} shadow-sm transition-all duration-200 p-6`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDragging ? 'bg-red-500/10' : 'bg-zinc-800'}`}>
                  {/* Upload icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
                    <path fillRule="evenodd" d="M12 2a.75.75 0 01.75.75V14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0112 2zm-3.53 4.72a.75.75 0 011.06 0L12 9.19l2.47-2.47a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 010-1.06z" clipRule="evenodd" />
                    <path d="M3.75 13.5a8.25 8.25 0 1116.5 0v1.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V13.5z" />
                  </svg>
                </div>

                {!selectedFile && (
                  <>
                    <p className="text-slate-100 font-medium">Drag and drop your video here</p>
                    <p className="text-slate-400 text-sm mt-1">Upload your video (mp4, mov, max 100MB)</p>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,.mp4,.mov"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </div>
                  </>
                )}

                {selectedFile && (
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-slate-100 font-medium truncate">{selectedFile.name}</p>
                        <p className="text-slate-400 text-xs">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-sm font-medium"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          Re-upload
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium"
                          onClick={resetState}
                          disabled={isUploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {!!previewUrl && (
                      <div className="mt-4">
                        <video
                          src={previewUrl}
                          controls
                          className="w-full aspect-video rounded-xl border border-zinc-800 shadow-sm bg-black object-contain"
                        />
                      </div>
                    )}

                    {isUploading && (
                      <div className="mt-4">
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all duration-200"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                          <span>Uploading...</span>
                          <span>{progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <p className="mt-4 text-sm text-red-400">{error}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm p-6">
              <label className="block text-slate-100 font-medium mb-2">Video Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="Write a short description about your video"
                className="w-full min-h-[120px] rounded-xl border border-zinc-800 bg-zinc-950 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none p-4 text-slate-100 placeholder-slate-500 transition"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={`${isDescriptionValid ? 'text-slate-400' : 'text-red-400'}`}>Keep it under 200 characters</span>
                <span className={`${remainingChars < 0 ? 'text-red-400' : 'text-slate-400'}`}>{Math.max(0, remainingChars)} left</span>
              </div>
            </div>
          </div>

          {/* Right column: Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-100">Actions</h2>
              <button
                type="button"
                className={`w-full py-3 rounded-xl font-semibold text-white shadow-sm transition ${canUpload ? 'bg-red-600 hover:bg-red-700' : 'bg-red-900/40 cursor-not-allowed'}`}
                onClick={startUpload}
                disabled={!canUpload}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-xl font-semibold text-slate-200 bg-zinc-800 hover:bg-zinc-700 transition"
                onClick={resetState}
                disabled={isUploading}
              >
                Cancel
              </button>
              <div className="pt-2 border-t border-zinc-800 text-xs text-slate-400">
                Supported: MP4, MOV • Max 100MB
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
