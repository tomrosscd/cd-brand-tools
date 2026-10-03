'use client'

import { ToastRegion, type ToastMessage } from '@convert/product-ui'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type Notify = (title: string, description?: string, status?: ToastMessage['status']) => void

const ToastContext = createContext<Notify>(() => {})

/** Keep this many notices on screen; the oldest leaves when a newer one arrives. */
const MAX_NOTICES = 3

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const nextId = useRef(0)
  const notify = useCallback<Notify>((title, description, status) => {
    const id = `notice-${nextId.current++}`
    setMessages((current) => [...current.slice(1 - MAX_NOTICES), { id, title, description, status }])
  }, [])
  const value = useMemo(() => notify, [notify])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastRegion
        messages={messages}
        onDismiss={(id) => setMessages((current) => current.filter((m) => m.id !== id))}
      />
    </ToastContext.Provider>
  )
}

export function useToast(): Notify {
  return useContext(ToastContext)
}
