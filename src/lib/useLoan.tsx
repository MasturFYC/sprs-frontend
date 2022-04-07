import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { dateParam } from "./interfaces";

type TLoan = {
	id: number
	name: string
	street?: string
	city?: string
	phone?: string
	cell?: string
	zip?: string
	persen: number
	trxID: number
	division?: string
	descriptions?: string
	trxDate: string
	memo?: string
	loan: {
		debt: number
		cred: number
		piutang: number
		saldo: number
	}
}

// const initLoan: TLoan = {
// 	id: 0,
// 	name: "",
// 	persen: 0,
// 	trxID: 0,
// 	trxDate: dateParam(null),
// 	loan: {
// 		debt: 0,
// 		cred: 0,
// 		piutang: 0,
// 		saldo: 0
// 	}
// }

export function useLoanList() {
	const [list, setList] = useState<TLoan[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const getItem = (id: number) => {
		const test = list.filter(f => f.id === id)[0]
		return test;
	}

	useEffect(() => {
		let isLoaded = false;
		async function load() {
			const headers = {
				'Content-Type': 'application/json'
			};

			await axios
				.get("/loan", { headers: headers })
				.then(response => response.data)
				.catch(error => console.log(error))
				.then(data => {
					setList(data ? data : [])
					setIsLoading(false)
				});
		}

		if (!isLoaded) {
			setIsLoading(true)
			load();
		}

		return () => { isLoaded = true; };
	}, []);

	return {
		items: list,
		count: () => list.length,
		totalDebt: () => list.reduce((t, c) => t + c.loan.debt, 0),
		totalPiutang: () => list.reduce((t, c) => t + c.loan.piutang, 0),
		totalCred: () => list.reduce((t, c) => t + c.loan.cred, 0),
		totalSaldo: () => list.reduce((t, c) => t + c.loan.saldo, 0),
		isLoading: isLoading,
		getItem: (id: number) => getItem(id)
	};

}

type Trx = {
	id: number,
	refId: number,
	division: string,
	trxDate: string,
	descriptions?: string | undefined,
	memo?: string | undefined,
	detail: {
		groupId: number,
		id: number,
		trxId: number,
		codeId: number,
		debt: number,
		cred: number,
		saldo: number
	}
}

const initTrx: Trx = {
	id: 0,
	refId: 0,
	division: 'trx-loan',
	trxDate: dateParam(null),
	descriptions: '',
	detail: {
		groupId: 0,
		id: 0,
		trxId: 0,
		codeId: 0,
		debt: 0,
		cred: 0,
		saldo: 0
	}
}

type LoanItem = {
	id: number
	name: string
	street?: string
	city?: string
	phone?: string
	cell?: string
	zip?: string
	persen: number,
	trxs: Trx[]
}

const initLoanItem: LoanItem = {
	id: 0,
	name: '',
	persen: 5,
	trxs: [initTrx],
}

export function useLoan(loanId: number) {
	const [loan, setLoan] = useState<LoanItem>(initLoanItem)
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		let isLoaded = false;
		async function load() {
			const headers = {
				'Content-Type': 'application/json'
			};

			let res = await axios
				.get(`/loan/${loanId}`, { headers: headers })
				.then(response => response.data)
				.catch(error => console.log(error))
				.then(data => data);

			return res ? res : initLoanItem;
		}

		setIsLoading(true)

		load().then(data => {
			if (!isLoaded) {
				setLoan(data)
				setIsLoading(false)
			}
		});

		return () => { isLoaded = true; };
	}, [loanId]);
	const pokok = () => loan.trxs.reduce((t, c) => t + c.detail.cred, 0);
	const payment = () => loan.trxs.reduce((t, c) => t + c.detail.debt, 0);
	return {
		item: loan,
		setItem: setLoan,
		getPokok: () => pokok(),
		getPayment: () => payment(),
		getCashId: () => loan.trxs.filter(f => f.division === 'trx-loan')[0].detail.codeId,
		getTotalPiutang: () => {
			const pk = pokok();
			const total = pk + (pk * (loan.persen / 100.0))
			return total;
		},
		getSisaPiutang: () => {
			const pk = pokok();
			const angsuran = payment();
			const total = pk + (pk * (loan.persen / 100.0))
			return total - angsuran;
		},
		getTransaction: () => loan.trxs.filter(f => f.division === 'trx-loan')[0],
		getListPayment: () => loan.trxs.filter(f => f.division === 'trx-angsuran'),
		updateTransaction: (id: number, p: Trx) => {
			const trxs = loan.trxs;
			if (id === 0) {
				trxs.push(p)
			} else {
				let i = -1;
				for (let c = 0; c < trxs.length; c++) {
					if (trxs[c].id === id) {
						i = c;
						break;
					}
				}
				if (i !== -1) {
					trxs.splice(i, 1, p)
				}
			}
			setLoan(o => ({ ...o, trxs: trxs }))
		},
		deleteTransaction: (id: number) => {
			const trxs = loan.trxs;
			let i = -1;
			for (let c = 0; c < trxs.length; c++) {
				if (trxs[c].id === id) {
					i = c;
					break;
				}
			}
			if (i !== -1) {
				trxs.splice(i, 1)
				setLoan(o => ({ ...o, trxs: trxs }))
			}
		},
		isLoading: isLoading,
	};

}