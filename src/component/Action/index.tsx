import React, { Fragment } from "react";
import axios from "../axios-base";
import { iAction } from '../interfaces'
import ActionForm, { initAction } from './Form'
import { View } from "@react-spectrum/view";
import { Divider, Flex, Link, ProgressCircle, useAsyncList } from "@adobe/react-spectrum";
import { FormatDate } from "../format";

type ActionParam = {
	orderId: number
}

const Action = (prop: ActionParam) => {
	const { orderId } = prop;
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	let actions = useAsyncList<iAction>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get(`/actions/${orderId}/`, { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data ? data : []
				})
				.catch(error => {
					console.log({ 'Error': error })
					return []
				})

			return { items: res }
		},
		getKey: (item: iAction) => item.id
	})


	return (
		<Fragment>
			<h2>TINDAKAN YANG PERNAH DILAKUKAN</h2>
			{actions.isLoading &&
		 		<Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
			}
			<Divider size={'S'} />
			{[{ ...initAction, orderId: orderId }, ...actions.items].map(o => {
				return o.id === selectedId ?
					<ActionForm key={o.id} action={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id}>
						<Flex direction={{ base: 'column', M: 'row' }} gap={'size-100'} marginY='size-100' >
							<View width={{ base: 'auto', M: 'size-3400' }}>
								<Link isQuiet variant={'primary'}
									onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
									{o.id === 0 ? 'Tindakan baru' : `${o.code}`}
								</Link>
							</View>
							{o.id > 0 &&
								<View>
									Tanggal: {FormatDate(o.actionAt)}<br />
									Pic: {o.pic}<br />
									Keterangan: {o.descriptions}
								</View>
							}
						</Flex>
						<Divider size={'S'} />
					</View>
			})}
		</Fragment>
	);

	function formResponse(params: { method: string, data?: iAction }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				actions.insert(1, data)
			} else {
				actions.update(data.id, data)
			}
		} else if (method === 'remove' && data) {
			actions.remove(data.id)
		}

		setSelectedId(-1)
	}
}

export default Action;