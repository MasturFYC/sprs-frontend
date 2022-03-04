import React, { Fragment } from "react";
import axios from "../component/axios-base";
import { iOrder } from '../component/interfaces'
import OrderForm, { initOrder } from './Form'
import { Button, Link, useAsyncList, View } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "../component/format";


const Order = () => {
	const [selectedId, setSelectedId] = React.useState<number>(-1);

	let orders = useAsyncList<iOrder>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/orders/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data ? data : []
				})
				.catch(error => {
					console.log(error)
					return [];
				})

			return { items: res }
		},
		getKey: (item: iOrder) => item.id
	})

	// return (
	// 	<Fragment>
	// 		<h1>Order (SPK)</h1>
	// 		<View marginY={'size-200'}><Button variant="cta" onPress={() => addNewOrder()}>Order Baru</Button></View>
	// 		{orders.items.map(o => {
	// 			return o.id === selectedId ?
	// 				<OrderForm key={o.id} order={o} callback={(e) => formResponse(e)} />
	// 				:
	// 				<View key={o.id} marginY='size-100' >
	// 					<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
	// 						onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
	// 						{o.name}
	// 					</Link>
	// 				</View>
	// 		})}
	// 	</Fragment>
	// );

	return (
		<Fragment>
 			<h1>Order (SPK)</h1>
			<View marginY={'size-200'}>
				<Button variant="cta" onPress={() => addNewOrder()}>Order Baru</Button></View>
				<table style={{ borderCollapse: 'collapse', width: '100%' }}>
				<thead>
					<tr style={{ backgroundColor: '#ececec' }}>
						<th align="left">NOMOR (SPK)</th>
						<th align="center">TANGGAL</th>
						<th align="left">MERK</th>
						<th align="left">TYPE</th>
						<th align="left">FINANCE</th>
						<th align="left">NOPOL</th>
						<th align="left">TAHUN</th>
						<th align="right">BT FINANCE</th>
						<th align="right">BT MATEL</th>
						<th align="right">PPN</th>
					</tr>
				</thead>
				<tbody>
					{orders.items.map((item, index) =>
						item.id === selectedId ?
							<tr key={item.id}>
								<td colSpan={10} style={{padding: '12px 0'}}>
									<OrderForm order={item} callback={(e) => formResponse(e)}
										updateChild={e => updateChild(e)} />
								</td>
							</tr>
							:
							<tr key={item.id} style={{ backgroundColor: index % 2 === 1 ? '#f3f3f3' : '#fff' }}>
								<td><Link isQuiet variant="primary" UNSAFE_style={{fontWeight: 700}} onPress={(e) => {
									setSelectedId(item.id)
								}}>{item.name}</Link></td>
								<td align="center">{FormatDate(item.orderAt)}</td>
								<td>{item.unit?.type?.merk?.name} </td>
								<td>{item.unit?.type?.name} </td>
								<td>{item.finance?.shortName} </td>
								<td>{item.unit?.nopol} </td>
								<td>{item.unit?.year} </td>
								<td align="right">{FormatNumber(item.btFinance)}</td>
								<td align="right">{FormatNumber(item.btMatel)}</td>
								<td align="right">{FormatNumber(item.nominal)}</td>
							</tr>
					)}
				</tbody>
			</table>
		</Fragment>
	)

	function formResponse(params: { method: string, data?: iOrder }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				orders.insert(0, data)
				orders.remove(0)
			} else {
				orders.update(data.id, data)
			}
		}
		else if(method === 'cancel') {
			if(selectedId === 0) {
				orders.remove(0)	
			}
		}
		else if (method === 'remove' && data) {
			orders.remove(data.id)
		}

		setSelectedId(-1)
	}

	function updateChild(data: iOrder) {		
		orders.update(data.id, data)
	}

	function addNewOrder() {
		if (!orders.getItem(0)) {
			orders.insert(0, initOrder)
		}
		setSelectedId(0)
	}
}

export default Order;