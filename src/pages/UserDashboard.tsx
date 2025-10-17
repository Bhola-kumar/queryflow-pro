import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem } from '@/types';
import { apiClient } from '@/lib/api';
import { Copy, Search, FileText, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UserDashboard() {
  const [templates, setTemplates] = useState<DocumentItem[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, selectedType, templates]);

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.getTemplates() as DocumentItem[];
      setTemplates(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please ensure your backend is running.',
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

  const handleCopyTemplate = async (template: DocumentItem) => {
    try {
      await navigator.clipboard.writeText(template.template_text);
      await apiClient.copyTemplate(template.id);
      toast({
        title: 'Template Copied!',
        description: `"${template.doc_name}" has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const queryTypes = ['all', ...Array.from(new Set(templates.map((t) => t.query_type)))];

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
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Query Templates</h1>
          <p className="text-muted-foreground">
            Browse and copy templates for your database queries
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center bg-card/50">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground">
              {templates.length === 0
                ? 'No templates available yet. Contact your admin to add templates.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="p-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{template.doc_name}</h3>
                    {template.specific_query_heading && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {template.specific_query_heading}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {template.query_type}
                    </Badge>
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                  <code className="text-xs text-muted-foreground font-mono break-all">
                    {template.template_text}
                  </code>
                </div>

                <Button
                  onClick={() => handleCopyTemplate(template)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Template
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
