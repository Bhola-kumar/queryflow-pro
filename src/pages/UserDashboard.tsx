import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem } from '@/types';
import { apiClient } from '@/lib/api';
import { Copy, Search, Filter, FileText, Tag } from 'lucide-react';
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
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                          selectedTemplate?.id === template.id
                            ? 'border-primary border-2 bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-col gap-3 h-full">
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              selectedTemplate?.id === template.id
                                ? 'bg-primary/20'
                                : 'bg-accent'
                            }`}>
                              <FileText className={`h-5 w-5 ${
                                selectedTemplate?.id === template.id
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`} />
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
                          
                          <div className="flex items-center gap-2 mt-auto">
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {template.query_type}
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

          <ResizablePanel defaultSize={50} minSize={40}>
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
