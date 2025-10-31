import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem } from '@/types';
import { apiClient } from '@/lib/api';
import { Copy, Search, Filter, FileText, Tag, Plus, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';

type PlaceholderEntry = {
  token: string;
  key: string;
  label: string;
  value: string;
};

export default function UserDashboard() {
  const [templates, setTemplates] = useState<DocumentItem[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentItem | null>(null);
  const [placeholders, setPlaceholders] = useState<PlaceholderEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentItem | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<DocumentItem | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    doc_name: '',
    query_type: '',
    specific_query_heading: '',
    template_text: '',
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, selectedType, templates]);

  useEffect(() => {
    if (filteredTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(filteredTemplates[0]);
    }
  }, [filteredTemplates]);

  useEffect(() => {
    if (selectedTemplate?.template_text) {
      const extracted = extractPlaceholdersFromText(selectedTemplate.template_text);
      setPlaceholders(extracted);
    } else {
      setPlaceholders([]);
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.getTemplates() as DocumentItem[];
      setTemplates(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.doc_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.template_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.specific_query_heading?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((t) => t.query_type === selectedType);
    }

    setFilteredTemplates(filtered);
  };

  const handleCopyTemplate = async (templateText: string) => {
    try {
      await navigator.clipboard.writeText(templateText);
      if (selectedTemplate) {
        await apiClient.copyTemplate(selectedTemplate.id);
      }
      toast({
        title: 'Template Copied!',
        description: 'Template has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const replacePlaceholders = (text: string): string => {
    if (!text || placeholders.length === 0) return text;
    let result = text;
    placeholders.forEach((ph) => {
      const escapedToken = ph.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedToken, 'gi');
      result = result.replace(regex, ph.value || '');
    });
    return result;
  };

  const extractPlaceholdersFromText = (text: string): PlaceholderEntry[] => {
    if (!text) return [];

    const results: PlaceholderEntry[] = [];
    const seenKeys = new Set<string>();

    const braceRegex = /\{([A-Za-z0-9_\- ]+?)\}/g;
    let m;
    while ((m = braceRegex.exec(text)) !== null) {
      const raw = m[0];
      const inner = m[1].trim();
      const key = normalizeKey(inner);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          token: raw,
          key,
          label: inner,
          value: '',
        });
      }
    }

    const squareRegex = /\[([^\]]+?)\]/g;
    while ((m = squareRegex.exec(text)) !== null) {
      const raw = m[0];
      const inner = m[1].trim();
      const key = normalizeKey(inner);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          token: raw,
          key,
          label: inner,
          value: '',
        });
      }
    }

    return results;
  };

  const normalizeKey = (s: string) => s.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');

  const handleSaveTemplate = async () => {
    if (!newTemplate.doc_name || !newTemplate.query_type || !newTemplate.template_text) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiClient.createTemplate(newTemplate);
      toast({
        title: 'Template Created',
        description: 'New template has been added successfully.',
      });
      setIsAddDialogOpen(false);
      handleClearTemplate();
      fetchTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create template.',
        variant: 'destructive',
      });
    }
  };

  const handleClearTemplate = () => {
    setNewTemplate({
      doc_name: '',
      query_type: '',
      specific_query_heading: '',
      template_text: '',
    });
  };

  const handleEditTemplate = (template: DocumentItem) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    
    if (!editingTemplate.doc_name || !editingTemplate.query_type || !editingTemplate.template_text) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiClient.updateTemplate(editingTemplate.id, {
        doc_name: editingTemplate.doc_name,
        query_type: editingTemplate.query_type,
        specific_query_heading: editingTemplate.specific_query_heading,
        template_text: editingTemplate.template_text,
      });
      toast({
        title: 'Template Updated',
        description: 'Template has been updated successfully.',
      });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;

    try {
      await apiClient.deleteTemplate(deletingTemplate.id);
      toast({
        title: 'Template Deleted',
        description: 'Template has been deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingTemplate(null);
      if (selectedTemplate?.id === deletingTemplate.id) {
        setSelectedTemplate(null);
      }
      fetchTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template.',
        variant: 'destructive',
      });
    }
  };

  const queryTypes = ['all', ...Array.from(new Set(templates.map((t) => t.query_type)))];
  const processedTemplateText = selectedTemplate ? replacePlaceholders(selectedTemplate.template_text) : '';

  const handlePlaceholderChange = (index: number, newValue: string) => {
    setPlaceholders((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], value: newValue };
      return copy;
    });
  };

  // Preview helpers (faded inline tokens + click to focus corresponding input)
  const placeholderTokenRegex = /(\{[^}]+}|\[[^\]]+\])/g;

  const findPlaceholderEntryByToken = (token: string): PlaceholderEntry | undefined => {
    const exact = placeholders.find((p) => p.token.toLowerCase() === token.toLowerCase());
    if (exact) return exact;
    const inner = token.replace(/^[{[]|[}\]]$/g, '').trim();
    const key = normalizeKey(inner);
    return placeholders.find((p) => p.key === key);
  };

  const focusPlaceholderInput = (token: string) => {
    const entry = findPlaceholderEntryByToken(token);
    if (!entry) return;
    const el = document.getElementById(`ph-input-${entry.key}`) as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.select();
    }
  };

  const renderPreviewJSX = (text: string) => {
    if (!text) return null;

    const parts = text.split(placeholderTokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      if (placeholderTokenRegex.test(part)) {
        const entry = findPlaceholderEntryByToken(part);
        const display = entry ? (entry.value || part) : part;
        return (
          <span
            key={`ph-${idx}-${part}`}
            onClick={() => focusPlaceholderInput(part)}
            role="button"
            aria-label={`Placeholder ${part}`}
            className="inline-block px-1 py-0.5 rounded-md ml-0 mr-0 align-baseline text-sm cursor-pointer"
            style={{
              opacity: 0.6,
              backgroundColor: 'rgba(250, 204, 21, 0.08)',
              borderRadius: 6,
              paddingLeft: 6,
              paddingRight: 6,
              marginRight: 4,
            }}
            title={entry ? `${entry.label} — click to edit` : 'Placeholder'}
          >
            {display}
          </span>
        );
      }

      return <span key={`txt-${idx}`}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Query Templates</h1>
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {queryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={30}>
            <ScrollArea className="h-full">
              <div className="p-4">
                {filteredTemplates.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No templates found</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {filteredTemplates.map((template) => (
  <Card
    key={template.id}
    onClick={() => setSelectedTemplate(template)}
    className={`group relative p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
      selectedTemplate?.id === template.id
        ? 'border-primary border-2 bg-primary/5 shadow-md'
        : 'border-border hover:border-primary/50'
    }`}
  >
    {/* Hover-reveal admin controls — match bg to card color */}
    {(user?.role === 'admin' || user?.role === 'superadmin') && (
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1 bg-card rounded-md p-0.5 ">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTemplate(template);
            }}
            aria-label="Edit template"
            title="Edit template"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingTemplate(template);
              setIsDeleteDialogOpen(true);
            }}
            aria-label="Delete template"
            title="Delete template"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )}

    {/* Card content */}
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            selectedTemplate?.id === template.id ? 'bg-primary/20' : 'bg-accent'
          }`}
        >
          <FileText
            className={`h-5 w-5 ${
              selectedTemplate?.id === template.id
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
            {template.doc_name}
          </h3>
          {template.specific_query_heading && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {template.specific_query_heading}
            </p>
          )}
        </div>
      </div>

      {/* Badge below */}
      <div className="mt-auto">
        <Badge
          variant="secondary"
          className="text-xs flex items-start gap-1 px-2 py-0.5 rounded-md leading-tight"
        >
          <Tag className="h-3 w-3 mt-[1px] flex-shrink-0" />
          <span className="leading-tight break-words">
            {template.query_type}
          </span>
        </Badge>
      </div>
    </div>
  </Card>
))}



                  </div>
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={35} minSize={40}>
            <ScrollArea className="h-full">
              {selectedTemplate ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedTemplate.doc_name}</h2>
                    {selectedTemplate.specific_query_heading && (
                      <p className="text-muted-foreground mb-3">{selectedTemplate.specific_query_heading}</p>
                    )}
                    <Badge
                      variant="secondary"
                      className="text-xs flex items-start gap-1 px-2 py-0.5 rounded-md leading-tight"
                    >
                      <Tag className="h-3 w-3 mt-[1px] flex-shrink-0" />
                      <span className="leading-tight break-words">{selectedTemplate.query_type}</span>
                    </Badge>
                  </div>

                  <Card className="p-4 bg-accent/30">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span>Replace Placeholders</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        (Supports {'{name}'} and {'[Name]'} tokens)
                      </span>
                    </h3>

                    {placeholders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No placeholders detected in this template.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {placeholders.map((ph, idx) => (
                          <div key={ph.key}>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              {ph.label} <span className="text-xxs text-muted-foreground">({ph.token})</span>
                            </label>
                            <Input
                              id={`ph-input-${ph.key}`}
                              placeholder={`Enter ${ph.label}`}
                              value={ph.value}
                              onChange={(e) => handlePlaceholderChange(idx, e.target.value)}
                              className="h-9"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Template Preview</h3>
                      <Button
                        onClick={() => handleCopyTemplate(processedTemplateText)}
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Template
                      </Button>
                    </div>
                    <Card className="p-4 bg-card/50">
                      <div
                        className="text-sm font-mono text-muted-foreground"
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {renderPreviewJSX(selectedTemplate?.template_text || '')}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-6">
                  <p className="text-muted-foreground">Select a template to preview</p>
                </div>
              )}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <button
            onClick={() => setIsAddDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle>Add New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Doc Name *</label>
              <Input
                placeholder="Enter document name"
                value={newTemplate.doc_name}
                onChange={(e) => setNewTemplate({ ...newTemplate, doc_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Query Type *</label>
              <Input
                placeholder="e.g., Press Release, Email Template"
                value={newTemplate.query_type}
                onChange={(e) => setNewTemplate({ ...newTemplate, query_type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Specific Query Heading (Optional)</label>
              <Input
                placeholder="e.g., Technology, Customer Service"
                value={newTemplate.specific_query_heading}
                onChange={(e) => setNewTemplate({ ...newTemplate, specific_query_heading: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Template *</label>
              <Textarea
                placeholder="Enter your template text here..."
                value={newTemplate.template_text}
                onChange={(e) => setNewTemplate({ ...newTemplate, template_text: e.target.value })}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClearTemplate}>
              Clear
            </Button>
            <Button onClick={handleSaveTemplate}>
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <button
            onClick={() => setIsEditDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Doc Name *</label>
                <Input
                  placeholder="Enter document name"
                  value={editingTemplate.doc_name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, doc_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Query Type *</label>
                <Input
                  placeholder="e.g., Press Release, Email Template"
                  value={editingTemplate.query_type}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, query_type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specific Query Heading (Optional)</label>
                <Input
                  placeholder="e.g., Technology, Customer Service"
                  value={editingTemplate.specific_query_heading || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, specific_query_heading: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Template *</label>
                <Textarea
                  placeholder="Enter your template text here..."
                  value={editingTemplate.template_text}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, template_text: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Update Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingTemplate?.doc_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
