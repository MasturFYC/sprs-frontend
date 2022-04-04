import React, { Fragment } from "react";
import WheelForm, { initWarehouse } from './Form'
import { iWarehouse } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Link } from "@adobe/react-spectrum";
import { useWarehouseList } from "lib/useWarehouse";

const Wheel = () => {
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	let warehouses = useWarehouseList();

	return (
		<Fragment>
			<h1>Gudang</h1>
			{[initWarehouse, ...warehouses.items].map(o => {
				return o.id === selectedId ?
					<WheelForm key={o.id} warehouse={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id} marginY='size-100' >
						<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
							onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
							{o.id === 0 ? 'Gudang baru' : o.name}
						</Link>
						<div>{o.descriptions}</div>
					</View>
			})}
		</Fragment>
	);

	function formResponse(params: { method: string, data?: iWarehouse }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				warehouses.insert(data)
			} else {
				warehouses.update(data.id, data)
			}
		} else if (method === 'remove' && data) {
			warehouses.remove(data.id)
		}

		setSelectedId(-1)
	}
}

export default Wheel;