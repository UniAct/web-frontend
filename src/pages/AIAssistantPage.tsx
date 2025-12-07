import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Bot,
  Send,
  Upload,
  FileText,
  Book,
  Lightbulb,
  Clock,
  MessageSquare,
  Paperclip,
  Sparkles,
  BookOpen,
  Calculator,
  Brain
} from 'lucide-react';
import type { User as AppUser } from '../App';

interface AIAssistantPageProps {
  user: AppUser;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface StudyRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'topic' | 'practice' | 'reading';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export function AIAssistantPage({ user }: AIAssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello ${user.name.split(' ')[0]}! I'm your AI study assistant. I can help you with:\n\n• Understanding course concepts\n• Solving practice problems\n• Study planning and scheduling\n• Exam preparation strategies\n• Assignment guidance\n\nWhat would you like to work on today?`,
      timestamp: '2024-03-15 09:00',
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const studyRecommendations: StudyRecommendation[] = [
    {
      id: '1',
      title: 'Review Binary Tree Traversals',
      description: 'Based on your recent quiz performance, reviewing tree traversal algorithms could help.',
      type: 'topic',
      priority: 'high',
      estimatedTime: '45 min',
    },
    {
      id: '2',
      title: 'Practice Dynamic Programming',
      description: 'Try solving 5 DP problems to strengthen your problem-solving skills.',
      type: 'practice',
      priority: 'medium',
      estimatedTime: '2 hours',
    },
    {
      id: '3',
      title: 'Read Chapter 8 - Graph Algorithms',
      description: 'Prepare for next week\'s lectures on graph theory and algorithms.',
      type: 'reading',
      priority: 'medium',
      estimatedTime: '1 hour',
    },
    {
      id: '4',
      title: 'Algorithm Complexity Analysis',
      description: 'Review Big O notation and time complexity analysis techniques.',
      type: 'topic',
      priority: 'low',
      estimatedTime: '30 min',
    },
  ];

  const quickQuestions = [
    "Explain bubble sort algorithm",
    "What is the difference between Stack and Queue?",
    "Help me with recursion concepts",
    "Binary search implementation",
    "SQL JOIN types explained"
  ];

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleString(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setUploadedFiles([]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(currentMessage),
        timestamp: new Date().toLocaleString(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('bubble sort')) {
      return `**Bubble Sort Algorithm**

Bubble sort is a simple sorting algorithm that works by repeatedly stepping through the list, comparing adjacent elements and swapping them if they're in the wrong order.

**Algorithm:**
1. Compare adjacent elements
2. Swap if they're in wrong order  
3. Repeat until no swaps needed

**Time Complexity:** O(n²)
**Space Complexity:** O(1)

**Python Implementation:**
\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
\`\`\`

Would you like me to explain any specific part in more detail?`;
    }

    if (lowerQuestion.includes('stack') && lowerQuestion.includes('queue')) {
      return `**Stack vs Queue - Key Differences**

**Stack (LIFO - Last In, First Out):**
• Elements added and removed from the same end (top)
• Operations: push(), pop(), peek(), isEmpty()
• Use cases: Function calls, undo operations, expression evaluation

**Queue (FIFO - First In, First Out):**
• Elements added at rear, removed from front
• Operations: enqueue(), dequeue(), front(), isEmpty()
• Use cases: Task scheduling, breadth-first search, print queues

**Visual Representation:**
Stack: [1][2][3] ← top (push/pop here)
Queue: [1][2][3] ← rear (enqueue) | front (dequeue) →

Need help with implementing either of these?`;
    }

    if (lowerQuestion.includes('recursion')) {
      return `**Recursion Concepts**

Recursion is when a function calls itself to solve a smaller version of the same problem.

**Key Components:**
1. **Base Case:** Condition to stop recursion
2. **Recursive Case:** Function calls itself with modified parameters

**Example - Factorial:**
\`\`\`python
def factorial(n):
    # Base case
    if n <= 1:
        return 1
    # Recursive case
    return n * factorial(n - 1)
\`\`\`

**Tips for Understanding:**
• Trace through small examples step by step
• Always identify base case first
• Ensure progress toward base case
• Practice with tree traversals, Fibonacci, etc.

What specific recursion problem are you working on?`;
    }

    // Default response
    return `I understand you're asking about "${question}". Let me help you with that!

Based on your question, I can provide detailed explanations, code examples, or step-by-step solutions. Could you provide more specific details about what aspect you'd like me to focus on?

**I can help with:**
• Code implementation and debugging
• Concept explanations with examples  
• Problem-solving strategies
• Study materials and resources

Feel free to upload any relevant files or lecture notes for more personalized assistance!`;
  };

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const fileName = `lecture_notes_${Date.now()}.pdf`;
    setUploadedFiles(prev => [...prev, fileName]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topic': return Brain;
      case 'practice': return Calculator;
      case 'reading': return BookOpen;
      default: return Book;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">AI Course Assistant</h1>
        <p className="text-muted-foreground">Get personalized help with your studies and coursework.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Assistant Chat
            </CardTitle>
            <CardDescription>Ask questions, get explanations, and receive study guidance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Messages */}
            <ScrollArea className="h-96 w-full p-4 border rounded-lg">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-foreground'
                      }`}>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {message.attachments && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs opacity-75">
                              <FileText className="w-3 h-3" />
                              <span>{file}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs opacity-75 mt-2">{message.timestamp}</div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* File Upload Area */}
            {uploadedFiles.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Attached files:</span>
                </div>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="w-3 h-3" />
                      <span>{file}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleFileUpload}>
                <Upload className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Ask me anything about your courses..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Questions */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Recommendations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Study Recommendations
              </CardTitle>
              <CardDescription>Personalized suggestions based on your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studyRecommendations.map((rec) => {
                  const IconComponent = getTypeIcon(rec.type);
                  return (
                    <div key={rec.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <IconComponent className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="text-sm">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{rec.estimatedTime}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Start
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upload Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Study Materials
              </CardTitle>
              <CardDescription>Upload notes or slides for AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag files here or click to browse
                  </p>
                  <Button variant="outline" size="sm" onClick={handleFileUpload}>
                    Select Files
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: PDF, DOCX, PPT, TXT</p>
                  <p>Max size: 10MB per file</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Practice Questions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Create Study Plan
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calculator className="w-4 h-4 mr-2" />
                  Solve Math Problems
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Explain Concepts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
