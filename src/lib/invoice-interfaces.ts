import { iAccCode, iFinance, iOrder } from "./interfaces"

export interface iInvoice {
    id: number
    invoiceAt: string
    paymentTerm: number
    dueAt: string
    salesman: string
    financeId: number
    total: number
    accountId: number
    memo?: string
}

export interface iInvoiceDetail  {
    invoiceId:number
    orderId:number
}