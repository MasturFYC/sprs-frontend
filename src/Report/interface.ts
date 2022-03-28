export type tOrderInvoiced = {
  id: number
  name: string
  orderAt: string
  btFinance: number
  btPercent: number
  btMatel: number
  isStnk: boolean
  stnkPrice: number
  status: number
  financeId: number

  branch: {
    name: string
  }

  unit?: {
    nopol: string
    year: number

    type: {
      name: string
      wheel: { name: string, shortName: string }
      merk: { name: string }
    }
  }

  finance: {
    name: string
    shortName: string
  }
}


