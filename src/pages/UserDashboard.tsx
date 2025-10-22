import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem } from '@/types';
import { apiClient } from '@/lib/api';
import { Copy, Search, Filter, ChevronRight, ChevronDown } from 'lucide-react';
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
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
        <div className="p-6 border-b border-border">
          <h1 className="text-3xl font-bold mb-4">Query Templates</h1>
          
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
          <ResizablePanel defaultSize={50} minSize={30}>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {Object.keys(groupedTemplates).length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No templates found</p>
                  </Card>
                ) : (
                  Object.entries(groupedTemplates).map(([type, subgroups]) => (
                    <Card key={type} className="p-4 hover:shadow-md transition-shadow">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {type}
                          <Badge variant="secondary" className="ml-auto">
                            {Object.values(subgroups).flat().length}
                          </Badge>
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(subgroups).map(([subheading, items]) => (
                          <div key={subheading} className="space-y-1">
                            {items.length === 1 && subheading === 'General' ? (
                              <button
                                onClick={() => setSelectedTemplate(items[0])}
                                className={`w-full text-left p-3 rounded-md transition-all ${
                                  selectedTemplate?.id === items[0].id
                                    ? 'bg-primary/20 text-primary border-l-4 border-primary shadow-sm'
                                    : 'bg-accent/30 hover:bg-accent/50'
                                }`}
                              >
                                <span className="font-medium">{items[0].doc_name}</span>
                              </button>
                            ) : (
                              <div className="border border-border rounded-md overflow-hidden">
                                <div className="bg-accent/20 px-3 py-2 font-medium text-sm border-b border-border">
                                  {subheading}
                                </div>
                                <div className="p-2 space-y-1">
                                  {items.map((template) => (
                                    <button
                                      key={template.id}
                                      onClick={() => setSelectedTemplate(template)}
                                      className={`w-full text-left p-2 px-3 rounded-md transition-all text-sm ${
                                        selectedTemplate?.id === template.id
                                          ? 'bg-primary/20 text-primary border-l-4 border-primary shadow-sm'
                                          : 'bg-background hover:bg-accent/30'
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

          <ResizablePanel defaultSize={65} minSize={40}>
            <ScrollArea className="h-full">
              {selectedTemplate ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedTemplate.doc_name}</h2>
                    {selectedTemplate.specific_query_heading && (
                      <p className="text-muted-foreground mb-3">{selectedTemplate.specific_query_heading}</p>
                    )}
                    <Badge variant="secondary">{selectedTemplate.query_type}</Badge>
                  </div>

                  <Card className="p-4 bg-accent/30">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span>Replace Placeholders</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        (Use {'{placeholder_name}'} in template)
                      </span>
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Ticket ID</label>
                        <Input
                          placeholder="e.g., T12345"
                          value={placeholders.ticket_id}
                          onChange={(e) => setPlaceholders({ ...placeholders, ticket_id: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Sender Name</label>
                        <Input
                          placeholder="e.g., John Doe"
                          value={placeholders.sender_name}
                          onChange={(e) => setPlaceholders({ ...placeholders, sender_name: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Receiver Name</label>
                        <Input
                          placeholder="e.g., Jane Smith"
                          value={placeholders.receiver_name}
                          onChange={(e) => setPlaceholders({ ...placeholders, receiver_name: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>
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
                      <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                        {processedTemplateText}
                      </pre>
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
    </Layout>
  );
}
