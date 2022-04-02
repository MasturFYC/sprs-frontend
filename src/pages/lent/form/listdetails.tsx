import React, { FormEvent, useRef, useState } from "react";
import { dateOnly, dateParam, iAccountSpecific } from 'lib/interfaces'
import { View } from "@react-spectrum/view";
import { FormatDate, FormatNumber } from "lib/format";
import axios from 'lib/axios-base';

import 'Report/report.css'
import {
	ComboBox, Text, DialogContainer, Divider, Flex, Heading, Item,
	NumberField, TextField, useAsyncList, Button, Link, ActionButton, Form
} from "@adobe/react-spectrum";
import AddToSelection from "@spectrum-icons/workflow/AddToSelection";
// import { PrettyPrintJson } from "lib/utils";

type TrxDetail = {
	groupId: number,
	id: number,
	trxId: number,
	codeId: number,
	debt: number,
	cred: number,
	saldo: number
}

type Trx = {
	id: number,
	refId: number,
	division: string,
	trxDate: string,
	descriptions?: string | undefined,
	memo?: string | undefined,
	detail: TrxDetail
}

type lentListDetailProps = {
	lentId: number,
	name: string,
	trxs: Trx[],
	onChange?: (id: number, data: Trx) => void
	onDelete?: (id: number) => void
}

