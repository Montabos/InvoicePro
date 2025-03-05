import InvoiceGenerator from "../invoice-generator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Invoice Generator
        </h1>
        <p className="text-center text-gray-600 mb-8">Create and download professional invoices in seconds</p>
        <InvoiceGenerator />
      </div>
    </main>
  )
}

