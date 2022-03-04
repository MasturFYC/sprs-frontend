import moment from "moment";

export const stringDateFormat = 'YYYY-MM-DD HH:mm';
export const hour24Format = 'YYYY-MM-DD HH24:MI';
const dateOnlyString = 'YYYY-MM-DD';
export const dateParam = (value?: string | undefined | null) => (value) ? moment(value, stringDateFormat).format(stringDateFormat) : moment(new Date(), stringDateFormat).format(stringDateFormat);
export const dateOnly = (value?: string | undefined | null, format: string = dateOnlyString) => (value) ? moment(value, dateOnlyString).format(format) : moment(new Date(), dateOnlyString).format(format);
export const setRefId = (id: number, code: string) => {
  return code + '-' + id.toString().padStart(9, '0');
}

export interface iMerk {
    id: number
    name: string
}

export interface iWheel {
    id: number
    name: string
    shortName: string
}

export interface iType {
    id: number
    name: string
    wheelId: number
    merkId: number
    merk?: iMerk
    wheel?: iWheel
}

export interface iBranch {
    id: number
    name: string
    headBranch: string
    street?: string
    city?: string
    phone?: string
    cell?: string
    zip?: string
    email?: string
}

export interface iWarehouse {
    id: number
    name: string
    descriptions?: string
}

export interface iFinance {
    id: number
    name: string
    shortName: string
    street?: string
    city?: string
    phone?: string
    cell?: string
    zip?: string
    email?: string
}

export interface iAction {
    id: number
    actionAt: string
    code: string
    pic: string
    descriptions?: string
    orderId: number
}

export interface iOrder {
    id: number
    name: string
    orderAt: string
    printedAt: string
    btFinance: number
    btPercent: number
    btMatel: number
    ppn: number
    nominal: number
    subtotal: number
    userName: string
    verifiedBy?: string
    validatedBy?: string
    financeId: number
    branchId: number
    isStnk: boolean
    stnkPrice: number
    
    branch?: iBranch
    finance?: iFinance

    customer?: iCustomer
    unit?: iUnit
    receivable?: iReceivable
    homeAddress?: iAddress,
    ktpAddress?: iAddress,
    officeAddress?: iAddress,
    postAddress?: iAddress,
    task?: iTask
}

export interface iCustomer {
    orderId: number
    name: string
    agreementNumber?: string
    paymentType: string
}

export interface iUnit {
    orderId: number
    nopol: string
    year: number
    frameNumber?: string
    machineNumber?: string
    bpkbName?: string
    color?: string
    dealer?: string
    surveyor?: string
    typeId: number
    warehouseId: number
    warehouse?: iWarehouse
    type?: iType
}

export interface iReceivable {
    orderId: number

    // tanggal perjanjian 
    covenantAt: string

    // tanggal jatuh tempo
    dueAt: string

    // angsuran per bulan
    mortgageByMonth: number
    
    // angsuran tunggakan
    mortgageReceivable: number

    // denda berjalan
    runningFine: number

    // sisa denda
    restFine: number

    // jasa penagihan
    billService: number

    // bayar titipan
    payDeposit: number

    // sisa piutang
    restReceivable: number

    // sisa pokok
    restBase: number

    // jangka waktu
    dayPeriod: number

    // angsuran yg ke
    mortgageTo: number

    // jumlah hari angsuran
    dayCount: number
}

export interface iAddress {
    orderId: number
    street?: string
    city?: string
    phone?: string
    cell?: string
    zip?: string
    email?: string
}


export interface iTask {
    orderId: number
    descriptions: string
    periodFrom: string
    periodTo: string
    recipientName: string
    recipientPosition: string
    giverPosition: string
    giverName: string
}