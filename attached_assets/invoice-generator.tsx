"use client"

import { useState, useRef } from "react"
import ReactToPrint from "react-to-print"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, FileDown, Eye, Palette, ChevronsRight, ChevronsLeft, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
// Fix the confetti import
import confettiFunc from "canvas-confetti"

const colorThemes = [
  { primary: "bg-blue-600", accent: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", name: "Blue" },
  {
    primary: "bg-purple-600",
    accent: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
    name: "Purple",
  },
  {
    primary: "bg-emerald-600",
    accent: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
    name: "Emerald",
  },
  {
    primary: "bg-amber-600",
    accent: "bg-amber-100",
    text: "text-amber-600",
    border: "border-amber-200",
    name: "Amber",
  },
  { primary: "bg-rose-600", accent: "bg-rose-100", text: "text-rose-600", border: "border-rose-200", name: "Rose" },
]

export default function InvoiceGenerator() {
  const [showPreview, setShowPreview] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(0)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const invoiceRef = useRef(null)

  const theme = colorThemes[selectedTheme]

  const [invoice, setInvoice] = useState({
    invoiceNumber: "",
    date: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
    yourDetails: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    clientDetails: {
      name: "",
      address: "",
      email: "",
    },
    items: [{ description: "", quantity: 1, price: 0 }],
    notes: "",
    taxRate: 0,
  })

  const triggerConfetti = () => {
    confettiFunc({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const handlePrintClick = () => {
    setIsGeneratingPdf(true)
    setTimeout(() => {
      setIsGeneratingPdf(false)
      setShowSuccess(true)
      triggerConfetti()
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1500)
  }

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: "", quantity: 1, price: 0 }],
    })
  }

  const removeItem = (index) => {
    const newItems = [...invoice.items]
    newItems.splice(index, 1)
    setInvoice({
      ...invoice,
      items: newItems,
    })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...invoice.items]
    newItems[index][field] = field === "quantity" || field === "price" ? Number.parseFloat(value) || 0 : value
    setInvoice({
      ...invoice,
      items: newItems,
    })
  }

  const updateInvoice = (section, field, value) => {
    if (section) {
      setInvoice({
        ...invoice,
        [section]: {
          ...invoice[section],
          [field]: value,
        },
      })
    } else {
      setInvoice({
        ...invoice,
        [field]: value,
      })
    }
  }

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (invoice.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  // Create a print button component to use with ReactToPrint
  const PrintButton = () => (
    <Button className={`${theme.primary} hover:brightness-110 transition-all duration-300`} onClick={handlePrintClick}>
      <FileDown className="h-4 w-4 mr-2" /> Download PDF
    </Button>
  )

  return (
    <div className="space-y-8">
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
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="relative"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Theme
                  {showThemePicker && (
                    <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-lg shadow-lg z-10 w-64">
                      <h3 className="text-sm font-medium mb-2">Select a color theme</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {colorThemes.map((theme, index) => (
                          <button
                            key={index}
                            className={`${theme.primary} h-8 w-8 rounded-full transition-transform hover:scale-110 ${selectedTheme === index ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTheme(index)
                            }}
                            aria-label={`Select ${theme.name} theme`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            <Card className={`border-l-4 ${theme.border} shadow-sm hover:shadow transition-shadow duration-300`}>
              <CardContent className="pt-6">
                <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>Invoice Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoice.invoiceNumber}
                      onChange={(e) => updateInvoice(null, "invoiceNumber", e.target.value)}
                      placeholder="INV-001"
                      className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoice.date}
                      onChange={(e) => updateInvoice(null, "date", e.target.value)}
                      className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => updateInvoice(null, "dueDate", e.target.value)}
                      className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border shadow-sm hover:shadow transition-shadow duration-300">
                <CardContent className="pt-6">
                  <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>Your Details</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="yourName">Name/Business Name</Label>
                      <Input
                        id="yourName"
                        value={invoice.yourDetails.name}
                        onChange={(e) => updateInvoice("yourDetails", "name", e.target.value)}
                        placeholder="Your Business Name"
                        className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yourAddress">Address</Label>
                      <Textarea
                        id="yourAddress"
                        value={invoice.yourDetails.address}
                        onChange={(e) => updateInvoice("yourDetails", "address", e.target.value)}
                        placeholder="Your Address"
                        rows={3}
                        className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yourEmail">Email</Label>
                      <Input
                        id="yourEmail"
                        type="email"
                        value={invoice.yourDetails.email}
                        onChange={(e) => updateInvoice("yourDetails", "email", e.target.value)}
                        placeholder="your@email.com"
                        className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yourPhone">Phone</Label>
                      <Input
                        id="yourPhone"
                        value={invoice.yourDetails.phone}
                        onChange={(e) => updateInvoice("yourDetails", "phone", e.target.value)}
                        placeholder="Your Phone Number"
                        className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow transition-shadow duration-300">
                <CardContent className="pt-6">
                  <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>Client Details</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={invoice.clientDetails.name}
                        onChange={(e) => updateInvoice("clientDetails", "name", e.target.value)}
                        placeholder="Client Name"
                        className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientAddress">Address</Label>
                      <Textarea
                        id="clientAddress"
                        value={invoice.clientDetails.address}
                        onChange={(e) => updateInvoice("clientDetails", "address", e.target.value)}
                        placeholder="Client Address"
                        rows={3}
                        className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={invoice.clientDetails.email}
                        onChange={(e) => updateInvoice("clientDetails", "email", e.target.value)}
                        placeholder="client@email.com"
                        className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border shadow-sm hover:shadow transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${theme.text}`}>Items</h2>
                  <Button
                    onClick={addItem}
                    variant="outline"
                    size="sm"
                    className={`${theme.text} transition-colors duration-300`}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {invoice.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-12 gap-2 items-end"
                      >
                        <div className="col-span-5">
                          <Label htmlFor={`item-${index}-desc`}>Description</Label>
                          <Input
                            id={`item-${index}-desc`}
                            value={item.description}
                            onChange={(e) => updateItem(index, "description", e.target.value)}
                            placeholder="Item description"
                            className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`item-${index}-qty`}>Quantity</Label>
                          <Input
                            id={`item-${index}-qty`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label htmlFor={`item-${index}-price`}>Price</Label>
                          <Input
                            id={`item-${index}-price`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItem(index, "price", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                          />
                        </div>
                        <div className="col-span-1 text-right font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                        <div className="col-span-1">
                          <Button
                            onClick={() => removeItem(index)}
                            variant="ghost"
                            size="icon"
                            disabled={invoice.items.length === 1}
                            className="hover:bg-red-50 transition-colors duration-300"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoice.taxRate}
                      onChange={(e) => updateInvoice(null, "taxRate", Number.parseFloat(e.target.value) || 0)}
                      className="w-24 text-right transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                    />
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tax ({invoice.taxRate}%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <motion.div
                    className="flex justify-between text-lg font-bold"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: 0 }}
                  >
                    <span>Total:</span>
                    <span className={theme.text}>${calculateTotal().toFixed(2)}</span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow transition-shadow duration-300">
              <CardContent className="pt-6">
                <h2 className={`text-xl font-semibold mb-4 ${theme.text}`}>Additional Notes</h2>
                <Textarea
                  value={invoice.notes}
                  onChange={(e) => updateInvoice(null, "notes", e.target.value)}
                  placeholder="Payment terms, bank details, or any other notes"
                  rows={3}
                  className="transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50"
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!invoice.yourDetails.name || !invoice.clientDetails.name}
                className="group"
              >
                <Eye className="h-4 w-4 mr-2 group-hover:animate-pulse" /> Preview Invoice
                <ChevronsRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </div>
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
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    PDF Ready!
                  </Button>
                ) : (
                  <ReactToPrint
                    trigger={() => <PrintButton />}
                    content={() => invoiceRef.current}
                    documentTitle={`Invoice-${invoice.invoiceNumber}`}
                  />
                )}
              </div>
            </div>

            <div className={`bg-white p-8 border rounded-lg shadow-sm ${theme.border}`} ref={invoiceRef}>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className={`text-3xl font-bold ${theme.text}`}>INVOICE</h1>
                  <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{invoice.yourDetails.name}</div>
                  <div className="text-gray-600 whitespace-pre-line">{invoice.yourDetails.address}</div>
                  <div className="text-gray-600">{invoice.yourDetails.email}</div>
                  <div className="text-gray-600">{invoice.yourDetails.phone}</div>
                </div>
              </div>

              <div className={`w-full h-2 ${theme.primary} rounded-full my-6`}></div>

              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <h2 className="text-gray-600 font-semibold mb-2">Bill To:</h2>
                  <div className="font-medium">{invoice.clientDetails.name}</div>
                  <div className="text-gray-600 whitespace-pre-line">{invoice.clientDetails.address}</div>
                  <div className="text-gray-600">{invoice.clientDetails.email}</div>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-gray-600 font-semibold">Invoice Date: </span>
                    <span>{invoice.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-semibold">Due Date: </span>
                    <span>{invoice.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <table className="w-full">
                  <thead>
                    <tr className={`${theme.accent} border-b ${theme.border}`}>
                      <th className={`py-3 px-2 text-left ${theme.text}`}>Description</th>
                      <th className={`py-3 px-2 text-right ${theme.text}`}>Quantity</th>
                      <th className={`py-3 px-2 text-right ${theme.text}`}>Price</th>
                      <th className={`py-3 px-2 text-right ${theme.text}`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className={`border-b ${theme.border}`}>
                        <td className="py-4 px-2">{item.description}</td>
                        <td className="py-4 px-2 text-right">{item.quantity}</td>
                        <td className="py-4 px-2 text-right">${item.price.toFixed(2)}</td>
                        <td className="py-4 px-2 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between py-2 font-bold text-lg ${theme.text}`}>
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className={`mt-12 p-4 ${theme.accent} rounded-lg`}>
                  <h2 className={`font-semibold mb-2 ${theme.text}`}>Notes:</h2>
                  <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}

              <div className="mt-12 text-center">
                <div className={`inline-block px-8 py-3 ${theme.primary} text-white rounded-full`}>
                  Thank you for your business!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

