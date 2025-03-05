import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FilePenLine, FileText, Download, FileCheck, Palette, ChevronsRight, ChevronsLeft, Plus, Trash2 } from "lucide-react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import ThemeToggle from "@/components/ThemeToggle";
import { Invoice } from "@shared/schema";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Color themes
const colorThemes = [
  { primary: "bg-blue-600", accent: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", name: "Blue" },
  { primary: "bg-purple-600", accent: "bg-purple-100", text: "text-purple-600", border: "border-purple-200", name: "Purple" },
  { primary: "bg-emerald-600", accent: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200", name: "Emerald" },
  { primary: "bg-amber-600", accent: "bg-amber-100", text: "text-amber-600", border: "border-amber-200", name: "Amber" },
  { primary: "bg-rose-600", accent: "bg-rose-100", text: "text-rose-600", border: "border-rose-200", name: "Rose" },
];

export default function Home() {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const theme = colorThemes[selectedTheme];

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleFormSubmit = (formData: Invoice) => {
    setInvoice(formData);
    setShowPreview(true);
  };

  const handleGeneratePDF = async () => {
    if (!invoice || !invoicePreviewRef.current) return;

    setIsGeneratingPdf(true);
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

      setIsGeneratingPdf(false);
      setShowSuccess(true);
      triggerConfetti();

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      toast({
        title: "Invoice PDF generated!",
        description: "Your invoice has been downloaded to your computer.",
        variant: "default",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      setIsGeneratingPdf(false);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Invoice Generator
          </h1>
          <div className="flex gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="relative"
              >
                <Palette className="h-4 w-4 mr-2" />
                Theme
                {showThemePicker && (
                  <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 w-64">
                    <h3 className="text-sm font-medium mb-2">Select a color theme</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {colorThemes.map((theme, index) => (
                        <button
                          key={index}
                          className={`${theme.primary} h-8 w-8 rounded-full transition-transform hover:scale-110 ${selectedTheme === index ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTheme(index);
                          }}
                          aria-label={`Select ${theme.name} theme`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* Form Section */}
          {!showPreview ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Create Your Invoice</h2>
              </div>

              <Card className={`border-l-4 ${theme.border} shadow-sm hover:shadow transition-shadow duration-300`}>
                <CardContent className="p-6">
                  <InvoiceForm onSubmit={handleFormSubmit} initialData={invoice} />

                  <div className="flex justify-end space-x-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => invoice && setShowPreview(true)}
                      disabled={!invoice}
                      className="group"
                    >
                      Preview Invoice
                      <ChevronsRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowPreview(false)} className="group">
                  <ChevronsLeft className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Back to Edit
                </Button>

                <div className="relative">
                  {isGeneratingPdf ? (
                    <Button disabled className="relative">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating PDF...
                    </Button>
                  ) : showSuccess ? (
                    <Button variant="outline" className={`${theme.accent} ${theme.text}`}>
                      <FileCheck className="h-4 w-4 mr-2" />
                      PDF Ready!
                    </Button>
                  ) : (
                    <Button 
                      className={`${theme.primary} hover:brightness-110 transition-all duration-300`} 
                      onClick={handleGeneratePDF}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                  )}
                </div>
              </div>

              <Card className={`border-l-4 ${theme.border} shadow-sm`}>
                <CardContent className="p-6">
                  <div ref={invoicePreviewRef}>
                    <InvoicePreview invoice={invoice!} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Invoice Generator - Create professional invoices in seconds
        </footer>
      </div>
    </div>
  );
}