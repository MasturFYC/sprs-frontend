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