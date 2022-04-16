import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { tsLent, tsLentItem } from "pages/lent/interfaces";
import { dateParam } from "./interfaces";

export function useLentList() {
	const [list, setList] = useState<tsLent[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const getItem = (id: number) => {
		const test = list.filter(f => f.orderId === id)[0]
		return test;
	}

	useEffect(() => {
		let isLoaded = false;
		async function load() {
			const headers = {
				'Content-Type': 'application/json'
			};

			await axios
				.get("/lent", { headers: headers })
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
		count: (r: string = '') => list.filter(f => f.unit.wheel === r || r === '').length,
		totalDebt: (r: string = '') => list.filter(f => f.unit.wheel === r || r === '').reduce((t, c) => t + c.payment.debt, 0),
		totalPiutang: (r: string = '') => list.filter(f => f.unit.wheel === r || r === '').reduce((t, c) => t + c.payment.piutang, 0),
		totalCred: (r: string = '') => list.filter(f => f.unit.wheel === r || r === '').reduce((t, c) => t + c.payment.cred, 0),
		totalSaldo: (r: string = '') => list.filter(f => f.unit.wheel === r || r === '').reduce((t, c) => t + c.payment.saldo, 0),
		isLoading: isLoading,
		getItem: (id: number) => getItem(id)
	};

}

const initLent = {
	unit: {
		id: 0,
		name: '',
		branch: '',
		finance: '',
		orderAt: dateParam(null),
		btFinance: 0,
		btPercent: 0,
		btMatel: 0,
		nopol: '',
		year: 0,
		type: '',
		wheel: '',
		merk: ''
	},
	trxs: [{
		id: 0,
		refId: 0,
		division: 'trx-lent',
		trxDate: dateParam(null),
		memo: '',
		detail: {
			id: 0,
			trxId: 0,
			codeId: 0,
			debt: 0,
			cred: 0,
			saldo: 0
		}
	}],
	orderId: 0,
	name: ''
}

export function useLent(orderId: string) {
	
	const [lent, setLent] = useState<tsLentItem>(initLent)
	const [isLoading, setIsLoading] = useState(false);
	const [count, setCount] = useState(0)

	useEffect(() => {
		let isLoaded = false;

		async function load() {
			const headers = {
				'Content-Type': 'application/json'
			};

			let res = await axios
				.get(`/lent/item/${orderId}`, { headers: headers })
				.then(response => response.data)
				.catch(error => console.log(error))
				.then(data => data);

			return res ? res : initLent
		}

			setIsLoading(true)
			load()
				.then(data => {
					if(!isLoaded) {
					setLent(data)
					setIsLoading(false)
					}
				});

		return () => { isLoaded = true; };
	}, [orderId, count]);

	return {
		item: lent,
		setLent: setLent,
		isLoading: isLoading,
		reload: () => setCount(count + 1)
	};

}