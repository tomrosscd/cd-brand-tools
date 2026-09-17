'use client'

import { ToastRegion, type ToastMessage } from '@convert/product-ui'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type Notify = (title: string, description?: string) => void

const ToastContext = createContext<Notify>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const notify = useCallback<Notify>((title, description) => {
    const id = `${Date.now()}-${Math.random()}`
    setMessages((current) => [...current.slice(-2), { id, title, description }])
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
