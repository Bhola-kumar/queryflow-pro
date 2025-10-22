import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem } from '@/types';
import { apiClient } from '@/lib/api';
import { Copy, Search, Filter, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
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

interface GroupedTemplates {
  [key: string]: {
    [subheading: string]: DocumentItem[];
  };
}

export default function UserDashboard() {
  const [templates, setTemplates] = useState<DocumentItem[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [placeholders, setPlaceholders] = useState<{ [key: string]: string }>({
    ticket_id: '',
    sender_name: '',
    receiver_name: '',
  });
  const { toast } = useToast();

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

  const groupTemplates = (templates: DocumentItem[]): GroupedTemplates => {
    const grouped: GroupedTemplates = {};
    
    templates.forEach((template) => {
      const type = template.query_type;
      const subheading = template.specific_query_heading || 'General';
      
      if (!grouped[type]) {
        grouped[type] = {};
      }
      
      if (!grouped[type][subheading]) {
        grouped[type][subheading] = [];
      }
      
      grouped[type][subheading].push(template);
    });
    
    return grouped;
  };

  const handleCopyTemplate = async (templateText: string) => {
    try {
      await navigator.clipboard.writeText(templateText);
      if (selectedTemplate) {
        await apiClient.copyTemplate(selectedTemplate.id);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    let result = text;
    Object.entries(placeholders).forEach(([key, value]) => {
      if (value) {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        result = result.replace(regex, value);
      }
    });
    return result;
  };

  const queryTypes = ['all', ...Array.from(new Set(templates.map((t) => t.query_type)))];
  const groupedTemplates = groupTemplates(filteredTemplates);
  const processedTemplateText = selectedTemplate ? replacePlaceholders(selectedTemplate.template_text) : '';

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
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 via-background to-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Query Templates
              </h1>
              <p className="text-sm text-muted-foreground">Browse and customize your templates</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px] bg-background/50 backdrop-blur-sm border-primary/20">
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
          <ResizablePanel defaultSize={50} minSize={30}>
            <ScrollArea className="h-full bg-gradient-to-b from-background to-accent/10">
              <div className="p-4 space-y-4">
                {Object.keys(groupedTemplates).length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg">No templates found</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">Try adjusting your search or filters</p>
                  </Card>
                ) : (
                  Object.entries(groupedTemplates).map(([type, subgroups]) => (
                    <Card 
                      key={type} 
                      className="p-5 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm group"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground">{type}</h3>
                          <p className="text-xs text-muted-foreground">
                            {Object.values(subgroups).flat().length} template{Object.values(subgroups).flat().length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                          {Object.values(subgroups).flat().length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(subgroups).map(([subheading, items]) => (
                          <div key={subheading} className="space-y-2">
                            {items.length === 1 && subheading === 'General' ? (
                              <button
                                onClick={() => setSelectedTemplate(items[0])}
                                className={`w-full text-left p-3 rounded-lg transition-all duration-200 group/item ${
                                  selectedTemplate?.id === items[0].id
                                    ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-2 border-primary shadow-lg scale-[1.02]'
                                    : 'bg-accent/40 hover:bg-accent/60 border-2 border-transparent hover:border-primary/20 hover:scale-[1.01]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className={`h-4 w-4 ${selectedTemplate?.id === items[0].id ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <span className="font-semibold">{items[0].doc_name}</span>
                                </div>
                              </button>
                            ) : (
                              <div className="border-2 border-border/50 rounded-lg overflow-hidden bg-background/50 hover:border-primary/30 transition-all">
                                <div className="bg-gradient-to-r from-accent/60 to-accent/30 px-4 py-2.5 font-semibold text-sm border-b-2 border-border/50 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  {subheading}
                                </div>
                                <div className="p-2 space-y-1">
                                  {items.map((template) => (
                                    <button
                                      key={template.id}
                                      onClick={() => setSelectedTemplate(template)}
                                      className={`w-full text-left p-2.5 px-3 rounded-md transition-all duration-200 text-sm ${
                                        selectedTemplate?.id === template.id
                                          ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-l-4 border-primary shadow-md scale-[1.01]'
                                          : 'bg-background/70 hover:bg-accent/50 border-l-4 border-transparent hover:border-primary/30'
                                      }`}
                                    >
                                      {template.doc_name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={40}>
            <ScrollArea className="h-full bg-gradient-to-b from-background via-primary/5 to-background">
              {selectedTemplate ? (
                <div className="p-6 space-y-6 animate-fade-in">
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border-2 border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {selectedTemplate.doc_name}
                        </h2>
                        {selectedTemplate.specific_query_heading && (
                          <p className="text-muted-foreground mb-3 text-sm">{selectedTemplate.specific_query_heading}</p>
                        )}
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          {selectedTemplate.query_type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Card className="p-5 bg-gradient-to-br from-accent/40 via-accent/20 to-background border-2 border-primary/10 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg">Customize Placeholders</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px]">
                        {'{placeholder_name}'}
                      </span>
                      <span>These values will update in real-time below</span>
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          Ticket ID
                        </label>
                        <Input
                          placeholder="e.g., T12345"
                          value={placeholders.ticket_id}
                          onChange={(e) => setPlaceholders({ ...placeholders, ticket_id: e.target.value })}
                          className="h-10 border-2 border-primary/20 focus:border-primary/50 bg-background/80 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          Sender Name
                        </label>
                        <Input
                          placeholder="e.g., John Doe"
                          value={placeholders.sender_name}
                          onChange={(e) => setPlaceholders({ ...placeholders, sender_name: e.target.value })}
                          className="h-10 border-2 border-primary/20 focus:border-primary/50 bg-background/80 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          Receiver Name
                        </label>
                        <Input
                          placeholder="e.g., Jane Smith"
                          value={placeholders.receiver_name}
                          onChange={(e) => setPlaceholders({ ...placeholders, receiver_name: e.target.value })}
                          className="h-10 border-2 border-primary/20 focus:border-primary/50 bg-background/80 transition-all"
                        />
                      </div>
                    </div>
                  </Card>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Template Preview</h3>
                      </div>
                      <Button
                        onClick={() => handleCopyTemplate(processedTemplateText)}
                        size="default"
                        className={`gap-2 transition-all ${
                          copied 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                        }`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Template
                          </>
                        )}
                      </Button>
                    </div>
                    <Card className="p-5 bg-gradient-to-br from-card to-card/50 border-2 border-border shadow-xl">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-foreground/90 leading-relaxed">
                        {processedTemplateText}
                      </pre>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center space-y-4">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
                      <FileText className="h-10 w-10 text-primary/50" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-muted-foreground mb-2">No Template Selected</p>
                      <p className="text-sm text-muted-foreground/70">Choose a template from the left to preview</p>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Layout>
  );
}
