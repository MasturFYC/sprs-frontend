import React, { Fragment } from "react";
import axios from "../../lib/axios-base";
import MerkForm from './Form'
import { iMerk } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Link, useAsyncList } from "@adobe/react-spectrum";

const initMerk: iMerk = {
	id: 0,
	name: ''
}

const Merk = () => {
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	let merks = useAsyncList<iMerk>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/merks/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data
				})
				.catch(error => {
					console.log(error)
				})
			return { items: [initMerk, ...res] }
		},
		getKey: (item: iMerk) => item.id
	})

	return (
		<Fragment>
			<h1>Merk Kendaraan</h1>
			{merks.items.map(o => {
				return o.id === selectedId ?
					<MerkForm key={o.id} merk={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id} marginY='size-100'>
						<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
							onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
							{o.id === 0 ? 'Merk baru' : o.name}
						</Link>
					</View>
			})}
		</Fragment>
	);

	function formResponse(params: { method: string, data?: iMerk }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				merks.insert(1, data)
			} else {
				merks.update(data.id, data)
			}
		} else if (method === 'remove' && data) {
			merks.remove(data.id)
		}

		setSelectedId(-1)
	}
}

export default Merk;