import React from "react";
import axios from "../../lib/axios-base";
import { iAction } from '../../lib/interfaces'
import ActionForm, { initAction } from './Form'
import { View } from "@react-spectrum/view";
import { Divider, Flex, Link, ProgressCircle, useAsyncList } from "@adobe/react-spectrum";
import { FormatDate } from "../../lib/format";

import SimpleReactFileUpload from "../../lib/SimpleReactFileUpload";

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
					console.log(error)
					return []
				})

			return { items: res }
		},
		getKey: (item: iAction) => item.id
	})


	return (
		<View>
			<div className="div-h2">TINDAKAN YANG PERNAH DILAKUKAN</div>
			{actions.isLoading &&
				<Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
			}
			<Divider size={'S'} marginY={'size-100'} />
			{[{ ...initAction, orderId: orderId }, ...actions.items].map(o => {
				return o.id === selectedId ?
					<ActionForm key={o.id} action={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id}>
						<Flex direction={{ base: 'column', M: 'row' }} gap={'size-100'} >
							<View flex width={{ base: 'auto', M: 'size-3400' }}>
								<View>
								<Link isQuiet variant={'primary'}
									onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
									{o.id === 0 ? 'Tindakan baru' : `${o.pic}`}
								</Link>
								</View>
								{o.id > 0 &&
									<View>
										Tanggal: {FormatDate(o.actionAt)}<br />
										Keterangan: {o.descriptions}
									</View>
								}
							</View>
							<View>
								{o.id > 0 &&
								<SimpleReactFileUpload imageId={o.id}
									fileName={o.fileName}
									onSuccess={(e) => {
										actions.update(o.id, { ...actions.getItem(o.id), fileName: e })
									}
									} />
								}
							</View>

						</Flex>
						<Divider size={'S'} marginY={'size-100'} />
					</View>
			})}
		</View>
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