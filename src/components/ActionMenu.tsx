/**
 * Reusable Action Menu for Archive/Delete operations
 */

'use client'

import { useState } from 'react'
import { Archive, Trash2, MoreVertical, Share2 } from 'lucide-react'

interface ActionMenuProps {
  itemId: string
  onArchive?: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  loading?: boolean
  deleteConfirmTitle?: string
  deleteConfirmMessage?: string
  isArchived?: boolean
  deleteButtonLabel?: string
  hideArchive?: boolean
  shareTitle?: string
  shareDescription?: string
  shareUrl?: string
}

export default function ActionMenu({
  itemId,
  onArchive,
  onDelete,
  loading = false,
  deleteConfirmTitle = 'Delete Item?',
  deleteConfirmMessage = 'This action cannot be undone. The item will be permanently removed.',
  isArchived = false,
  deleteButtonLabel = 'Delete',
  hideArchive = false,
  shareTitle,
  shareDescription,
  shareUrl = 'https://wyzelens.com'
}: ActionMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleShareLinkedIn = () => {
    const text = `${shareTitle}\n\n${shareDescription || ''}\n\nvia WyzeLens`
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
    setShowShareMenu(false)
    setShowMenu(false)
  }

  const handleShareTwitter = () => {
    const text = `${shareTitle}\n\n${shareDescription || ''}\n\nvia @WyzeLens`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
    setShowShareMenu(false)
    setShowMenu(false)
  }

  const handleArchive = async () => {
    if (!onArchive) return
    setActionLoading(true)
    try {
      await onArchive(itemId)
      setShowMenu(false)
    } catch (error) {
      alert('Failed to archive item')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await onDelete(itemId)
      setConfirmDelete(false)
    } catch (error) {
      alert('Failed to delete item')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-2 hover:bg-slate-700 rounded-lg transition"
          disabled={loading || actionLoading}
        >
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
              {shareTitle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowShareMenu(!showShareMenu)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2 rounded-t-lg"
                  disabled={actionLoading}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}
              {!hideArchive && onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleArchive()
                  }}
                  className={`w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2 ${shareTitle ? '' : 'rounded-t-lg'}`}
                  disabled={actionLoading}
                >
                  <Archive className="w-4 h-4" />
                  {isArchived ? 'Unarchive' : 'Archive'}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDelete(true)
                  setShowMenu(false)
                }}
                className={`w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2 rounded-b-lg`}
                disabled={actionLoading}
              >
                <Trash2 className="w-4 h-4" />
                {deleteButtonLabel}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Share Sub-menu */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Share on Social Media</h3>
            <p className="text-slate-400 mb-6 line-clamp-2">{shareTitle}</p>
            <div className="flex items-center justify-center gap-6 mb-4">
              <button
                onClick={handleShareLinkedIn}
                className="w-16 h-16 bg-[#0077B5] hover:bg-[#006396] rounded-xl transition flex items-center justify-center group"
                title="Share on LinkedIn"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button
                onClick={handleShareTwitter}
                className="w-16 h-16 bg-black hover:bg-slate-800 rounded-xl transition flex items-center justify-center border border-slate-700 group"
                title="Share on X"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowShareMenu(false)}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">{deleteConfirmTitle}</h3>
            <p className="text-slate-400 mb-6">{deleteConfirmMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
