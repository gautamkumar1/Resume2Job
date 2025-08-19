'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Upload, FileText, MessageSquare, Send, Bot, User, X, Check, Briefcase, MapPin, Clock, DollarSign } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadProgress: number
  status: 'uploading' | 'completed' | 'error'
}

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  description: string
  requirements: string[]
  posted: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

type AppState = 'upload' | 'jobs' | 'chat'

// Mock job data
const mockJobs: JobListing[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $180k',
    type: 'Full-time',
    description: 'We are looking for a senior software engineer to join our growing team.',
    requirements: ['5+ years experience', 'React/Node.js', 'AWS/Cloud platforms'],
    posted: '2 days ago'
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Digital Solutions',
    location: 'Remote',
    salary: '$80k - $120k',
    type: 'Full-time',
    description: 'Join our remote team to build beautiful and responsive user interfaces.',
    requirements: ['3+ years experience', 'React/Vue.js', 'TypeScript'],
    posted: '1 day ago'
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Startup Innovations',
    location: 'New York, NY',
    salary: '$90k - $140k',
    type: 'Full-time',
    description: 'Be part of an exciting startup building productivity tools.',
    requirements: ['JavaScript/TypeScript', 'React/Node.js', 'Database design'],
    posted: '3 days ago'
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'WebFlow Systems',
    location: 'Austin, TX',
    salary: '$75k - $110k',
    type: 'Full-time',
    description: 'Build modern web applications with React and TypeScript.',
    requirements: ['React expertise', 'TypeScript', 'REST APIs'],
    posted: '1 day ago'
  },
  {
    id: '5',
    title: 'Backend Engineer',
    company: 'DataTech Corp',
    location: 'Seattle, WA',
    salary: '$100k - $150k',
    type: 'Full-time',
    description: 'Design and implement scalable backend systems.',
    requirements: ['Node.js/Python', 'Databases', 'Microservices'],
    posted: '4 days ago'
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'CloudFirst Inc',
    location: 'Remote',
    salary: '$95k - $135k',
    type: 'Full-time',
    description: 'Manage cloud infrastructure and deployment pipelines.',
    requirements: ['AWS/Azure', 'Docker/Kubernetes', 'CI/CD'],
    posted: '2 days ago'
  },
  {
    id: '7',
    title: 'UI/UX Developer',
    company: 'Design Studios',
    location: 'Los Angeles, CA',
    salary: '$70k - $105k',
    type: 'Full-time',
    description: 'Create beautiful and intuitive user experiences.',
    requirements: ['UI/UX design', 'Figma/Sketch', 'Frontend skills'],
    posted: '5 days ago'
  },
  {
    id: '8',
    title: 'Mobile Developer',
    company: 'AppTech Solutions',
    location: 'Chicago, IL',
    salary: '$85k - $125k',
    type: 'Full-time',
    description: 'Develop cross-platform mobile applications.',
    requirements: ['React Native', 'iOS/Android', 'Mobile UI'],
    posted: '3 days ago'
  }
]

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [appState, setAppState] = useState<AppState>('upload')
  const [streamingJobs, setStreamingJobs] = useState<JobListing[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }, [])

  const handleFiles = useCallback((fileList: File[]) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    
    fileList.forEach((file) => {
      if (validTypes.includes(file.type)) {
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: 'uploading'
        }

        setFiles(prev => [...prev, newFile])

        // Simulate upload progress
        const interval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === newFile.id) {
              if (f.uploadProgress >= 100) {
                clearInterval(interval)
                // After upload completion, start streaming jobs
                setTimeout(() => {
                  setAppState('jobs')
                  startJobStreaming()
                }, 1000)
                return { ...f, uploadProgress: 100, status: 'completed' }
              }
              return { ...f, uploadProgress: f.uploadProgress + 10 }
            }
            return f
          }))
        }, 200)
      }
    })
  }, [])

  const startJobStreaming = useCallback(() => {
    setIsStreaming(true)
    setStreamingJobs([])
    
    // Stream jobs one by one with delay
    mockJobs.forEach((job, index) => {
      setTimeout(() => {
        setStreamingJobs(prev => [...prev, job])
        
        // After all jobs are streamed, enable chat
        if (index === mockJobs.length - 1) {
          setTimeout(() => {
            setIsStreaming(false)
            setAppState('chat')
          }, 1000)
        }
      }, (index + 1) * 800) // 0.8s delay between each job
    })
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    if (files.length === 1) {
      setAppState('upload')
      setStreamingJobs([])
      setChatMessages([])
    }
  }, [files.length])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSendMessage = useCallback(() => {
    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setCurrentMessage('')

    // Simulate AI response based on resume and jobs
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Based on your resume analysis, I found ${streamingJobs.length} matching jobs. The positions seem well-aligned with your skills and experience. Would you like me to help you customize your application for any specific role or provide more details about the requirements?`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
    }, 1000)
  }, [currentMessage, streamingJobs.length])

  return (
    <div className="min-h-screen bg-background">
      {/* Upload Section - Only show when in upload state and center it */}
      {appState === 'upload' ? (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-2xl">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Upload className="h-6 w-6" />
                  Upload Your Resume
                </CardTitle>
                <CardDescription className="text-lg">
                  Upload your resume to find the best matching job opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                    isDragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium text-lg">Drop your resume here or click to upload</p>
                      <p className="text-muted-foreground mt-2">Supports PDF, DOC, DOCX files up to 10MB</p>
                    </div>
                    <Button size="lg" variant="outline">
                      Choose Resume File
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                />

                {/* File Upload Progress */}
                {files.length > 0 && (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-lg truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                          {file.status === 'uploading' && (
                            <div className="mt-2">
                              <Progress value={file.uploadProgress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">Uploading... {file.uploadProgress}%</p>
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <div className="flex items-center gap-1 mt-1">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">Upload completed</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Jobs and Chat Section - Show when in jobs or chat state */
        <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8 space-y-8">
          {(appState === 'jobs' || appState === 'chat') && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Matching Job Opportunities</h2>
              <p className="text-muted-foreground">Based on your resume analysis, here are the best matching jobs</p>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {streamingJobs.map((job, index) => (
                <Card 
                  key={job.id} 
                  className="opacity-0 animate-in slide-in-from-bottom-4 duration-700 aspect-square hover:shadow-lg transition-all cursor-pointer group"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mx-auto">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-sm leading-tight">{job.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-green-600">{job.salary}</div>
                        <Badge variant="outline" className="text-xs mt-1">{job.type}</Badge>
                      </div>
                      <Button size="sm" className="w-full text-xs group-hover:bg-primary group-hover:text-primary-foreground">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty slots for streaming animation */}
              {isStreaming && Array.from({ length: Math.max(0, 8 - streamingJobs.length) }).map((_, index) => (
                <Card key={`empty-${index}`} className="aspect-square border-dashed border-muted-foreground/25">
                  <CardContent className="p-4 h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {isStreaming && (
              <div className="text-center">
                <p className="text-muted-foreground">Finding more matching jobs...</p>
              </div>
            )}
          </div>
        )}

        {/* Chat Section - Show only when in chat state */}
        {appState === 'chat' && (
          <div className="space-y-6">
            {/* Chat Messages - Only show if there are messages */}
            {chatMessages.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      AI Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 w-full">
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.type === 'ai' && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.type === 'user'
                                  ? 'bg-primary text-primary-foreground ml-auto'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {message.type === 'user' && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Modern AI Chat Input */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Ask me anything about these jobs..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      className="min-h-[60px] resize-none bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    size="icon"
                    className="h-[60px] w-[60px] rounded-lg"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  )
}