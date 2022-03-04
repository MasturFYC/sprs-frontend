import React, { Fragment } from "react";
import axios from "../component/axios-base";
import { iOrder } from '../component/interfaces'
import OrderForm, { initOrder } from './Form'
import { Button, Checkbox, Flex, Link, ProgressCircle, useAsyncList, View } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "../component/format";
import './table.css'

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

	if (orders.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<Fragment>
 			<h1>Order (SPK)</h1>
			<View marginY={'size-200'}>
				<Button variant="cta" onPress={() => addNewOrder()}>Order Baru</Button></View>
			<table>
				<thead>
					<tr>
						<th align="left">NOMOR (SPK)</th>
						<th>TANGGAL</th>
						<th align="left">MERK</th>
						<th align="left">TYPE</th>
						<th align="left">FINANCE</th>
						<th align="left">NOPOL</th>
						<th>TAHUN</th>
						<th align="right">BT FINANCE</th>
						<th align="right">BT MATEL</th>
						<th align="right">PPN</th>
						<th align="right">ADA STNK</th>
						<th align="right">PROFIT</th>
						{/* <th align="left">UNIT</th> */}
					</tr>
				</thead>
				<tbody>
					{orders.items.map((item, index) =>
						item.id === selectedId ?
							<tr key={item.id}>
								<td colSpan={12} style={{padding: '12px 0'}}>
									<OrderForm order={item} callback={(e) => formResponse(e)}
										updateChild={e => updateChild(e)} />
								</td>
							</tr>
							:
							<tr key={item.id} style={{ backgroundColor: index % 2 === 1 ? '#f3f3f3' : '#fff' }}
								title={`${item.unit?.warehouse?.name } - ${item.branch?.name} `}>
								<td><Link isQuiet variant="primary" UNSAFE_style={{fontWeight: 700}} onPress={(e) => {
									setSelectedId(item.id)
								}}>{item.name}</Link></td>
								<td align="center">{FormatDate(item.orderAt)}</td>
								<td>{item.unit?.type?.merk?.name}</td>
								<td>{item.unit?.type?.name}</td>
								<td>{item.finance?.shortName}</td>
								<td>{item.unit?.nopol}</td>
								<td align="center">{item.unit?.year}</td>
								<td align="right">{FormatNumber(item.btFinance)}</td>
								<td align="right">{FormatNumber(item.btMatel)}</td>
								<td align="right">{FormatNumber(item.nominal)}</td>
								<td align="right">
									{item.isStnk ? '✔' : ''}{' '}
										{FormatNumber(item.stnkPrice)}									
									</td>
								<td align="right">{FormatNumber(item.subtotal)}</td>
								{/* <td></td> */}
							</tr>
					)}
				</tbody>
				<tfoot>
					<tr>
						<th colSpan={7} align="left">Total</th>
						<th align="right">{FormatNumber(orders.items.reduce((acc, v) => acc + v.btFinance, 0))}</th>
						<th align="right">{FormatNumber(orders.items.reduce((acc, v) => acc + v.btMatel, 0))}</th>
						<th align="right">{FormatNumber(orders.items.reduce((acc, v) => acc + v.nominal, 0))}</th>
						<th align="right">{FormatNumber(orders.items.reduce((acc, v) => acc + v.stnkPrice, 0))}</th>
						<th align="right">{FormatNumber(orders.items.reduce((acc, v) => acc + v.subtotal, 0))}</th>
					</tr>
				</tfoot>
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
		else if (method === 'remove') {
			orders.remove(selectedId)
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