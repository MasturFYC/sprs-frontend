
export interface iInvoice {
    id: number
    invoiceAt: string
    paymentTerm: number
    dueAt: string
    salesman: string
    financeId: number
    subtotal: number
    ppn: number
    tax: number
    total: number
    accountId: number
    memo?: string
}

export interface iInvoiceDetail  {
    invoiceId:number
    orderId:number
}