import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Invoice, invoiceSchema } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import BusinessDetailsForm from "./BusinessDetailsForm";
import ClientDetailsForm from "./ClientDetailsForm";
import ItemsList from "./ItemsList";
import { useState, useEffect } from "react";

interface InvoiceFormProps {
  onSubmit: (data: Invoice) => void;
  initialData: Invoice | null;
}

export default function InvoiceForm({ onSubmit, initialData }: InvoiceFormProps) {
  const [subTotal, setSubTotal] = useState(0);
  
  const defaultValues: Invoice = initialData || {
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),
    business: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    client: {
      name: "",
      address: "",
      email: "",
    },
    items: [
      {
        description: "",
        quantity: 1,
        price: 0,
      },
    ],
    taxRate: 0,
    taxAmount: 0,
    subTotal: 0,
    total: 0,
    notes: "",
  };

  const form = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues,
  });

  // Watch for changes in items to calculate subtotal
  const items = form.watch("items");
  const taxRate = form.watch("taxRate");

  useEffect(() => {
    const calculatedSubTotal = items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    
    const taxAmount = (calculatedSubTotal * taxRate) / 100;
    const total = calculatedSubTotal + taxAmount;
    
    setSubTotal(calculatedSubTotal);
    form.setValue("subTotal", calculatedSubTotal);
    form.setValue("taxAmount", taxAmount);
    form.setValue("total", total);
  }, [items, taxRate, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tax & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        
        <BusinessDetailsForm control={form.control} />
        
        <ClientDetailsForm control={form.control} />
        
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemsList 
              control={form.control}
              register={form.register} 
              errors={form.formState.errors}
              setValue={form.setValue}
              getValues={form.getValues}
              watch={form.watch}
            />
            
            <Separator className="my-4" />
            
            <div className="space-y-2 text-right">
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-medium">
                <span>Tax ({form.watch("taxRate")}%):</span>
                <span>${form.watch("taxAmount").toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${form.watch("total").toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Preview Invoice
          </Button>
        </div>
      </form>
    </Form>
  );
}
