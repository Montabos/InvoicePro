import { useState, useRef } from "react";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = (formData: Invoice) => {
    setInvoice(formData);
    setActiveTab("preview");
  };

  const handleGeneratePDF = async () => {
    if (!invoice || !invoicePreviewRef.current) return;

    setIsGenerating(true);
    try {
      // Generate PDF using html2canvas and jsPDF
      const element = invoicePreviewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      // Determine page size based on canvas dimensions (portrait or landscape)
      const orientation = canvas.width > canvas.height ? 'l' : 'p';
      const pdf = new jsPDF(orientation, 'pt', [canvas.width, canvas.height]);

      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

      // Generate filename based on invoice number and date
      const filename = `invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

      // Save the PDF
      pdf.save(filename);

      setIsGenerating(false);
      toast({
        title: "Invoice PDF generated!",
        description: "Your invoice has been downloaded to your computer.",
        variant: "default",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
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
                  <div ref={invoicePreviewRef}>
                    <InvoicePreview invoice={invoice} />
                  </div>
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