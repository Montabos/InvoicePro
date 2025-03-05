import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { invoiceSchema, Invoice } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for getting all invoices
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // API route for getting a single invoice
  app.get("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // API route for creating a new invoice
  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const validatedData = invoiceSchema.parse(req.body);
      const savedInvoice = await storage.createInvoice(validatedData);
      res.status(201).json(savedInvoice);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // API route for PDF generation
  app.post("/api/invoices/generate-pdf", async (req: Request, res: Response) => {
    try {
      const validatedData = invoiceSchema.parse(req.body);
      
      // In a real implementation, we would generate a PDF here
      // For the MVP, we just return a success message
      
      // Mock a delay to simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.status(200).json({ 
        message: "PDF generated successfully",
        // In a real implementation, we might return a URL to download the PDF
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
