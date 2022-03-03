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

export interface iVehicle {
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