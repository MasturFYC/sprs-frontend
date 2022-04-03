import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iLoan } from "./interfaces";

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

export function useLoanList() {
  const [list, setList] = useState<TLoan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

	const getItem = (id:number) => {
		const test = list.filter(f=>f.id === id)[0]
		return test;
	}
	
	useEffect(() => {
		let isLoaded = false;
		async function load() {
			const headers = {
				'Content-Type': 'application/json'
			};

			await axios
        .get("/loans", { headers: headers })
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
