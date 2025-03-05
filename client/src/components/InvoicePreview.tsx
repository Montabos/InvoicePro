import { Invoice } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InvoicePreviewProps {
  invoice: Invoice;
}

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="print:p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-sm rounded-lg overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">{invoice.business.name}</h1>
            <address className="not-italic mt-2 text-muted-foreground whitespace-pre-line">
              {invoice.business.address}
            </address>
            <div className="mt-2 text-sm">
              <p>{invoice.business.email}</p>
              <p>{invoice.business.phone}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">INVOICE</h2>
            <p className="mt-1 text-sm text-muted-foreground">#{invoice.invoiceNumber}</p>
            <div className="mt-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-medium">Date:</span>
                <span>{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-medium">Due Date:</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-primary rounded-full my-6"></div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">Bill To:</h3>
            <div className="text-sm">
              <p className="font-semibold text-lg">{invoice.client.name}</p>
              <address className="not-italic mt-1 text-muted-foreground whitespace-pre-line">
                {invoice.client.address}
              </address>
              <p className="mt-1">{invoice.client.email}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-8">
          <Table>
            <TableHeader className="bg-accent">
              <TableRow>
                <TableHead className="w-[60%] text-accent-foreground">Description</TableHead>
                <TableHead className="text-right text-accent-foreground">Qty</TableHead>
                <TableHead className="text-right text-accent-foreground">Price</TableHead>
                <TableHead className="text-right text-accent-foreground">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index} className="border-b">
                  <TableCell className="align-top font-medium">{item.description}</TableCell>
                  <TableCell className="text-right align-top">{item.quantity}</TableCell>
                  <TableCell className="text-right align-top">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right align-top">${(item.quantity * item.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <Card className="w-64">
            <CardContent className="p-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${invoice.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg text-primary">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 p-4 bg-accent rounded-lg">
            <h3 className="font-semibold mb-2 text-accent-foreground">Notes:</h3>
            <p className="text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full">
            Thank you for your business!
          </div>
        </div>
      </div>
    </div>
  );
}