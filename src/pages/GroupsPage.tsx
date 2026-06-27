import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CalendarClock,
  Copy,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../App';
import { AiService, LearningGroupService } from '../api';
import type {
  LearningGroupComment,
  LearningGroupDetails,
  LearningGroupPost,
  LearningGroupPostType,
  LearningGroupSummary,
} from '../api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { useResolvedSemester } from '../hooks/useResolvedSemester';

interface GroupsPageProps {
  user: User;
}

type PostFilter = 'ALL' | LearningGroupPostType;

const POST_TYPES: Array<{ value: LearningGroupPostType; label: string }> = [
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
];

function formatDate(value?: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(size: number | null): string {
  if (!size) return 'Unknown size';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function authorName(post: LearningGroupPost): string {
  return `${post.author.firstName} ${post.author.lastName}`.trim();
}

function postTone(type: LearningGroupPostType): string {
  if (type === 'ASSIGNMENT') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (type === 'MATERIAL') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

export function GroupsPage({ user }: GroupsPageProps) {
  const [groups, setGroups] = useState<LearningGroupSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [details, setDetails] = useState<LearningGroupDetails | null>(null);
  const [posts, setPosts] = useState<LearningGroupPost[]>([]);
  const [filter, setFilter] = useState<PostFilter>('ALL');
  const [search, setSearch] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [postType, setPostType] = useState<LearningGroupPostType>('MATERIAL');
  const [postContent, setPostContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [commentsPost, setCommentsPost] = useState<LearningGroupPost | null>(null);
  const [comments, setComments] = useState<LearningGroupComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { semesterId: activeSemesterId, isLoading: isResolvingSemester } = useResolvedSemester({
    fallbackSemesterId: user.currentSemesterId ?? null,
  });

  const selectedGroup = useMemo(
    () => groups.find((group) => group.groupId === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );
  const isOwner = selectedGroup?.myRole === 'Owner';
  const canPost = Boolean(isOwner || selectedGroup?.allowStudentPosts);

  const visiblePosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesFilter = filter === 'ALL' || post.postType === filter;
      const matchesSearch =
        !query ||
        post.content?.toLowerCase().includes(query) ||
        authorName(post).toLowerCase().includes(query) ||
        post.attachments.some((file) => file.fileName.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [filter, posts, search]);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextGroups = await LearningGroupService.getMyGroups(activeSemesterId);
      setGroups(nextGroups);
      setSelectedGroupId((current) => current ?? nextGroups[0]?.groupId ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load learning groups';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [activeSemesterId]);

  const loadSelectedGroup = useCallback(async (groupId: number, postTypeFilter: PostFilter = filter) => {
    setError(null);
    try {
      const [nextDetails, page] = await Promise.all([
        LearningGroupService.getDetails(groupId),
        LearningGroupService.getPosts(groupId, postTypeFilter === 'ALL' ? undefined : postTypeFilter),
      ]);
      setDetails(nextDetails);
      setPosts(page.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load group';
      setError(message);
    }
  }, [filter]);

  useEffect(() => {
    if (!isResolvingSemester) loadGroups();
  }, [isResolvingSemester, loadGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      loadSelectedGroup(selectedGroupId);
    }
  }, [loadSelectedGroup, selectedGroupId]);

  const handleFilterChange = (value: string) => {
    const next = value as PostFilter;
    setFilter(next);
    if (selectedGroupId) loadSelectedGroup(selectedGroupId, next);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      const joined = await LearningGroupService.join(joinCode.trim());
      toast.success(`Joined ${joined.groupName}`);
      setJoinCode('');
      await loadGroups();
      setSelectedGroupId(joined.groupId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to join group');
    }
  };

  const resetPostForm = () => {
    setPostType('MATERIAL');
    setPostContent('');
    setDueDate('');
    setFiles([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFileSelection = (selectedFiles: FileList | null) => {
    const nextFiles = Array.from(selectedFiles ?? []);
    if (nextFiles.length > 5) {
      toast.error('You can attach up to 5 files.');
    }
    setFiles(nextFiles.slice(0, 5));
  };

  const removeSelectedFile = (fileToRemove: File) => {
    setFiles((current) => current.filter((file) => file !== fileToRemove));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCreatePost = async () => {
    if (!selectedGroupId || isPosting) return;
    if (postType === 'ASSIGNMENT' && !dueDate) {
      toast.error('Assignments need a due date.');
      return;
    }
    if (!postContent.trim() && files.length === 0) {
      toast.error('Add text or at least one attachment.');
      return;
    }

    setIsPosting(true);
    try {
      await LearningGroupService.createPost(selectedGroupId, {
        postType,
        content: postContent.trim() || undefined,
        dueDate: postType === 'ASSIGNMENT' ? new Date(dueDate).toISOString() : undefined,
        files,
      });
      toast.success('Post published');
      setShowPostDialog(false);
      resetPostForm();
      await loadSelectedGroup(selectedGroupId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSyncMaterials = async () => {
    if (!selectedGroupId) return;
    setIsSyncing(true);
    try {
      const result = await AiService.syncGroupMaterials(selectedGroupId);
      toast.success(`AI sync complete: ${result.indexed} indexed, ${result.skipped} skipped, ${result.failed} failed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const openComments = async (post: LearningGroupPost) => {
    if (!selectedGroupId) return;
    setCommentsPost(post);
    setCommentText('');
    try {
      setComments(await LearningGroupService.getComments(selectedGroupId, post.postId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load comments');
    }
  };

  const handleCreateComment = async () => {
    if (!selectedGroupId || !commentsPost || !commentText.trim()) return;
    try {
      const comment = await LearningGroupService.createComment(selectedGroupId, commentsPost.postId, commentText.trim());
      setComments((prev) => [...prev, comment]);
      setCommentText('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  if (isLoading || isResolvingSemester) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm text-slate-600">Loading learning groups...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Learning Groups</h1>
          <p className="mt-1 text-sm text-slate-600">
            Course spaces for materials, assignments, announcements, discussion, and AI indexing.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex gap-2">
            <Input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="Access code" className="w-36" />
            <Button variant="outline" onClick={handleJoin}>Join</Button>
          </div>
          <Button onClick={() => setShowPostDialog(true)} disabled={!selectedGroupId || !canPost} className="gap-2">
            <Plus className="h-4 w-4" />
            New post
          </Button>
          <Button variant="outline" onClick={handleSyncMaterials} disabled={!selectedGroupId || isSyncing} className="gap-2">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            Sync AI
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          {groups.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <Users className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                <p className="font-medium text-slate-900">No groups yet</p>
                <p className="mt-1 text-sm text-slate-500">Join by access code or wait for your enrolled course groups.</p>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => (
              <button
                key={group.groupId}
                onClick={() => setSelectedGroupId(group.groupId)}
                className={`w-full rounded-lg border p-4 text-left transition ${selectedGroupId === group.groupId ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{group.course.code}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{group.course.name}</p>
                  </div>
                  <Badge variant={group.myRole === 'Owner' ? 'default' : 'outline'}>{group.myRole}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{group.course.credits} credits</span>
                  <span>{group.allowStudentPosts ? 'Open posting' : 'Staff posts'}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <Card className="min-h-[680px] overflow-hidden">
          {!selectedGroup ? (
            <CardContent className="flex min-h-[680px] items-center justify-center text-center text-slate-500">
              Select a learning group to view activity.
            </CardContent>
          ) : (
            <>
              <CardHeader className="border-b bg-white">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedGroup.course.code} - {selectedGroup.course.name}</CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{details?.memberCount ?? '-'} members</span>
                      {isOwner && selectedGroup.accessCode && (
                        <button
                          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedGroup.accessCode ?? '');
                            toast.success('Access code copied');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                          {selectedGroup.accessCode}
                        </button>
                      )}
                      {isOwner && <span className="flex items-center gap-1 text-blue-600"><ShieldCheck className="h-4 w-4" />Staff controls enabled</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts" className="pl-9 sm:w-60" />
                    </div>
                    <Select value={filter} onValueChange={handleFilterChange}>
                      <SelectTrigger className="sm:w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All posts</SelectItem>
                        {POST_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Tabs value={filter} onValueChange={handleFilterChange} className="border-b px-4 pt-4">
                  <TabsList>
                    <TabsTrigger value="ALL">All</TabsTrigger>
                    <TabsTrigger value="ANNOUNCEMENT">Announcements</TabsTrigger>
                    <TabsTrigger value="MATERIAL">Materials</TabsTrigger>
                    <TabsTrigger value="ASSIGNMENT">Assignments</TabsTrigger>
                  </TabsList>
                </Tabs>

                <ScrollArea className="h-[560px]">
                  <div className="space-y-4 p-4">
                    {visiblePosts.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                        <FileText className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                        <p className="font-medium text-slate-900">No posts found</p>
                        <p className="mt-1 text-sm text-slate-500">Try another filter or publish the first material.</p>
                      </div>
                    ) : (
                      visiblePosts.map((post) => (
                        <article key={post.postId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={postTone(post.postType)}>{post.postType.toLowerCase()}</Badge>
                                {post.isPinned && <span className="flex items-center gap-1 text-xs text-amber-600"><Pin className="h-3 w-3" />Pinned</span>}
                                {post.dueDate && <span className="flex items-center gap-1 text-xs text-slate-500"><CalendarClock className="h-3 w-3" />Due {formatDate(post.dueDate)}</span>}
                              </div>
                              <p className="mt-2 text-sm text-slate-500">By {authorName(post)} · {formatDate(post.createdAt)}</p>
                            </div>
                            {isOwner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (!selectedGroupId) return;
                                  await LearningGroupService.togglePin(selectedGroupId, post.postId);
                                  await loadSelectedGroup(selectedGroupId);
                                }}
                              >
                                <Pin className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {post.content && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">{post.content}</p>}

                          {post.attachments.length > 0 && (
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              {post.attachments.map((attachment) => (
                                <a key={attachment.attachmentId} href={attachment.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 hover:bg-slate-100">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Paperclip className="h-4 w-4 shrink-0 text-blue-600" />
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-slate-800">{attachment.fileName}</p>
                                      <p className="text-xs text-slate-500">{formatFileSize(attachment.fileSize)}</p>
                                    </div>
                                  </div>
                                  <Download className="h-4 w-4 shrink-0 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between border-t pt-3">
                            <Button variant="ghost" size="sm" className="gap-2 text-slate-600" onClick={() => openComments(post)}>
                              <MessageCircle className="h-4 w-4" />
                              {post.commentCount} comment{post.commentCount === 1 ? '' : 's'}
                            </Button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create group post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={postType} onValueChange={(value) => setPostType(value as LearningGroupPostType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea value={postContent} onChange={(event) => setPostContent(event.target.value)} placeholder="Write the update, instructions, or material note..." rows={5} />
            {postType === 'ASSIGNMENT' && (
              <Input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            )}
            <div className="rounded-lg border border-dashed border-slate-200 p-4">
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => handleFileSelection(event.target.files)}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Attachments</p>
                  <p className="text-xs text-slate-500">Attach up to 5 files to this post.</p>
                </div>
                <Button variant="outline" type="button" onClick={() => fileRef.current?.click()} className="gap-2">
                  <Paperclip className="h-4 w-4" />
                  {files.length > 0 ? 'Change files' : 'Attach files'}
                </Button>
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                      <Button variant="ghost" size="icon" type="button" onClick={() => removeSelectedFile(file)} aria-label={`Remove ${file.name}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePost} disabled={isPosting} className="gap-2">
              {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(commentsPost)} onOpenChange={(open) => !open && setCommentsPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96 pr-3">
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No comments yet.</p>
              ) : comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{comment.author.firstName} {comment.author.lastName}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." />
            <Button onClick={handleCreateComment} disabled={!commentText.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
