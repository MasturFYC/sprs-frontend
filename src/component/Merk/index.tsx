import React, { Fragment } from "react";
import MerkForm from './Form'
import { iMerk } from 'lib/interfaces'
import { View } from "@react-spectrum/view";
import { Link } from "@adobe/react-spectrum";
import { useMerkList } from "lib/useMerk";

const initMerk: iMerk = {
	id: 0,
	name: ''
}

const Merk = () => {
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	let merks = useMerkList()

	return (
		<Fragment>
			<div className="div-h1">Merk Kendaraan</div>
			{[initMerk, ...merks.items].map(o => {
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
				merks.insert(data)
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