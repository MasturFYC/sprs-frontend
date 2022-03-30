import React, { FormEvent, useRef, useState } from "react";
import { dateOnly, dateParam, iAccountSpecific, iLoanDetail } from 'lib/interfaces'
import { View } from "@react-spectrum/view";
import { FormatDate, FormatNumber } from "lib/format";
import axios from 'lib/axios-base';

import 'Report/report.css'
import {
	ComboBox, Text, DialogContainer, Divider, Flex, Heading, Item,
	NumberField, TextField, useAsyncList, Button, Link, ActionButton, Form
} from "@adobe/react-spectrum";
import AddToSelection from "@spectrum-icons/workflow/AddToSelection";



const initLoadDetail: iLoanDetail = {
	loanId: 0,
	paymentAt: dateParam(null),
	id: 0,
	debt: 0,
	cred: 0,
	cashId: 0
}


export interface LoanDetailSaldo extends iLoanDetail {
	saldo: number
}

type LoanListDetailProps = {
	details?: LoanDetailSaldo[] | undefined
}

const LoanListDetails = ({ details }: LoanListDetailProps) => {
	const [open, setOpen] = React.useState(false)
	let [detail, setDetail] = useState<iLoanDetail>(initLoadDetail)

	return (
		<View>

			<View marginY={'size-200'}><span className="div-h2">Daftar Angsuran</span></View>

			<DialogContainer type={'modal'} onDismiss={() => setOpen(false)} isDismissable>
				{open &&
					<View>
						<Heading marginStart={'size-200'}>Angsuran</Heading>
						<Divider size='S' />
						<View marginX={'size-200'} marginTop={'size-100'}>
							<FormDetail detail={detail}
								onCancel={() => setOpen(false)}
								onInsert={(e) => {
									setDetail(e)
									setOpen(false)
								}}
								onUpdate={(id, e) => {
									setDetail(e)
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
						<td className="text-center">{FormatDate(o.paymentAt)}</td>
						<td><Link onPress={() => setDetail(o)} isQuiet variant="primary">{o.descripts || '---'}</Link></td>
						<td className="text-right">{FormatNumber(o.debt)}</td>
						<td className="text-right">{FormatNumber(o.cred)}</td>
						<td className="text-right">{FormatNumber(o.saldo)}</td>
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
		return details ? details.reduce((t, c) => t + c.debt, 0) : 0
	}
	function getDetailCred() {
		return details ? details.reduce((t, c) => t + c.cred, 0) : 0
	}
	function getDetailSaldo() {
		return details ? details.reduce((t, c) => t + c.saldo, 0) : 0
	}

}

type FormDetailProps = {
	detail: iLoanDetail
	onCancel?: (id: number) => void
	onInsert?: (data: iLoanDetail) => void
	onUpdate?: (id: number, data: iLoanDetail) => void
	onDelete?: (id: number) => void
}
function FormDetail({ detail, onCancel, onUpdate, onInsert, onDelete }: FormDetailProps) {
	const inputRef = useRef<HTMLDivElement>(null);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	let [data, setData] = useState<iLoanDetail>(initLoadDetail)


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
		() => data.descripts ? data.descripts.length > 5 : false,
		[data]
	)

	const isAccValid = React.useMemo(
		() => data.cashId > 0,
		[data]
	)

	const isCredValid = React.useMemo(
		() => data.cred > 0,
		[data]
	)

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setData(detail)
		}

		return () => { isLoaded = false }
	}, [detail])

	return (<Form onSubmit={handleSubmit}>
		<Flex rowGap='size-200' direction={'column'}>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>
				<TextField
					type={'date'}
					label='Tanggal'
					width={{ base: 'auto', M: 'size-2000' }}
					value={dateOnly(data.paymentAt)}
					maxLength={10}
					onChange={(e) => handleChange("paymentAt", e)}
				/>
				<div ref={inputRef} style={{ display: 'flex', width: '100%' }}>
					<TextField
						flex
						label='Deskripsi'
						autoFocus
						width={{ base: 'auto', L: 'size-5000' }}
						validationState={isDescriptionsValid ? 'valid' : 'invalid'}
						placeholder={'e.g. Beli kopi dan rokok untuk om Mastur.'}
						value={data.descripts || ''}
						maxLength={128}
						onChange={(e) => handleChange("descripts", e)}
					/>
				</div>
			</Flex>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>

				<NumberField
					hideStepper={true}
					width={{ base: 'auto', M: 'size-2000' }}
					validationState={isCredValid ? 'valid' : 'invalid'}
					label={"Jumlah angsuran"}
					onChange={(e) => handleChange("cred", e)}
					value={data.cred} />
				<ComboBox
					flex
					menuTrigger='focus'
					width={{ base: 'auto', L: 'size-5000' }}
					validationState={isAccValid ? 'valid' : 'invalid'}
					label={"Akun kas"}
					placeholder={"e.g. Kas / bank"}
					defaultItems={accountCashes.items}
					selectedKey={data.cashId}
					onSelectionChange={(e) => handleChange("cashId", +e)}
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
				isDisabled={!isDirty || !(isDescriptionsValid && isAccValid && isCredValid)}>Save</Button>
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
		if (isDescriptionsValid && isAccValid && isCredValid) {
			if (data.id === 0) {
				onInsert && onInsert(data)
			} else {
				onUpdate && onUpdate(detail.id, data)
			}
		}
	}
}

export default LoanListDetails;