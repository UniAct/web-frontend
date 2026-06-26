import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Brain, CheckCircle2, FileText, Loader2, MessageSquare, RefreshCw, Search, Send, Sparkles, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { User as AppUser } from '../App';
import { AiService, LearningGroupService } from '../api';
import type { AiHistoryMessage, LearningGroupSummary } from '../api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { useResolvedSemester } from '../hooks/useResolvedSemester';

interface AIAssistantPageProps {
  user: AppUser;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

function toChatMessage(message: AiHistoryMessage, index: number): ChatMessage {
  return {
    id: `${message.created_at}-${index}`,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
  };
}

function readableSize(size: number | null): string {
  if (!size) return 'Unknown size';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function extractStudentId(user: AppUser): number | undefined {
  const candidates = [user.studentId, user.id];
  for (const candidate of candidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function AIAssistantPage({ user }: AIAssistantPageProps) {
  const [groups, setGroups] = useState<LearningGroupSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [includeTranscript, setIncludeTranscript] = useState(user.role === 'student');
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [materials, setMaterials] = useState<Array<{ asset_name: string; asset_size: number }>>([]);
  const [chapters, setChapters] = useState<Array<{ file_id?: string; chapter_title?: string; title?: string }>>([]);
  const [searchResults, setSearchResults] = useState<Array<{ text?: string; score?: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [generated, setGenerated] = useState<{ title: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { semesterId: activeSemesterId, isLoading: isResolvingSemester } = useResolvedSemester({
    fallbackSemesterId: user.currentSemesterId ?? null,
  });

  const selectedGroup = useMemo(
    () => groups.find((group) => group.groupId === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const canUseTranscript = user.role === 'student' || user.role === 'faculty';

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    setError(null);
    try {
      const nextGroups = await LearningGroupService.getMyGroups(activeSemesterId);
      setGroups(nextGroups);
      setSelectedGroupId((current) => current ?? nextGroups[0]?.groupId ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load learning groups';
      setError(message);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [activeSemesterId]);

  const loadGroupAiState = useCallback(async (groupId: number) => {
    setSessionId(undefined);
    setMessages([]);
    setGenerated(null);
    setMaterials([]);
    setChapters([]);
    setSearchResults([]);

    try {
      const [sessions, files, nextChapters] = await Promise.all([
        AiService.listSessions(groupId),
        AiService.getFiles(groupId).catch(() => undefined),
        AiService.getChapters(groupId).catch(() => undefined),
      ]);
      const latestSession = sessions[0];
      if (latestSession?.session_id) {
        setSessionId(latestSession.session_id);
        const history = await AiService.getSessionHistory(latestSession.session_id);
        setMessages(history.map(toChatMessage));
      }
      setMaterials(files?.assets ?? []);
      setChapters(nextChapters ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI service is not ready for this group';
      setError(message);
    }
  }, []);

  useEffect(() => {
    if (!isResolvingSemester) loadGroups();
  }, [isResolvingSemester, loadGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupAiState(selectedGroupId);
    }
  }, [loadGroupAiState, selectedGroupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const handleSync = async () => {
    if (!selectedGroupId) return;
    setIsSyncing(true);
    setError(null);
    try {
      const result = await AiService.syncGroupMaterials(selectedGroupId);
      toast.success(`AI materials synced: ${result.indexed} indexed, ${result.skipped} skipped`);
      const [files, nextChapters] = await Promise.all([
        AiService.getFiles(selectedGroupId).catch(() => undefined),
        AiService.getChapters(selectedGroupId).catch(() => undefined),
      ]);
      setMaterials(files?.assets ?? []);
      setChapters(nextChapters ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync materials';
      setError(message);
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSend = async () => {
    if (!selectedGroupId || !input.trim() || isSending) return;

    const text = input.trim();
    setInput('');
    setIsSending(true);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() },
    ]);

    try {
      const response = await AiService.chat(selectedGroupId, {
        text,
        sessionId,
        includeTranscript: includeTranscript && canUseTranscript,
        studentId: includeTranscript ? extractStudentId(user) : undefined,
        limit: 5,
      });
      setSessionId(response.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer || 'No answer returned.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed';
      setError(message);
      toast.error(message);
      setMessages((prev) => prev.filter((messageItem) => messageItem.content !== text || messageItem.role !== 'user'));
    } finally {
      setIsSending(false);
    }
  };

  const generateSummary = async () => {
    if (!selectedGroupId || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await AiService.summarize(selectedGroupId, topic.trim());
      setGenerated({ title: 'Material Summary', body: result.summary });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePractice = async () => {
    if (!selectedGroupId || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await AiService.exam(selectedGroupId, {
        content: topic.trim(),
        difficulty: 'medium',
        num_mcq: 5,
        num_written: 2,
      });
      const mcq = result.exam.mcq_questions ?? [];
      const written = result.exam.written_questions ?? [];
      const body = [
        ...mcq.map((q, index) => `${index + 1}. ${q.question}\n${q.choices.map((choice) => `   - ${choice}`).join('\n')}\nAnswer: ${q.correct_answer}${q.answer_explanation ? `\nWhy: ${q.answer_explanation}` : ''}`),
        ...written.map((q, index) => `${mcq.length + index + 1}. ${q.question}\nSuggested answer: ${q.answer}`),
      ].join('\n\n');
      setGenerated({ title: 'Practice Set', body: body || 'No questions returned for the selected material.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate practice questions';
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const runSemanticSearch = async () => {
    if (!selectedGroupId || isSearching) return;
    const text = topic.trim() || input.trim();
    if (!text) {
      toast.error('Add a topic or question to search the indexed materials.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setGenerated(null);
    try {
      const results = await AiService.search(selectedGroupId, { text, limit: 5 });
      setSearchResults(results ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search indexed materials';
      setError(message);
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoadingGroups || isResolvingSemester) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm text-slate-600">Loading your learning groups...</span>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bot className="mb-3 h-10 w-10 text-slate-300" />
          <h1 className="text-xl font-semibold text-slate-900">No learning groups yet</h1>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Join or create a learning group first. The assistant uses group materials and transcript context to answer useful course questions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">AI Course Assistant</h1>
          <p className="mt-1 text-sm text-slate-600">Ask against learning-group materials, generate study assets, and include transcript context when useful.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={selectedGroupId ? String(selectedGroupId) : undefined} onValueChange={(value) => setSelectedGroupId(Number(value))}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select learning group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.groupId} value={String(group.groupId)}>
                  {group.course.code} - {group.course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSync} disabled={!selectedGroupId || isSyncing} className="gap-2">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync materials
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-h-[640px] overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                {selectedGroup ? `${selectedGroup.course.code} Assistant` : 'Assistant'}
              </CardTitle>
              {canUseTranscript && (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <Switch checked={includeTranscript} onCheckedChange={setIncludeTranscript} />
                  Include transcript context
                </label>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex h-[590px] flex-col p-0">
            <ScrollArea className="flex-1 px-4 py-5">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                    <Sparkles className="mx-auto mb-3 h-8 w-8 text-blue-500" />
                    <p className="font-medium text-slate-900">Start with a course question</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                      Try asking for an explanation, a worked example, or what to focus on before an exam.
                    </p>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.role === 'user' ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about this group’s materials..."
                  disabled={!selectedGroupId || isSending}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isSending || !selectedGroupId} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-blue-600" />
                Indexed Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {materials.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No indexed files found. Sync the group materials to make PDFs and text files available to AI.
                </div>
              ) : (
                materials.slice(0, 5).map((file) => (
                  <div key={file.asset_name} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{file.asset_name}</p>
                      <p className="text-xs text-slate-500">{readableSize(file.asset_size)}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  </div>
                ))
              )}
              {materials.length > 5 && <p className="text-xs text-slate-500">+{materials.length - 5} more indexed files</p>}
              {chapters.length > 0 && (
                <div className="pt-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Detected chapters</p>
                  <div className="flex flex-wrap gap-2">
                    {chapters.slice(0, 8).map((chapter, index) => (
                      <Badge key={`${chapter.file_id ?? 'chapter'}-${chapter.chapter_title ?? chapter.title ?? index}`} variant="secondary" className="max-w-full truncate">
                        {chapter.chapter_title ?? chapter.title ?? `Chapter ${index + 1}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-blue-600" />
                Generate Study Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Optional topic or chapter focus..."
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={generateSummary} disabled={!selectedGroupId || isGenerating} className="gap-2">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Summary
                </Button>
                <Button variant="outline" onClick={generatePractice} disabled={!selectedGroupId || isGenerating} className="gap-2">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  Practice
                </Button>
                <Button variant="outline" onClick={runSemanticSearch} disabled={!selectedGroupId || isSearching} className="col-span-2 gap-2">
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search materials
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">Relevant Passages</p>
                    <Badge variant="outline">{searchResults.length}</Badge>
                  </div>
                  <ScrollArea className="max-h-72">
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div key={`${result.score ?? 0}-${index}`} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                          <p className="whitespace-pre-wrap leading-relaxed">{result.text || 'No text returned for this passage.'}</p>
                          {typeof result.score === 'number' && (
                            <p className="mt-2 text-xs text-slate-500">Score {(result.score * 100).toFixed(1)}%</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              {generated && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{generated.title}</p>
                    <Badge variant="outline">AI</Badge>
                  </div>
                  <ScrollArea className="max-h-80">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{generated.body}</pre>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
