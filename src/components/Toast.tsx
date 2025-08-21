'use client'

import React from 'react'

interface ToastProps {
  show: boolean
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ 
  show, 
  message, 
  type = 'success', 
  onClose 
}) => {
  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out animate-bounce">
      <div className={`text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
        type === 'success' 
          ? 'bg-purple-500' 
          : 'bg-purple-600'
      }`}>
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className={`flex-shrink-0 ml-4 transition-colors ${
            type === 'success'
              ? 'text-purple-200 hover:text-white'
              : 'text-purple-200 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toast