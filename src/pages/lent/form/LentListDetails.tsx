import React, { useState } from "react";
import { dateParam } from 'lib/interfaces'
import { View } from "@react-spectrum/view";


import {
	Text, DialogContainer, Divider, Heading, Link, ActionButton,
} from "@adobe/react-spectrum";

import { FormatDate, FormatNumber } from "lib/format";
// import { PrettyPrintJson } from 'lib/utils'

import AddToSelection from "@spectrum-icons/workflow/AddToSelection";
import { lentTrx } from "../interfaces";
import { initTrx, FormPayment } from '../FormPayment';


type lentListDetailProps = {
	lentId: number,
	name: string,
	trxs: lentTrx[],
	onChange?: (id: number, data: lentTrx) => void
	onDelete?: (id: number) => void
}

const LentListDetails = ({ trxs, onChange, onDelete, name, lentId }: lentListDetailProps) => {
	const [isOpen, setOpen] = React.useState(false)
	const [trx, setTrx] = useState<lentTrx>(initTrx)

	return (
		<View>

			<View marginY={'size-200'}><span className="div-h2">Daftar Cicilan</span></View>

			<DialogContainer type={'modal'} onDismiss={() => setOpen(false)} isDismissable>
				{isOpen && <View>
					<Heading marginStart={'size-200'}>Cicilan</Heading>
					<Divider size='S' />
					<View marginX={'size-200'} marginTop={'size-100'}>
						<FormPayment name={name} trxData={{ ...trx, refId: lentId }}
							onDelete={(id) => {
								onDelete && onDelete(id)
							}}
							onCancel={() => setOpen(false)}
							onUpdate={(id, e) => {
								setTrx(e)
								setOpen(false)
								onChange && onChange(trx.id, e)
							}}
						/>
					</View>
				</View>}
			</DialogContainer>

			<table className="table-small collapse-none" cellPadding={6}>
				<thead>
					<tr className="border-b-1 border-t-1 bg-green-600 text-white">
						<th className="text-center">NO</th>
						<th className="text-center">TANGGAL</th>
						<th className="text-left">DESKRIPSI</th>
						<th className="text-right">CICILAN</th>
					</tr>
				</thead>
				<tbody>
					{trxs && trxs.map((o, i) => <tr key={o.id} className="border-b-gray-50">
						<td className="text-center">{i + 1}</td>
						<td className="text-center">{FormatDate(o.trxDate || dateParam(null))}</td>
						<td><Link onPress={() => {
							setTrx(o)
							setOpen(true)
						}} isQuiet variant="primary">{o.descriptions || '---'}</Link></td>
						<td className="text-right">{FormatNumber(o.detail.debt)}</td>
					</tr>
					)}
				</tbody>
				<tfoot>
					<tr className="border-b-1">
						<td className="border-t-1" colSpan={3}>Total: {getDetailLength()} items</td>
						<td className="text-right border-t-1 font-bold">{trxs && FormatNumber(getDetailDebt())}</td>
					</tr>
				</tfoot>
			</table>
			<View marginY={'size-100'}>
				<ActionButton isQuiet onPress={() => {
					setTrx(initTrx)
					setOpen(!isOpen)
				}}>
					<AddToSelection size="S" />
					<Text>Tambah Cicilan</Text>
				</ActionButton>
			</View>
		</View>
	);

	function getDetailLength() {
		return trxs ? trxs.length : 0
	}

	function getDetailDebt() {
		return trxs.reduce((t, c) => t + c.detail.debt, 0)
	}

}

export default LentListDetails;