import React from 'react'
import { ComboBox, Item } from '@adobe/react-spectrum';


type ValidationState = 'valid' | 'invalid';
interface iBulan {
	id: number
	name: string
}

type MonthComponentProps = {
	selectedId: number,
	removeId?: number | undefined | null,
	onChange?: (e: iBulan) => void,
	ValidationState?: ValidationState,
	labelPosition?: 'top' | 'side',
	label?: string,
	width?: string
}

export const monthNames: iBulan[] = [
	{ id: 0, name: "Bulan" },
	{ id: 1, name: "Januari" },
	{ id: 2, name: "Februari" },
	{ id: 3, name: "Maret" },
	{ id: 4, name: "April" },
	{ id: 5, name: "Mei" },
	{ id: 6, name: "Juni" },
	{ id: 7, name: "Juli" },
	{ id: 8, name: "Agustus" },
	{ id: 9, name: "September" },
	{ id: 10, name: "Oktober" },
	{ id: 11, name: "Nopember" },
	{ id: 12, name: "Desember" }
]

export default function MonthComponent(props: MonthComponentProps) {
	const {
		selectedId, 
		onChange: onchange, 
		removeId, 
		ValidationState: vstate,
		labelPosition,
		label,
		width
	} = props;

	return (
			<ComboBox
				menuTrigger="focus"
				validationState={vstate}
				flex={{base: true, M:false}}
				width={{base: 'auto', M: width}}
				label={label}
				aria-label={'bulan-component'}
				labelPosition={labelPosition}
				placeholder={"e.g. Agustus"}
				defaultItems={removeId ? monthNames : monthNames.filter(o => o.id !== removeId)}
				selectedKey={selectedId}
				onSelectionChange={(e) => {
					if (onchange) {
						onchange(monthNames.filter(o => o.id === +e)[0])
					}
				}}
			>
				{(item) => <Item>{item.name}</Item>}
			</ComboBox>
	);
}