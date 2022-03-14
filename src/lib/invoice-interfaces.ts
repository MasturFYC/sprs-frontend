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
    finance?: iFinance
    account?: iAccCode
    details?: iInvoiceDetail[]
}

export interface iInvoiceDetail  {
    invoiceId:number
    id:number
    orderId:number
    price:number
    tax:number
    spk: iOrder
    invoice?: iInvoice
}