const LentListDetails = ({ trxs, onChange, onDelete, name, lentId }: lentListDetailProps) => {
	const [open, setOpen] = React.useState(false)
	let [trx, setTrx] = useState<Trx>(initTrx)

	return (
		<View>

			<View marginY={'size-200'}><span className="div-h2">Daftar Angsuran</span></View>

			<DialogContainer type={'modal'} onDismiss={() => setOpen(false)} isDismissable>
				{open &&
					<View>
						<Heading marginStart={'size-200'}>Angsuran</Heading>
						<Divider size='S' />
						<View marginX={'size-200'} marginTop={'size-100'}>
							<FormDetail name={name} lentId={lentId} editedTrx={trx}
								onDelete={(id) => {
									onDelete && onDelete(id)
								}}
								onCancel={() => setOpen(false)}
								// onInsert={(e) => {
								// 	//setDetail(o => ({...o, trx: e}))
								// 	setOpen(false)
								// }}
								onUpdate={(id, e) => {
									//setDetail(o => ({ ...o, trx: e }))
									setTrx(e)
									setOpen(false)
									onChange && onChange(trx.id, e)
								}}
							/>
						</View>
					</View>}
			</DialogContainer>

			<table className="table-small collapse-none" cellPadding={5}>
				<thead>
					<tr className="border-b-1 border-t-1 bg-green text-white">
						<th className="text-center">NO</th>
						<th className="text-center">TANGGAL</th>
						<th className="text-left">DESKRIPSI</th>
						<th className="text-right">ANGSURAN</th>
						{/* <th className="text-right">KREDIT</th> */}
						{/* <th className="text-right">SALDO</th> */}
					</tr>
				</thead>
				<tbody>
					{trxs && trxs.map((o, i) => <tr key={o.id} className="border-b-gray-50">
						<td className="text-center">{i + 1}</td>
						<td className="text-center">{FormatDate(o.trxDate || dateParam(null))}</td>
						<td><Link onPress={() => {
							setOpen(true)
							setTrx(o)
						}} isQuiet variant="primary">{o.descriptions || '---'}</Link></td>
						<td className="text-right">{FormatNumber(o.detail.debt)}</td>
						{/* <td className="text-right">{FormatNumber(o.detail.cred)}</td>
						<td className="text-right">{FormatNumber(o.detail.saldo)}</td> */}
					</tr>
					)}
				</tbody>
				<tfoot>
					<tr className="border-b-1">
						<td className="border-t-1" colSpan={3}>Total: {getDetailLength()} items</td>
						<td className="text-right border-t-1 font-bold">{trxs && FormatNumber(getDetailDebt())}</td>
						{/* <td className="text-right border-t-1 font-bold">{trxs && FormatNumber(getDetailCred())}</td>
						<td className="text-right border-t-1 font-bold">{trxs && FormatNumber(getDetailSaldo())}</td> */}
					</tr>
				</tfoot>
			</table>
			<View marginY={'size-100'}>
				<ActionButton isQuiet onPress={() => {
					setTrx(initTrx)
					setOpen(!open)
				}}>
					<AddToSelection size="S" />
					<Text>Tambah angsuran</Text>
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
	// function getDetailCred() {
	// 	return trxs.reduce((t, c) => t + c.detail.cred, 0)
	// }
	// function getDetailSaldo() {
	// 	return trxs.reduce((t, c) => t + c.detail.saldo, 0)
	// }

}

const initDetail: TrxDetail = {
	groupId: 0,
	id: 0,
	trxId: 0,
	codeId: 0,
	debt: 0,
	cred: 0,
	saldo: 0
}

const initTrx: Trx = {
	id: 0,
	refId: 0,
	division: "trx-angsuran",
	trxDate: dateParam(null),
	detail: initDetail
}

type FormDetailProps = {
	lentId: number
	editedTrx: Trx
	name: string
	onCancel?: (id: number) => void
	onInsert?: (data: Trx) => void
	onUpdate?: (id: number, data: Trx) => void
	onDelete?: (id: number) => void
}
function FormDetail({ lentId, name, editedTrx, onCancel, onUpdate, onInsert, onDelete }: FormDetailProps) {
	const inputRef = useRef<HTMLDivElement>(null);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	let [trx, setTrx] = useState<Trx>(initTrx)


	let accountCashes = useAsyncList<iAccountSpecific>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/acc-code/spec/1", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data
				})
				.catch(error => {
					console.log(error)
				})

			return { items: res }
		},
		getKey: (item: iAccountSpecific) => item.id
	})

	const isDescriptionsValid = React.useMemo(
		() => trx.descriptions ? trx.descriptions.length > 5 : false,
		[trx]
	)

	const isDebtValid = React.useMemo(() => trx.detail.debt > 0, [trx.detail])
	const isCodeValid = React.useMemo(() => trx.detail.codeId > 0, [trx.detail])

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setTrx({ ...editedTrx, refId: lentId })
		}

		return () => { isLoaded = false }
	}, [editedTrx, lentId])

	return (<Form onSubmit={handleSubmit}>
		<Flex rowGap='size-200' direction={'column'}>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>
				<TextField
					type={'date'}
					label='Tanggal'
					width={{ base: 'auto', M: 'size-2000' }}
					value={dateOnly(trx.trxDate)}
					maxLength={10}
					onChange={(e) => handleChange("trxDate", e)}
				/>
				<div ref={inputRef} style={{ display: 'flex', width: '100%' }}>
					<TextField
						flex
						label='Deskripsi'
						autoFocus
						width={{ base: 'auto', L: 'size-5000' }}
						validationState={isDescriptionsValid ? 'valid' : 'invalid'}
						placeholder={'e.g. Angsuran 1.'}
						value={trx.descriptions || ''}
						maxLength={128}
						onChange={(e) => handleChange("descriptions", e)}
					/>
				</div>
			</Flex>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>

				<NumberField
					hideStepper={true}
					width={{ base: 'auto', M: 'size-2000' }}
					validationState={isDebtValid ? 'valid' : 'invalid'}
					label={"Jumlah angsuran"}
					onChange={(e) => {
						setTrx(o => ({ ...o, detail: { ...o.detail, debt: e } }))
						setIsDirty(true)
						setTrx(o => ({ ...o, detail: { ...o.detail, saldo: e } }))
					}}
					value={trx.detail.debt} />
				<ComboBox
					flex
					menuTrigger='focus'
					width={{ base: 'auto', L: 'size-5000' }}
					validationState={isCodeValid ? 'valid' : 'invalid'}
					label={"Akun kas"}
					placeholder={"e.g. Kas / bank"}
					defaultItems={accountCashes.items}
					selectedKey={trx.detail.codeId}
					onSelectionChange={(e) => {
						setTrx(o => ({ ...o, detail: { ...o.detail, codeId: +e } }))
						setIsDirty(true)
					}}
				>
					{(item) => <Item textValue={`${item.id} - ${item.name}`}>
						<Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
						<Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
					</Item>}
				</ComboBox>
			</Flex>
		</Flex>

		{/* <View>
			<PrettyPrintJson data={trx} />
		</View> */}

		<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
			<Button type='submit' variant='cta'
				isDisabled={!isDirty || !(isDescriptionsValid && isCodeValid && isDebtValid)}>Save</Button>
			<Button type='button' variant='primary'
				onPress={() => {
					onCancel && onCancel(trx.id)
				}}
			>
				{isDirty ? 'Cancel' : 'Close'}</Button>
		</Flex>
	</Form >);


	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setTrx(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}


	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		inserData(trx)

	}

	async function inserData(p: Trx) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const t_rx = {
			id: p.id,
			refId: lentId,
			division: 'trx-angsuran',
			descriptions: p.descriptions,
			trxDate: dateOnly(p.trxDate),
			memo: ['Angsuran', name].join(" "),
			details: [
				{
					id: 1,
					codeId: p.detail.codeId,
					trxId: p.id,
					debt: p.detail.debt,
					cred: 0
				},
				{
					id: 2,
					codeId: 4113,
					trxId: p.id,
					debt: 0,
					cred: p.detail.debt
				}
			]
		}


		const xData = JSON.stringify({
			trx: t_rx,
			token: [trx.descriptions || ' ', trx.memo].join(" ")
		})

		await axios
			.post(`/lents/payment/${trx.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				if (trx.id === 0) {
					const t = { ...p, id: data.id, detail: { ...t_rx.details[0], trxId: data.id, groupId: 0, saldo: p.detail.debt } }
					setTrx(t)
					onInsert && onInsert(t)
				}
				onUpdate && onUpdate(lentId, { ...trx, id: data.id, detail: { ...t_rx.details[0], trxId: data.id, groupId: 0, saldo: p.detail.debt } })
			})
			.catch(error => {
				console.log(error)
			})
	}

}


export default LentListDetails;