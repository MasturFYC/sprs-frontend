import React, { FormEvent, useState } from 'react';
import { dateOnly, dateParam, iAccountSpecific, iLoan } from 'lib/interfaces'
import { Button, ComboBox, Flex, Item, Text, NumberField, TextField, View, useAsyncList } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';

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

const initLoan: Loan = {
	trx: [],
	id: 0,
	name: '',
	Persen: 0
}

const initTrx: Trx = {
	id: 0,
	refId: 0,
	division: '',
	trxDate: dateParam(null),
	detail: {
		groupId: 0,
		id: 0,
		trxId: 0,
		codeId: 0,
		debt: 0,
		cred: 0,
		saldo: 0
	}
}

type LoanFormProps = {
	data: Loan
	onInsert?: (loan: Loan) => void
	onUpdate?: (id: number, loan: Loan) => void
	onDelete?: (id: number) => void
	onCancel?: (id: number) => void
}

const LoanForm = ({ data, onInsert, onUpdate, onDelete, onCancel }: LoanFormProps) => {
	const [loan, setLoan] = useState<Loan>(initLoan)
	const [trx, setTrx] = useState<Trx>(initTrx)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isDescriptionsValid = React.useMemo(
		() => loan.name.length >= 3,
		[loan]
	)

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

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setLoan(data);
			setTrx(data.trx[0])
		}

		return () => { isLoaded = true }

	}, [data])


	return (
		<View>

			<form onSubmit={(e) => handleSubmit(e)}>
				<View padding={{ base: 'size-50', M: 'size-200' }}>
					<Flex gap='size-200' direction={'column'}>
						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<TextField
								flex
								autoFocus
								label={<div className='width-70'>Nama</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.name}
								placeholder={'e.g. Junaedi'}
								validationState={isDescriptionsValid ? "valid" : "invalid"}
								maxLength={50}
								onChange={(e) => handleChange("name", e)}
							/>
							<TextField
								flex
								type={'date'}
								label={<div className='width-70'>Tanggal</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={dateOnly(trx.trxDate)}
								onChange={(e) => setTrx(o => ({ ...o, trxDate: e }))}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<NumberField
							flex
								hideStepper={true}
								labelPosition='side'
								labelAlign='end'
								width={{ base: 'auto', M: 'size-2000' }}
								label={<div className='width-70'>Piutang</div>}
								onChange={(e) => setTrx(o => ({ ...o, detail: { ...o.detail, debt: e } }))}
								value={trx.detail.debt} />
							<ComboBox
								flex
								menuTrigger='focus'
								labelAlign='end'
								label={<div className='width-70'>Dari kas</div>}
								labelPosition='side'
								validationState={trx.detail.codeId > 0 ? 'valid' : 'invalid'}								
								placeholder={"e.g. Kas / bank"}
								defaultItems={accountCashes.items}
								selectedKey={trx.detail.codeId}
								onSelectionChange={(e) => setTrx(o => ({ ...o, detail: { ...o.detail, codeId: +e } }))}
							>
								{(item) => <Item textValue={`${item.id} - ${item.name}`}>
									<Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
									<Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
								</Item>}
							</ComboBox>								
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>

						<TextField
							flex
							label={<div className='width-70'>Alamat</div>}
							labelAlign='end'
							labelPosition='side'
							width={'auto'}
							value={loan.street}
							placeholder={'e.g. Jl. Jend. Sudirman No. 155'}
							maxLength={50}
							onChange={(e) => handleChange("street", e)}
						/>
						<TextField
							flex
							label={<div className='width-70'>Keterangan</div>}
							labelAlign='end'
							labelPosition='side'
							width={'auto'}
							value={trx.descriptions}
							placeholder={'e.g. Indramayu'}
							maxLength={50}
							onChange={(e) => setTrx(o => ({ ...o, descriptions: e }))}
						/>
						</Flex>

						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<TextField
								flex
								label={<div className='width-70'>Kota</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.city}
								placeholder={'e.g. Indramayu'}
								maxLength={50}
								onChange={(e) => handleChange("city", e)}
							/>
							<TextField
								flex
								label={<div className='width-70'>Telephone</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.phone}
								placeholder={'e.g. 0234 275572'}
								maxLength={25}
								onChange={(e) => handleChange("phone", e)}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-200'>
							<TextField
								flex
								label={<div className='width-70'>Cellular</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.cell}
								placeholder={'e.g. 0856 9865 9854'}
								maxLength={25}
								onChange={(e) => handleChange("cell", e)}
							/>
							<TextField
								flex
								label={<div className='width-70'>Kode pos</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.zip}
								placeholder={'e.g. 45215'}
								maxLength={10}
								onChange={(e) => handleChange("zip", e)}
							/>
						</Flex>
					</Flex>
					<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
						<Flex flex direction={'row'} columnGap={'size-100'}>
							<Button type='submit' variant='cta' isDisabled={!isDirty || !(isDescriptionsValid)}>Save</Button>
							<Button type='button' variant='primary' onPress={() => onCancel && onCancel(loan.id)}>
								{isDirty ? 'Cancel' : 'Close'}</Button>
						</Flex>
						{loan.id > 0 &&
							<View>
								<Button type='button'
									isDisabled={loan.id === 0}
									alignSelf={'flex-end'} variant='negative'
									onPress={() => deleteData(loan.id)}>Remove</Button>
							</View>
						}
					</Flex>
				</View>
			</form>
		</View>

	);

	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setLoan(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()

		if (loan.id === 0) {
			await inserData(loan);
		} else {
			await updateData(loan);
		}
	}

	async function updateData(p: Loan) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}


		const t_loan = {
			id: p.id,
			name: p.name,
			persen: p.Persen,
			street: p.street,
			city: p.city,
			phone: p.phone,
			cell: p.cell,
			zip: p.zip

		}
		const t_rx = {
			id: trx.id,
			refId: p.id,
			division: 'trx-loan',
			descriptions: trx.descriptions,
			trxDate: dateOnly(trx.trxDate),
			memo: trx.memo,
			details: [
				{
					id: 1,
					codeId: 5512,
					trxId: trx.id,
					debt: trx.detail.debt,
					cred: 0
				},
				{
					id: 2,
					codeId: trx.detail.codeId,
					trxId: trx.id,
					debt: 0,
					cred: trx.detail.debt
				}
			],
		}


		const xData = JSON.stringify({
			loan: t_loan,
			trx: t_rx,
			token: [trx.descriptions || ' ', trx.memo || ' ', p.name].join(" ")
		})

		console.log(xData)

		await axios
			.put(`/loans/${p.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onUpdate && onUpdate(p.id, p)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(p: Loan) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const t_loan = {
			id: p.id,
			name: p.name,
			persen: p.Persen,
			street: p.street,
			city: p.city,
			phone: p.phone,
			cell: p.cell,
			zip: p.zip

		}
		const t_rx = {
			id: trx.id,
			refId: p.id,
			division: 'trx-loan',
			descriptions: trx.descriptions,
			trxDate: dateOnly(trx.trxDate),
			memo: trx.memo,
			details: [
				{
					id: 1,
					codeId: 5512,
					trxId: trx.id,
					debt: trx.detail.debt,
					cred: 0
				},
				{
					id: 2,
					codeId: trx.detail.codeId,
					trxId: trx.id,
					debt: 0,
					cred: trx.detail.debt
				}
			]
		}

		console.log(t_rx)
	

		const xData = JSON.stringify({
			loan: t_loan,
			trx: t_rx,
			token: [trx.descriptions || ' ', trx.memo || ' ', p.name].join(" ")
		})

		await axios
			.post(`/loans`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onInsert && onInsert({ ...p, id: data.id })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(p: number) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/loans/${p}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onDelete && onDelete(loan.id)
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default LoanForm;