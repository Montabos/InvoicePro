import { users, type User, type InsertUser, Invoice } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Invoice operations
  createInvoice(invoice: Invoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private invoices: Map<number, Invoice>;
  private userCurrentId: number;
  private invoiceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
    this.userCurrentId = 1;
    this.invoiceCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createInvoice(invoice: Invoice): Promise<Invoice> {
    const id = this.invoiceCurrentId++;
    
    // Store the invoice with an id
    const storedInvoice = { 
      ...invoice, 
      id 
    } as Invoice & { id: number };
    
    this.invoices.set(id, storedInvoice);
    return storedInvoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }
}

export const storage = new MemStorage();
