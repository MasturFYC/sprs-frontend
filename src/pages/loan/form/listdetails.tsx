import React, { FormEvent, useRef, useState } from "react";
import { dateOnly, dateParam, iAccountSpecific, iLoan } from 'lib/interfaces'
import { View } from "@react-spectrum/view";
import { FormatDate, FormatNumber } from "lib/format";
import axios from 'lib/axios-base';

import 'Report/report.css'
import {
	ComboBox, Text, DialogContainer, Divider, Flex, Heading, Item,
	NumberField, TextField, useAsyncList, Button, Link, ActionButton, Form
} from "@adobe/react-spectrum";
import AddToSelection from "@spectrum-icons/workflow/AddToSelection";

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

interface Loan extends iLoan {
	trx: Trx[]
}

const initLoadDetail: Loan = {
	id: 0,
	name: "",
	Persen: 0,
	trx: []
}


type LoanListDetailProps = {
	details: Loan[]
}

const LoanListDetails = ({ details }: LoanListDetailProps) => {
	const [open, setOpen] = React.useState(false)
	let [loan, setDetail] = useState<Loan>(initLoadDetail)

	return (
		<View>

			<View marginY={'size-200'}><span className="div-h2">Daftar Angsuran</span></View>

			<DialogContainer type={'modal'} onDismiss={() => setOpen(false)} isDismissable>
				{open &&
					<View>
						<Heading marginStart={'size-200'}>Angsuran</Heading>
						<Divider size='S' />
						<View marginX={'size-200'} marginTop={'size-100'}>
							<FormDetail trx={loan.trx[0]}
								onCancel={() => setOpen(false)}
								onInsert={(e) => {
									//setDetail(o => ({...o, trx: e}))
									setOpen(false)
								}}
								onUpdate={(id, e) => {
									//setDetail(o => ({ ...o, trx: e }))
									setOpen(false)
								}}
							/>
						</View>
					</View>}
			</DialogContainer>

			<table className="table-small width-100-percent collapse-none" cellPadding={4}>
				<thead>
					<tr>
						<th className="text-center">NO</th>
						<th className="text-center">TANGGAL</th>
						<th className="text-left">DESKRIPSI</th>
						<th className="text-right">DEBET</th>
						<th className="text-right">KREDIT</th>
						<th className="text-right">SALDO</th>
					</tr>
				</thead>
				<tbody>
					{details && details.map((o, i) => <tr key={o.id}>
						<td className="text-center">{i + 1}</td>
						<td className="text-center">{FormatDate(o.trx[0].trxDate || dateParam(null))}</td>
						<td><Link onPress={() => setDetail(o)} isQuiet variant="primary">{o.trx[0].descriptions || '---'}</Link></td>
						<td className="text-right">{FormatNumber(o.trx[0].detail.debt)}</td>
						<td className="text-right">{FormatNumber(o.trx[0].detail.cred)}</td>
						<td className="text-right">{FormatNumber(o.trx[0].detail.saldo)}</td>
					</tr>
					)}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={3}>Total: {getDetailLength()} items</td>
						<td className="text-right font-bold">{details && FormatNumber(getDetailDebt())}</td>
						<td className="text-right font-bold">{details && FormatNumber(getDetailCred())}</td>
						<td className="text-right font-bold">{details && FormatNumber(getDetailSaldo())}</td>
					</tr>
				</tfoot>
			</table>
			<View marginY={'size-100'}>
				<ActionButton isQuiet onPress={() => setOpen(!open)}>
					<AddToSelection size="S" />
					<Text>Tambah angsuran</Text>
				</ActionButton>
			</View>
		</View>
	);

	function getDetailLength() {
		return details ? details.length : 0
	}

	function getDetailDebt() {
		return details.reduce((t, c) => t + c.trx[0].detail.debt, 0)
	}
	function getDetailCred() {
		return details.reduce((t, c) => t + c.trx[0].detail.cred, 0)
	}
	function getDetailSaldo() {
		return details.reduce((t, c) => t + c.trx[0].detail.saldo, 0)
	}

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
	division: "",
	trxDate: "",
	detail: initDetail
}

type FormDetailProps = {
	trx: Trx
	onCancel?: (id: number) => void
	onInsert?: (data: Trx) => void
	onUpdate?: (id: number, data: Trx) => void
	onDelete?: (id: number) => void
}
function FormDetail({ trx, onCancel, onUpdate, onInsert, onDelete }: FormDetailProps) {
	const inputRef = useRef<HTMLDivElement>(null);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	let [data, setData] = useState<Trx>(initTrx)
	let [detail, setDetail] = useState<TrxDetail>(initDetail)
	let [cred, setCred] = useState(0.0)
	let [code, setCode] = useState(0)


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
		() => data.descriptions ? data.descriptions.length > 5 : false,
		[data]
	)

	const isCredValid = React.useMemo(() => cred > 0, [cred])
	const isCodeValid = React.useMemo(() => code > 0, [code])

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setData(trx)
			setDetail(trx.detail)
		}

		return () => { isLoaded = false }
	}, [trx])

	return (<Form onSubmit={handleSubmit}>
		<Flex rowGap='size-200' direction={'column'}>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>
				<TextField
					type={'date'}
					label='Tanggal'
					width={{ base: 'auto', M: 'size-2000' }}
					value={dateOnly(data.trxDate)}
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
						value={data.descriptions || ''}
						maxLength={128}
						onChange={(e) => handleChange("descriptions", e)}
					/>
				</div>
			</Flex>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>

				<NumberField
					hideStepper={true}
					width={{ base: 'auto', M: 'size-2000' }}
					validationState={isCredValid ? 'valid' : 'invalid'}
					label={"Jumlah angsuran"}
					onChange={(e) => setDetail(o => ({ ...o, cred: e })) }
					value={detail.cred} />
				<ComboBox
					flex
					menuTrigger='focus'
					width={{ base: 'auto', L: 'size-5000' }}
					validationState={isCodeValid ? 'valid' : 'invalid'}
					label={"Akun kas"}
					placeholder={"e.g. Kas / bank"}
					defaultItems={accountCashes.items}
					selectedKey={detail.codeId}
					onSelectionChange={(e) => setDetail(o => ({ ...o, codeId: +e}))}
				>
					{(item) => <Item textValue={`${item.id} - ${item.name}`}>
						<Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
						<Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
					</Item>}
				</ComboBox>
			</Flex>
		</Flex>

		<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
			<Button type='submit' variant='cta'
				isDisabled={!isDirty || !(isDescriptionsValid && isCodeValid && isCredValid)}>Save</Button>
			<Button type='button' variant='primary'
				onPress={() => {
					onCancel && onCancel(data.id)
				}}
			>
				{isDirty ? 'Cancel' : 'Close'}</Button>
		</Flex>
	</Form >);


	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}


	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (data.id === 0) {
			onInsert && onInsert(data)
		} else {
			onUpdate && onUpdate(trx.id, data)
		}
	}
}

export default LoanListDetails;