import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "lib/axios-base";
import { View } from "@react-spectrum/view";
import { Button, Flex, ProgressCircle, useAsyncList } from "@adobe/react-spectrum";
//import { useParams } from "react-router-dom";
import { FormatDate, FormatNumber } from "lib/format";
import { iLoan } from "lib/interfaces";

import 'Report/report.css'

export interface LoanAll extends iLoan {
	trxID: number
	division?: string
	descriptions?: string
	trxDate: string
	memo?: string
	loan: {
		debt: number
		cred: number
		saldo: number
	}
}

const LoanPage = () => {
	let navigate = useNavigate()
	const { pathname } = useLocation();
	//	const { id: paramId, name: typeName } = useParams()

	let loan = useAsyncList<LoanAll>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/loans", { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
					return []
				})
			return { items: res || [] }
		},
		getKey: (item: LoanAll) => item.id
	})


	if (loan.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<View>
			<View><span className="div-h1">Buku Piutang</span></View>

			<Flex direction='row' gap='size-200' marginY={'size-400'}>
				<Button variant="cta" onPress={() => navigate("/loan/0", { state: { from: pathname } })}>Piutang Baru</Button>
			</Flex>


			<table className="table-small width-100-percent collapse-none" cellPadding={4}>
				<thead>
					<tr className="border-b-1 border-t-1 bg-green text-white">
						<th className="text-center">NO</th>
						<th className="text-center text-no-wrap">TANGGAL</th>
						<th className="text-left">NAMA</th>
						<th className="text-left">ALAMAT</th>
						<th className="text-center">PROSENTASE</th>
						<th className="text-right">POKOK</th>
						<th className="text-right">ANGSURAN</th>
						<th className="text-right text-no-wrap">SISA PIUTANG</th>
					</tr>
				</thead>
				<tbody>
					{loan.items.map((o, i) => <tr key={o.id} className="border-b-gray-50">
						<td className="text-center">{i + 1}</td>
						<td className="text-center text-no-wrap">{FormatDate(o.trxDate)}</td>
						<td className="text-no-wrap"><Link to={`/loan/${o.id}`} state={{ from: pathname }}>{o.name}</Link></td>
						<td>{o.street}, {o.city} - {o.zip}</td>
						<td className="text-center">{FormatNumber(o.persen)}%</td>
						<td className="text-right">{FormatNumber(o.loan.debt)}</td>
						<td className="text-right">{FormatNumber(o.loan.cred)}</td>
						<td className="text-right">{FormatNumber(getSisaPiutang(o))}</td>
					</tr>
					)}
				</tbody>
				<tfoot>
					<tr className="border-b-1">
						<td className="border-t-1" colSpan={5}>Total: {loan.items.length} items</td>
						<td className="text-right border-t-1 font-bold">{FormatNumber(loan.items.reduce((t, c) => t + c.loan.debt, 0))}</td>
						<td className="text-right border-t-1 font-bold">{FormatNumber(loan.items.reduce((t, c) => t + c.loan.cred, 0))}</td>
						<td className="text-right border-t-1 font-bold">{FormatNumber(getTotalSisaPiutang())}</td>
					</tr>
				</tfoot>
			</table>
		</View>
	);

	function getSisaPiutang(p: LoanAll): number {
		const sisa = (p.loan.debt +  (p.loan.debt * (p.persen / 100))) - p.loan.cred; 
		return sisa
	}


	function getTotalSisaPiutang(): number {
		const cred = loan.items.reduce((t, c) => t + c.loan.cred, 0)
		const sisa = loan.items.reduce((t, c) => t + (c.loan.debt + (c.loan.debt * (c.persen / 100))), 0)
		return sisa - cred
	}

}

export default LoanPage;