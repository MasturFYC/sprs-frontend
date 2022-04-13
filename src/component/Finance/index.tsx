import React, { Fragment } from "react";
import { View } from "@react-spectrum/view";
import { Divider } from "@react-spectrum/divider";
import { Flex } from "@react-spectrum/layout";
import { Link } from "@react-spectrum/link";
import { ProgressCircle } from "@react-spectrum/progress";
import { iFinance } from 'lib/interfaces'
import FinanceForm, { initFinance } from './Form'
import { useFinanceList } from "lib/useFinance";

const Finance = () => {
	const [selectedId, setSelected] = React.useState<number>(-1);

	let fin = useFinanceList()

	if (fin.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<Fragment>
			<div className="div-h1">Pengelola Keuangan (Finance)</div>
			<Divider size={'S'} />
			{[initFinance, ...fin.items].map(o => {
				return o.id === selectedId ?
					<FinanceForm key={o.id} finance={o} callback={(e) => formResponse(e)} />
					:
					<View key={o.id}>
						<Flex direction={{ base: 'column', M: 'row' }} gap={'size-100'} marginY='size-100' >
							<View width={{ base: 'auto', M: 'size-3400' }}>
								<Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700, fontSize: '16px' }}
									onPress={() => setSelected(selectedId === o.id ? -1 : o.id)}>
									{o.id === 0 ? 'Finance baru' : `${o.name} - (${o.shortName})`}
								</Link>
							</View>
							<View flex width={'auto'}>
								<div>{o?.street}{o.city ? `, ${o.city}` : ''}
									{o.zip ? ` - ${o.zip}` : ''}
								</div>
								<div>{o.phone ? `Telp. ${o.phone}` : ''}
									{o.cell && o.phone ? ` / ` : ''}
									{o.cell && o.phone === '' ? `Cellular: ` : ''}
									{o.cell ?? ''}
								</div>
								<div>{o.email ? `e-mail: ${o.email}` : ''}</div>
							</View>
						</Flex>
						<Divider size={'S'} />
					</View>
			})}
		</Fragment>
	);

	function formResponse(params: { method: string, data?: iFinance }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				fin.insert(data)
			} else {
				fin.update(data.id, data)
			}
		} else if (method === 'remove' && data) {
			fin.remove(data.id)
		}

		setSelected(-1)
	}
}

export default Finance;