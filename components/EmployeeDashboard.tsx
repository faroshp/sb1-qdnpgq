import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MessageCircleIcon, CalendarIcon, PlusCircleIcon, MessageSquareIcon, ClipboardListIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/router' // Note: This is a mock import for the example

// Mock current user data
const currentUser = {
  id: 1,
  name: 'Farosh',
  role: 'Teacher'
}

// Mock data generation function
const generateMockLogs = (startDate, days, userId, direction = 'past') => {
  const logs = []
  const activities = [
    'Conducted a math lesson',
    'Had parent-teacher conferences',
    'Organized group projects',
    'Reviewed homework assignments',
    'Prepared lesson materials'
  ]

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + (direction === 'past' ? -i : i))
    const dateStr = date.toISOString().split('T')[0]
    
    const numLogs = Math.floor(Math.random() * 2) + 1 // 1-2 logs per day
    for (let j = 0; j < numLogs; j++) {
      const activity = activities[Math.floor(Math.random() * activities.length)]
      logs.push({
        id: `${dateStr}-${userId}-${j}`,
        teacherId: userId,
        teacherName: currentUser.name,
        date: dateStr,
        content: `${activity} on ${dateStr}`,
        comments: Array(Math.floor(Math.random() * 3)).fill(null).map((_, index) => ({
          id: `${dateStr}-${userId}-${j}-comment-${index}`,
          author: 'Admin',
          content: 'Great work on this!'
        }))
      })
    }
  }
  
  return logs
}

const initialLogs = generateMockLogs(new Date(), 7, currentUser.id)

export default function EmployeeDashboard() {
  const [logs, setLogs] = useState(initialLogs)
  const [selectedLog, setSelectedLog] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef(null)
  const [jumpToDate, setJumpToDate] = useState(null)
  const router = useRouter() // Mock router

  // Calculate metrics
  const metrics = {
    totalLogs: logs.length,
    totalComments: logs.reduce((sum, log) => sum + log.comments.length, 0),
    averageCommentsPerLog: (logs.reduce((sum, log) => sum + log.comments.length, 0) / logs.length).toFixed(1),
    logsThisWeek: logs.filter(log => {
      const logDate = new Date(log.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return logDate >= weekAgo
    }).length
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const date = new Date(dateString)
    const formatter = new Intl.DateTimeFormat('en-IN', options)
    const parts = formatter.formatToParts(date)
    const weekday = parts.find(part => part.type === 'weekday').value
    const day = parts.find(part => part.type === 'day').value
    const month = parts.find(part => part.type === 'month').value
    const year = parts.find(part => part.type === 'year').value
    const suffix = getDaySuffix(parseInt(day))
    return `${weekday}, ${month} ${day}${suffix} ${year}`
  }

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1:  return "st"
      case 2:  return "nd"
      case 3:  return "rd"
      default: return "th"
    }
  }

  const loadMoreLogs = useCallback(() => {
    if (isLoading) return

    setIsLoading(true)
    const lastDate = new Date(logs[logs.length - 1].date)
    const newLogs = generateMockLogs(lastDate, 7, currentUser.id)
    
    setTimeout(() => {
      setLogs(prevLogs => [...prevLogs, ...newLogs])
      setIsLoading(false)
    }, 500)
  }, [logs, isLoading])

  const handleDateSelect = (date) => {
    if (!date) return
    
    setIsLoading(true)
    const selectedDate = date
    const threeDaysBefore = new Date(selectedDate)
    threeDaysBefore.setDate(selectedDate.getDate() - 3)
    const threeDaysAfter = new Date(selectedDate)
    threeDaysAfter.setDate(selectedDate.getDate() + 3)

    const beforeLogs = generateMockLogs(threeDaysBefore, 3, currentUser.id, 'future')
    const afterLogs = generateMockLogs(selectedDate, 3, currentUser.id, 'past')
    const newLogs = [...beforeLogs, ...afterLogs]

    setTimeout(() => {
      setLogs(newLogs)
      setIsLoading(false)
      setJumpToDate(selectedDate.toISOString().split('T')[0])
      
      const dateElement = document.getElementById(`date-${selectedDate.toISOString().split('T')[0]}`)
      if (dateElement) {
        dateElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 500)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreLogs()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [loadMoreLogs])

  // Group logs by date
  const groupedByDate = logs.reduce((groups, log) => {
    if (!groups[log.date]) {
      groups[log.date] = []
    }
    groups[log.date].push(log)
    return groups
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Button 
          onClick={() => router.push('/add-log')} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Add New Log
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Total Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline">
              <div className="text-2xl font-semibold">{metrics.totalLogs}</div>
              <ClipboardListIcon className="ml-2 h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Total Comments</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline">
              <div className="text-2xl font-semibold">{metrics.totalComments}</div>
              <MessageSquareIcon className="ml-2 h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Comments per Log</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-semibold">{metrics.averageCommentsPerLog}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Logs This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-semibold">{metrics.logsThisWeek}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[240px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Jump to Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={jumpToDate ? new Date(jumpToDate) : undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-8">
        {sortedDates.map(date => (
          <Card key={date} id={`date-${date}`}>
            <CardHeader>
              <CardTitle>{formatDate(date)}</CardTitle>
              <CardDescription>Your daily logs and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedByDate[date].map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="mt-1">{log.content}</p>
                      </div>
                      {log.comments.length > 0 && (
                        <div className="flex items-center text-blue-600">
                          <MessageCircleIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">{log.comments.length}</span>
                        </div>
                      )}
                    </div>
                    {log.comments.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-gray-300">
                        {log.comments.map(comment => (
                          <div key={comment.id} className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">{comment.author}:</span> {comment.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div ref={observerTarget} className="h-10 flex items-center justify-center">
          {isLoading && <div className="text-gray-500">Loading more logs...</div>}
        </div>
      </div>
    </div>
  )
}