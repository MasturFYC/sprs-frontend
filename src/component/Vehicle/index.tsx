import React, { Fragment } from "react";
import { iType } from '../../lib/interfaces'
import TypeForm, { initVehicle } from './Form'
import { View } from "@react-spectrum/view";
import { Link } from "@adobe/react-spectrum";
import { useVehicleList } from "lib/useVehicle";

const Vehicle = () => {
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	let vehicles = useVehicleList()

	return (
		<Fragment>
			<h1>Tipe Kendaraan</h1>
			{[initVehicle, ...vehicles.items].map(o => {
				return o.id === selectedId ?
					<TypeForm key={o.id} vehicle={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id} marginY='size-100' >
						<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
							onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
							{o.id === 0 ? 'Tipe kendaraan baru' : `(${o.wheel?.shortName}) - ${o.merk?.name} ${o.name}`}
						</Link>
					</View>
			})}
		</Fragment>
	);

	function formResponse(params: { method: string, data?: iType }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				vehicles.insert(data)
			} else {
				vehicles.update(data.id, data)
			}
		} else if (method === 'remove' && data) {
			vehicles.remove(data.id)
		}

		setSelectedId(-1)
	}
}

export default Vehicle;