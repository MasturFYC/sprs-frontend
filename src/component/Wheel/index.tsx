import React, { Fragment } from "react";
import WheelForm, { initWheel } from './Form'
import { iWheel } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Link } from "@adobe/react-spectrum";
import { useWheelList } from "lib/useWheel";

const Wheel = () => {
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	let wheel = useWheelList()

	return (
		<Fragment>
			<div className="div-h1">Jenis Roda Kendaraan</div>
			{[initWheel, ...wheel.items].map(o => {
				return o.id === selectedId ?
					<WheelForm key={o.id} wheel={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id} marginY='size-100' >
						<Link isQuiet variant={'primary'}
							onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
							<span className="font-bold">{o.id === 0 ? 'Jenis roda baru' : `(${o.shortName}) - ${o.name}`}</span>
						</Link>
					</View>
			})}
		</Fragment>
	);

	function formResponse(params: { method: string, data?: iWheel }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				wheel.insert(data)
			} else {
				wheel.update(data.id, data)
			}
		} else if (method === 'remove' && data) {
			wheel.remove(data.id)
		}

		setSelectedId(-1)
	}
}

export default Wheel;