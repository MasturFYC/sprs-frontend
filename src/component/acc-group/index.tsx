import React from "react";
import axios from "../../lib/axios-base";
import { iAccGroup } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Button, Divider, Flex, Link, useAsyncList } from "@adobe/react-spectrum";
import TrxTypeForm, { initAccGrop } from './Form'

const TrxType = () => {
	const [selectedId, setSelectedId] = React.useState<number>(-1);

	let groups = useAsyncList<iAccGroup>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/acc-group/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data ? data : []
				})
				.catch(error => {
					console.log('-------', error)
				})

			return { items: res }
		},
		getKey: (item: iAccGroup) => item.id
	})

	return (
		<View>
			<h1>Jenis Transaksi</h1>

			<View marginY={'size-200'}>
				<Button variant="cta" onPress={() => addNewItem()}>Group Akun Baru</Button>
			</View>

			<Divider size="S" marginY='size-100' />

			{groups.items.map(o => {

				return o.id === selectedId ?
					<View key={o.id}
						backgroundColor={'gray-100'}
						marginBottom={'size-400'}
						borderRadius={'medium'}
						borderWidth={'thin'}
						borderColor={'indigo-400'}
						paddingX={'size-200'}
						paddingY={'size-50'}
						width={{ base: 'auto', L: '75%' }}
					>
						<TrxTypeForm
							isNew={o.id === 0}
							accGroup={o}
							callback={(e) => formResponse(e)}
						/>
					</View>
					:
					<View key={o.id}>
						<Flex direction={{ base: 'column', L: 'row' }} columnGap='size-200' rowGap='size-50'>
							<View width={{ base: 'auto', M: '25%' }}>
								<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
									onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
									<span>{o.id} - {o.name}</span>
								</Link>
							</View>
							<View flex>
								{o.descriptions}
							</View>
						</Flex>
						<Divider size="S" marginY='size-100' />
					</View>
			})}
		</View>
	);

	function formResponse(params: { method: string, data?: iAccGroup }) {
		const { method, data } = params


		switch (method) {
			case 'save':
				if (data) {
					if (selectedId === 0) {
						groups.update(0, data)
					} else {
						groups.update(selectedId, data)
					}
				}
				break;
			case 'remove':
				groups.remove(selectedId);
				break;
			case 'cancel':
				if (selectedId === 0) {
					groups.remove(0)
				}
				break;
		}

		setSelectedId(-1)
	}

	function addNewItem() {
		if (!groups.getItem(0)) {
			groups.insert(0, initAccGrop);
		}
		setSelectedId(0)
	}
}

export default TrxType;