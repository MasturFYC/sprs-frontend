import { iLent } from "lib/interfaces"


export type lentDetail = {
	id: number,
	trxId: number,
	codeId: number,
	debt: number,
	cred: number,
	saldo: number
}

export type lentTrx = {
  id: number,
  refId: number,
  division: string,
  descriptions?: string,
  trxDate: string,
  memo: string,
  detail: lentDetail
}

export type lentPayment = {
  order_id: number,
  debt: number,
  cred: number,
  saldo: number
}

export type lentUnit = {
  id: number,
  name: string,
  orderAt: string,
  btFinance: number,
  btPercent: number,
  btMatel: number,
  nopol: string,
  year: number,
  type: string,
  wheel: string,
  merk: string
}

export interface tsLentItem extends iLent {
	unit: lentUnit,
	trxs: lentTrx[]
}


export interface tsLent extends iLent {
  payment: lentPayment,
  unit: lentUnit
}