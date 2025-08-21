"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, Heart, Droplets, Eye, Activity } from "lucide-react"

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isHealthReminder?: boolean
}

interface HealthReminder {
  type: "water" | "eyes" | "posture" | "break" | "mental"
  message: string
  icon: string
  interval: number
}

const HEALTH_REMINDERS: HealthReminder[] = [
  {
    type: "water",
    message: "💧 Time for a water break! Stay hydrated while you code! Your brain needs water to function at its best.",
    icon: "💧",
    interval: 60 * 60 * 1000,
  }, // 1 hour
  {
    type: "eyes",
    message: "👀 Give your eyes a 20-second break! Look at something 20 feet away. Your vision is precious!",
    icon: "👀",
    interval: 20 * 60 * 1000,
  }, // 20 minutes
  {
    type: "posture",
    message: "🪑 Check your posture! Sit up straight, shoulders back. Your future self will thank you!",
    icon: "🪑",
    interval: 30 * 60 * 1000,
  }, // 30 minutes
  {
    type: "break",
    message: "🚶 Time for a 5-minute walk! Movement boosts creativity and reduces stress. Go stretch those legs!",
    icon: "🚶",
    interval: 90 * 60 * 1000,
  }, // 90 minutes
  {
    type: "mental",
    message:
      "🧘 Take a deep breath! Remember: you're doing great, progress isn't always linear, and it's okay to take breaks. You've got this! 💪",
    icon: "🧘",
    interval: 2 * 60 * 60 * 1000,
  }, // 2 hours
]

export function GrewtChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isIdle, setIsIdle] = useState(true)
  const [healthTimers, setHealthTimers] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("grewt-chat-history")
      const savedTimers = localStorage.getItem("grewt-health-timers")

      if (saved) {
        const parsed = JSON.parse(saved)
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        )
      } else {
        const welcomeMessage: ChatMessage = {
          id: "welcome",
          text: "Hi 👋 I'm Grewt, your career buddy and wellness coach! Ask me anything about learning, roadmaps, skill-building, or let me help you stay healthy while coding! 🚀💚",
          isUser: false,
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }

      // Initialize health timers
      const now = Date.now()
      if (savedTimers) {
        setHealthTimers(JSON.parse(savedTimers))
      } else {
        const initialTimers = HEALTH_REMINDERS.reduce(
          (acc, reminder) => {
            acc[reminder.type] = now
            return acc
          },
          {} as Record<string, number>,
        )
        setHealthTimers(initialTimers)
        localStorage.setItem("grewt-health-timers", JSON.stringify(initialTimers))
      }
    }
  }, [])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("grewt-chat-history", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    const checkHealthReminders = () => {
      const now = Date.now()

      HEALTH_REMINDERS.forEach((reminder) => {
        const lastTime = healthTimers[reminder.type] || now
        if (now - lastTime >= reminder.interval) {
          // Send health reminder message
          const healthMessage: ChatMessage = {
            id: `health-${reminder.type}-${now}`,
            text: reminder.message,
            isUser: false,
            timestamp: new Date(),
            isHealthReminder: true,
          }

          setMessages((prev) => [...prev, healthMessage])

          // Update timer
          const newTimers = { ...healthTimers, [reminder.type]: now }
          setHealthTimers(newTimers)
          localStorage.setItem("grewt-health-timers", JSON.stringify(newTimers))
        }
      })
    }

    const interval = setInterval(checkHealthReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [healthTimers])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Idle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsIdle((prev) => !prev)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/grewt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      const data = await response.json()

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Oops! 🤖💫 Something went wrong, but don't worry - keep coding and stay awesome! 🚀✨",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const triggerHealthReminder = (type: string) => {
    const reminder = HEALTH_REMINDERS.find((r) => r.type === type)
    if (reminder) {
      const healthMessage: ChatMessage = {
        id: `manual-${type}-${Date.now()}`,
        text: reminder.message,
        isUser: false,
        timestamp: new Date(),
        isHealthReminder: true,
      }
      setMessages((prev) => [...prev, healthMessage])

      // Reset timer for this reminder
      const newTimers = { ...healthTimers, [type]: Date.now() }
      setHealthTimers(newTimers)
      localStorage.setItem("grewt-health-timers", JSON.stringify(newTimers))
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={`w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 ${
            isIdle ? "animate-pulse" : ""
          } ${isOpen ? "hidden" : "flex"} items-center justify-center`}
        >
          <div className={`text-2xl ${isIdle ? "animate-bounce" : ""}`}>👋🤖</div>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 md:w-96 md:h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          <Card className="h-full flex flex-col shadow-2xl border-0 overflow-hidden bg-white">
            <CardHeader className="pb-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl animate-pulse">
                    🤖
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Grewt</CardTitle>
                    <p className="text-sm opacity-90">Career & Wellness Coach 🌱💚</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerHealthReminder("water")}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  title="Water reminder"
                >
                  <Droplets className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerHealthReminder("eyes")}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  title="Eye rest reminder"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerHealthReminder("break")}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  title="Movement break"
                >
                  <Activity className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerHealthReminder("mental")}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
                  title="Mental health check"
                >
                  <Heart className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50/30 to-white">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                        message.isUser
                          ? "bg-pink-500 text-white shadow-md"
                          : message.isHealthReminder
                            ? "bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 text-gray-800 shadow-sm"
                            : "bg-white border border-pink-100 text-gray-800 shadow-sm"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-pink-100 p-4 rounded-2xl shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-pink-100 bg-pink-50/50">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about career, wellness, or coding... 🌱💚"
                    className="flex-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-full bg-white"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="rounded-full w-10 h-10 p-0 bg-pink-500 hover:bg-pink-600 shadow-md"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
