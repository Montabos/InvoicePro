import { pgTable, text, serial, integer, boolean, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define Business schema
const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  address: z.string().min(1, "Business address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Business phone is required"),
});

// Define Client schema
const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  address: z.string().min(1, "Client address is required"),
  email: z.string().email("Invalid email address"),
});

// Define Item schema
const itemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be a positive number"),
});

// Define Invoice schema
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  business: businessSchema,
  client: clientSchema,
  items: z.array(itemSchema).min(1, "At least one item is required"),
  taxRate: z.number().min(0, "Tax rate must be a positive number"),
  taxAmount: z.number(),
  subTotal: z.number(),
  total: z.number(),
  notes: z.string().optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

// For database tables (using Drizzle ORM)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: text("invoice_date").notNull(),
  dueDate: text("due_date").notNull(),
  businessName: text("business_name").notNull(),
  businessAddress: text("business_address").notNull(),
  businessEmail: text("business_email").notNull(),
  businessPhone: text("business_phone").notNull(),
  clientName: text("client_name").notNull(),
  clientAddress: text("client_address").notNull(),
  clientEmail: text("client_email").notNull(),
  taxRate: numeric("tax_rate").notNull(),
  taxAmount: numeric("tax_amount").notNull(),
  subTotal: numeric("sub_total").notNull(),
  total: numeric("total").notNull(),
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
});

// Define items table related to invoices
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull(),
  price: numeric("price").notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems);

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type DbInvoice = typeof invoices.$inferSelect;
