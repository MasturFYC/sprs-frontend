import React, { Fragment } from "react";
import axios from "../component/axios-base";
import { iOrder } from '../component/interfaces'
import OrderForm, { initOrder } from './Form'
import { View } from "@react-spectrum/view";
import { Button, Link, useAsyncList } from "@adobe/react-spectrum";

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
				})

			return { items: res }
		},
		getKey: (item: iOrder) => item.id
	})

	return (
		<Fragment>
			<h1>Order (SPK)</h1>
			<View marginY={'size-200'}><Button variant="cta" onPress={() => addNewOrder()}>Order Baru</Button></View>
			{orders.items.map(o => {
				return o.id === selectedId ?
					<OrderForm key={o.id} order={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id} marginY='size-100' >
						<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
							onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
							{o.name}
						</Link>
					</View>
			})}
		</Fragment>
	);

	function formResponse(params: { method: string, data?: iOrder }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				orders.insert(0, data)
				orders.remove(0)
			} else {
				orders.update(data.id, data)
			}
		} else if (method === 'remove' && data) {
			orders.remove(data.id)
		}

		setSelectedId(-1)
	}

	function addNewOrder() {
		if(!orders.getItem(0)) {
			orders.insert(0, initOrder)
		}
		setSelectedId(0)
	}
}

export default Order;