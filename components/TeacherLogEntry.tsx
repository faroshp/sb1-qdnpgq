"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, SendIcon, ChevronLeftIcon, ChevronRightIcon, LinkIcon, MessageCircleIcon } from "lucide-react"

// Mock data structure
const initialLogs = {
  '2024-09-10': [
    { id: 1, content: 'Conducted a successful math lesson on fractions.', link: 'https://example.com/math-lesson', comments: [
      { id: 1, author: 'Admin', content: 'Great job on the fractions lesson!', isRead: false },
      { id: 2, author: 'Farosh', content: 'Thank you! The students really enjoyed it.', isRead: true },
    ] },
    { id: 2, content: 'Had a productive parent-teacher conference.', link: '', comments: [] },
    { id: 3, content: 'Organized a group project for the science class.', link: 'https://example.com/science-project', comments: [] },
  ],
  '2024-09-11': [
    { id: 4, content: 'Reviewed homework assignments for English class.', link: '', comments: [] },
    { id: 5, content: 'Prepared materials for tomorrow\'s history lesson.', link: 'https://example.com/history-materials', comments: [] },
  ],
}

export default function TeacherLogEntry() {
  const [selectedDate, setSelectedDate] = useState('2024-09-10')
  const [logContent, setLogContent] = useState('')
  const [logLink, setLogLink] = useState('')
  const [logs, setLogs] = useState(initialLogs)
  const [selectedLog, setSelectedLog] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [newComment, setNewComment] = useState('')
  const logsPerPage = 5

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (logContent.trim() === '') return
    const newLog = {
      id: Date.now(),
      content: logContent,
      link: logLink,
      comments: []
    }
    setLogs(prevLogs => ({
      ...prevLogs,
      [selectedDate]: [newLog, ...(prevLogs[selectedDate] || [])]
    }))
    setLogContent('')
    setLogLink('')
  }

  const changeDate = (days) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate.toISOString().split('T')[0])
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

  const openLogModal = (log) => {
    setSelectedLog(log)
  }

  const addComment = () => {
    if (newComment.trim() === '') return
    const updatedLog = {
      ...selectedLog,
      comments: [
        ...selectedLog.comments,
        { id: Date.now(), author: 'Farosh', content: newComment, isRead: true }
      ]
    }
    setLogs(prevLogs => ({
      ...prevLogs,
      [selectedDate]: prevLogs[selectedDate].map(log =>
        log.id === selectedLog.id ? updatedLog : log
      )
    }))
    setSelectedLog(updatedLog)
    setNewComment('')
  }

  const paginatedLogs = (logs[selectedDate] || []).slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage)

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Farosh's Daily Log</h1>
      <div className="mb-6 flex items-center justify-between">
        <Button onClick={() => changeDate(-1)} variant="outline">
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous Day
        </Button>
        <div className="relative">
          <Input
            type="date"
            id="selectedDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="pl-10"
          />
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <Button onClick={() => changeDate(1)} variant="outline">
          Next Day
          <ChevronRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">{formatDate(selectedDate)}</CardTitle>
          <CardDescription className="text-center">Your daily logs</CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedLogs.length > 0 ? (
            <ul className="space-y-2">
              {paginatedLogs.map((log) => (
                <li key={log.id} className="p-2 bg-gray-100 rounded flex justify-between items-center cursor-pointer" onClick={() => openLogModal(log)}>
                  <span className="flex-grow">{log.content}</span>
                  <div className="flex items-center space-x-2">
                    {log.link && <LinkIcon className="h-4 w-4 text-blue-500" />}
                    {log.comments.length > 0 && <MessageCircleIcon className="h-4 w-4 text-green-500" />}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No logs for this date.</p>
          )}
          {(logs[selectedDate] || []).length > logsPerPage && (
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * logsPerPage >= (logs[selectedDate] || []).length}
                variant="outline"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">New Log Entry</CardTitle>
          <CardDescription className="text-center">Quickly add a new log for {formatDate(selectedDate)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                placeholder="Enter your log..."
                className="flex-grow"
                required
              />
              <Button type="submit">
                <SendIcon className="h-4 w-4" />
                <span className="sr-only">Submit Log</span>
              </Button>
            </div>
            <Input
              type="url"
              value={logLink}
              onChange={(e) => setLogLink(e.target.value)}
              placeholder="Add a link (optional)"
            />
          </form>
        </CardContent>
      </Card>
      <Dialog open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>View and respond to comments</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <p>{selectedLog.content}</p>
              {selectedLog.link && (
                <a href={selectedLog.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Associated Link
                </a>
              )}
              <h3 className="font-semibold">Comments:</h3>
              <ul className="space-y-2">
                {selectedLog.comments.map(comment => (
                  <li key={comment.id} className={`p-2 rounded ${comment.author === 'Admin' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <p className="font-semibold">{comment.author}</p>
                    <p>{comment.content}</p>
                  </li>
                ))}
              </ul>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow"
                />
                <Button onClick={addComment}>Post</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}