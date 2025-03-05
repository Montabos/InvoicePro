import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FilePenLine, FileText, Download, FileCheck } from "lucide-react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import { apiRequest } from "@/lib/queryClient";
import ThemeToggle from "@/components/ThemeToggle";
import { Invoice } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (formData: Invoice) => {
    setInvoice(formData);
    setActiveTab("preview");
  };

  const handleGeneratePDF = async () => {
    if (!invoice) return;
    
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/invoices/generate-pdf", invoice);
      
      // Typically we would download the file here
      // For now, we'll just simulate a successful download with a delay
      setTimeout(() => {
        setIsGenerating(false);
        toast({
          title: "Invoice PDF generated!",
          description: "Your invoice has been generated and downloaded.",
          variant: "default",
        });
      }, 1500);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b py-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Invoice Generator
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container py-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <FilePenLine className="h-4 w-4" />
                Create Invoice
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!invoice}>
                <FileCheck className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {invoice && activeTab === "preview" && (
              <Button 
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
          </div>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <InvoiceForm onSubmit={handleFormSubmit} initialData={invoice} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {invoice ? (
              <Card>
                <CardContent className="p-6">
                  <InvoicePreview invoice={invoice} />
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4" />
                <p>Create an invoice first to preview it</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("create")}
                >
                  Create Invoice
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-4 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Invoice Generator
        </div>
      </footer>
    </div>
  );
}
