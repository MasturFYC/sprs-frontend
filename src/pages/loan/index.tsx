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
					<tr>
						<th className="text-center">NO</th>
						<th className="text-center">TANGGAL</th>
						<th className="text-left">NAMA</th>
						<th className="text-left">ALAMAT</th>
						<th className="text-right">PINJAMAN</th>
						<th className="text-right">ANGSURAN</th>
						<th className="text-right text-no-wrap">SISA PIUTANG</th>
					</tr>
				</thead>
				<tbody>
					{loan.items.map((o, i) => <tr key={o.id}>
						<td className="text-center">{i + 1}</td>
						<td className="text-center">{FormatDate(o.trxDate)}</td>
						<td><Link to={`/loan/${o.id}`} state={{ from: pathname }}>{o.name}</Link></td>
						<td>{o.street}, {o.city} - {o.zip}</td>
						<td className="text-right">{FormatNumber(o.loan.debt)}</td>
						<td className="text-right">{FormatNumber(o.loan.cred)}</td>
						<td className="text-right">{FormatNumber(o.loan.saldo)}</td>
					</tr>
					)}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={4}>Total: {loan.items.length} items</td>
						<td className="text-right font-bold">{FormatNumber(loan.items.reduce((t, c) => t + c.loan.debt, 0))}</td>
						<td className="text-right font-bold">{FormatNumber(loan.items.reduce((t, c) => t + c.loan.cred, 0))}</td>
						<td className="text-right font-bold">{FormatNumber(loan.items.reduce((t, c) => t + c.loan.saldo, 0))}</td>
					</tr>
				</tfoot>
			</table>
		</View>
	);


}

export default LoanPage;