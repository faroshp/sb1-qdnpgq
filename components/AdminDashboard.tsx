import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MessageCircleIcon, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data structure - expanded to include more days
const generateMockLogs = (startDate, days, direction = 'past') => {
  const logs = []
  const teachers = [
    { id: 1, name: 'Farosh' },
    { id: 2, name: 'Sarah' },
    { id: 3, name: 'John' }
  ]
  
  const activities = [
    'Conducted a math lesson',
    'Had parent-teacher conferences',
    'Organized group projects',
    'Reviewed homework assignments',
    'Prepared lesson materials',
    'Conducted lab experiments',
    'Held guidance sessions',
    'Organized class activities',
    'Attended workshops'
  ]

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + (direction === 'past' ? -i : i))
    const dateStr = date.toISOString().split('T')[0]
    
    teachers.forEach(teacher => {
      const numLogs = Math.floor(Math.random() * 3) + 1 // 1-3 logs per teacher per day
      for (let j = 0; j < numLogs; j++) {
        const activity = activities[Math.floor(Math.random() * activities.length)]
        logs.push({
          id: `${dateStr}-${teacher.id}-${j}`,
          teacherId: teacher.id,
          teacherName: teacher.name,
          date: dateStr,
          content: `${activity} on ${dateStr}`,
          comments: []
        })
      }
    })
  }
  
  return logs
}

const initialLogs = generateMockLogs(new Date(), 7) // Start with a week's worth of logs
const allTeachers = [
  { id: 1, name: 'Farosh' },
  { id: 2, name: 'Sarah' },
  { id: 3, name: 'John' },
]

export default function AdminDashboard() {
  const [logs, setLogs] = useState(initialLogs)
  const [selectedLog, setSelectedLog] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTeachers, setFilteredTeachers] = useState(allTeachers)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef(null)
  const [jumpToDate, setJumpToDate] = useState(null)

  useEffect(() => {
    const filtered = allTeachers.filter(teacher => 
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTeachers(filtered)
    setShowAutocomplete(searchQuery.length > 0 && filtered.length > 0)
    setSelectedTeacher(null)
  }, [searchQuery])

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
    const newLogs = generateMockLogs(lastDate, 7) // Load another week's worth of logs
    
    // Filter out any logs we already have
    const newUniqueRows = newLogs.filter(
      newLog => !logs.some(existingLog => existingLog.id === newLog.id)
    )

    setTimeout(() => { // Simulate API delay
      setLogs(prevLogs => [...prevLogs, ...newUniqueRows])
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

    // Generate logs for the selected date range
    const beforeLogs = generateMockLogs(threeDaysBefore, 3, 'future')
    const afterLogs = generateMockLogs(selectedDate, 3, 'past')
    const newLogs = [...beforeLogs, ...afterLogs]

    setTimeout(() => {
      setLogs(newLogs)
      setIsLoading(false)
      setJumpToDate(selectedDate.toISOString().split('T')[0])
      
      // Scroll to the selected date
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

  const openLogModal = (log) => {
    setSelectedLog(log)
  }

  const addComment = () => {
    if (newComment.trim() === '') return
    const updatedLog = {
      ...selectedLog,
      comments: [
        ...selectedLog.comments,
        { id: Date.now(), author: 'Admin', content: newComment }
      ]
    }
    setLogs(logs.map(log => log.id === selectedLog.id ? updatedLog : log))
    setSelectedLog(updatedLog)
    setNewComment('')
  }

  // Group logs by date
  const groupedByDate = logs.reduce((groups, log) => {
    if (!groups[log.date]) {
      groups[log.date] = []
    }
    if (!selectedTeacher || log.teacherId === selectedTeacher.id) {
      groups[log.date].push(log)
    }
    return groups
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  const navigateToTeacherPage = (teacherId) => {
    console.log(`Navigating to teacher page for ID: ${teacherId}`)
    alert(`Navigating to teacher page for ID: ${teacherId}`)
  }

  const handleTeacherSelect = (teacher) => {
    setSearchQuery(teacher.name)
    setSelectedTeacher(teacher)
    setShowAutocomplete(false)
    navigateToTeacherPage(teacher.id)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <Input
            type="text"
            placeholder="Search for a teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {showAutocomplete && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
              {filteredTeachers.map(teacher => (
                <li 
                  key={teacher.id} 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleTeacherSelect(teacher)}
                >
                  {teacher.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        
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
              <CardDescription>Daily logs and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedByDate[date].map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={() => openLogModal(log)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm text-blue-600">{log.teacherName}</p>
                        <p className="mt-1">{log.content}</p>
                      </div>
                      {log.comments.length > 0 && (
                        <MessageCircleIcon className="h-4 w-4 text-blue-500 ml-2 flex-shrink-0" />
                      )}
                    </div>
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

      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>View and add comments</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{selectedLog.teacherName} - {formatDate(selectedLog.date)}</p>
                <p>{selectedLog.content}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Comments:</h3>
                <ul className="space-y-2">
                  {selectedLog.comments.map(comment => (
                    <li key={comment.id} className={`p-2 rounded ${comment.author === 'Admin' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <p className="font-semibold">{comment.author}</p>
                      <p>{comment.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow"
                />
                <Button onClick={addComment}>Post Comment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}