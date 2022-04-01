import React, { FormEvent, useState } from 'react';
import { dateOnly, dateParam, iAccountSpecific, iLent, iTrx } from 'lib/interfaces'
import { Button, ComboBox, Flex, Item, Text, NumberField, TextField, View, useAsyncList } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
import { tOrderInvoiced } from 'Report/interface';
import { tsLent } from '../interfaces';

type ts_lent_create = {
	lent: iLent
	trx: iTrx
	token: string
}

const initLent: tsLent = {
	payment: {
		order_id: 0,
		debt: 0,
		cred: 0,
		saldo: 0
	},
	unit: {
		id: 0,
		name: '',
		orderAt: '',
		btFinance: 0,
		btPercent: 0,
		btMatel: 0,
		nopol: '',
		year: 0,
		type: '',
		wheel: '',
		merk: ''
	},
	orderId: 0,
	name: ''
}


type LentFormProps = {
	data: tsLent
	accCode: iAccountSpecific[]
	onInsert?: (loan: tsLent) => void
	onUpdate?: (id: number, loan: tsLent) => void
	onDelete?: (id: number) => void
	onCancel?: (id: number) => void
}

const LentForm = ({ data, accCode, onInsert, onUpdate, onDelete, onCancel }: LentFormProps) => {
	const [lent, setLent] = useState<tsLent>(initLent)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isDescriptionsValid = React.useMemo(
		() => {
			if (lent.descripts) {
				return lent.descripts.length >= 5
			}
			return false
		},
		[lent]
	)

	const isNameValid = React.useMemo(
		() => lent.name.length >= 3,
		[lent]
	)


	let units = useAsyncList<tOrderInvoiced>({
		async load({ signal }) {
		  const headers = {
			'Content-Type': 'application/json'
		  }
	
		  let res = await axios
			.get("/report/order-all-waiting/0/0/0", { headers: headers })
			.then(response => response.data)
			.then(data => data)
			.catch(error => {
			  console.log(error)
			  return []
			})
		  return { items: res || [] }
		},
		getKey: (item: tOrderInvoiced) => item.id
	  })	

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setLent(data);
		}

		return () => { isLoaded = true }

	}, [data])


	return (
		<View>
			<form onSubmit={(e) => handleSubmit(e)}>
				<View padding={{ base: 'size-50', M: 'size-200' }}>
					<Flex rowGap='size-50' direction={'column'}>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} rowGap={'size-75'}>
							<TextField
								flex
								autoFocus
								label={<div className='width-80'>Nama</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={lent.name}
								placeholder={'e.g. Junaedi'}
								validationState={isNameValid ? "valid" : "invalid"}
								maxLength={50}
								onChange={(e) => handleChange("name", e)}
							/>
							<TextField
								flex
								type={'date'}
								label={<div className='width-80'>Tanggal</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={dateOnly(lent.unit.orderAt)}
								onChange={(e) => {
									setIsDirty(true)
									setLent(o => ({ ...o, unit: {...o.unit, orderAt: e} }))
								}}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} rowGap={'size-75'}>
						<ComboBox
								flex
								menuTrigger='focus'
								labelAlign='end'
								label={<div className='width-80'>Unit</div>}
								labelPosition='side'
								// validationState={isCodeValid ? 'valid' : 'invalid'}
								placeholder={"Pilih unit"}
								defaultItems={units.items}
								selectedKey={lent.payment}
								onSelectionChange={(e) => {
									setIsDirty(true)
									setLent(o => ({ ...o, trx: { ...o.trx, detail: { ...o.trx.detail, codeId: +e } } }))
								}}
							>
								{(item) => <Item textValue={item.unit?.type.name}>
									<Text><div className='font-bold'>{item.unit?.type.name}</div></Text>
									<Text slot='description'>
										{item.unit?.nopol}, tahun {item.unit?.year}
									</Text>
								</Item>}
							</ComboBox>
							<NumberField
								flex
								hideStepper={true}
								labelPosition='side'
								labelAlign='end'
								width={{ base: 'auto', M: 'size-2000' }}
								formatOptions={{ currency: 'IDR', style: 'currency', maximumFractionDigits: 0 }}
								validationState={isPiutangValid ? "valid" : "invalid"}
								label={<div className='width-80'>BT-Matel</div>}
								onChange={(e) => {
									setLent(o => ({ ...o, trx: { ...o.trx, detail: { ...o.trx.detail, cred: e, saldo: -e } } }))
									setIsDirty(true)
								}}
								value={lent.trx.detail.cred} />
							<ComboBox
								flex
								menuTrigger='focus'
								labelAlign='end'
								label={<div className='width-80'>Dari kas</div>}
								labelPosition='side'
								validationState={isCodeValid ? 'valid' : 'invalid'}
								placeholder={"e.g. Kas / bank"}
								defaultItems={accCode}
								selectedKey={lent.trx.detail.codeId}
								onSelectionChange={(e) => {
									setIsDirty(true)
									setLent(o => ({ ...o, trx: { ...o.trx, detail: { ...o.trx.detail, codeId: +e } } }))
								}}
							>
								{(item) => <Item textValue={`${item.id} - ${item.name}`}>
									<Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
									<Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
								</Item>}
							</ComboBox>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} rowGap={'size-75'}>
							<NumberField
								flex
								hideStepper={true}
								labelPosition='side'
								labelAlign='end'
								formatOptions={{ currency: 'IDR', style: 'currency', maximumFractionDigits: 0 }}
								width={{ base: 'auto', M: 'size-2000' }}
								label={<div className='width-80'>BT-Finance</div>}
								value={((lent.persen / 100) * lent.trx.detail.cred) + lent.trx.detail.cred}
								 />

						</Flex>
						<Flex flex direction={'column'} rowGap='size-75'>
							<TextField
								flex
								label={<div className='width-80'>Keterangan</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								validationState={isDescriptionsValid ? "valid" : "invalid"}
								value={lent.trx.descriptions}
								placeholder={'e.g. Indramayu'}
								maxLength={50}
								onChange={(e) => {
									setLent(o => ({ ...o, trx: { ...o.trx, descriptions: e } }))
									setIsDirty(true)
								}}
							/>
							<TextField
								flex
								label={<div className='width-80'>Alamat</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={lent.street}
								placeholder={'e.g. Jl. Jend. Sudirman No. 155'}
								maxLength={50}
								onChange={(e) => handleChange("street", e)}
							/>
						</Flex>

						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} rowGap={'size-75'}>
							<TextField
								flex
								label={<div className='width-80'>Kota</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={lent.city}
								placeholder={'e.g. Indramayu'}
								maxLength={50}
								onChange={(e) => handleChange("city", e)}
							/>
							<TextField
								flex
								label={<div className='width-80'>Telephone</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={lent.phone}
								placeholder={'e.g. 0234 275572'}
								maxLength={25}
								onChange={(e) => handleChange("phone", e)}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} rowGap={'size-75'}>
							<TextField
								flex
								label={<div className='width-80'>Cellular</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={lent.cell}
								placeholder={'e.g. 0856 9865 9854'}
								maxLength={25}
								onChange={(e) => handleChange("cell", e)}
							/>
							<TextField
								flex
								label={<div className='width-80'>Kode pos</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={lent.zip}
								placeholder={'e.g. 45215'}
								maxLength={10}
								onChange={(e) => handleChange("zip", e)}
							/>
						</Flex>
					</Flex>
					<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
						<Flex flex direction={'row'} columnGap={'size-100'}>
							<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isPersenValid && isDescriptionsValid && isPiutangValid && isCodeValid)}>Save</Button>
							<Button type='button' variant='primary' onPress={() => onCancel && onCancel(lent.id)}>
								{isDirty ? 'Cancel' : 'Close'}</Button>
						</Flex>
						{lent.id > 0 &&
							<View>
								<Button type='button'
									isDisabled={lent.id === 0}
									alignSelf={'flex-end'} variant='negative'
									onPress={() => deleteData(lent.id)}>Remove</Button>
							</View>
						}
					</Flex>
				</View>
			</form>
{/* 
			<View>
				<PrettyPrintJson data={loan} />
			</View> */}
		</View>

	);

	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setLent(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()

		if (lent.id === 0) {
			await inserData(lent);
		} else {
			await updateData(lent);
		}
	}

	async function updateData(p: CurrentLent) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}


		const t_loan = {
			id: p.id,
			name: p.name,
			persen: p.persen,
			street: p.street,
			city: p.city,
			phone: p.phone,
			cell: p.cell,
			zip: p.zip

		}
		const t_rx = {
			id: lent.trx.id,
			refId: p.id,
			division: 'trx-loan',
			descriptions: lent.trx.descriptions,
			trxDate: dateOnly(lent.trx.trxDate),
			memo: lent.trx.memo,
			details: [
				{
					id: 1,
					codeId: 5512,
					trxId: lent.trx.id,
					debt: lent.trx.detail.cred,
					cred: 0
				},
				{
					id: 2,
					codeId: lent.trx.detail.codeId,
					trxId: lent.trx.id,
					debt: 0,
					cred: lent.trx.detail.cred
				}
			],
		}


		const xData = JSON.stringify({
			loan: t_loan,
			trx: t_rx,
			token: [lent.trx.descriptions || ' ', lent.trx.memo || ' ', p.name].join(" ")
		})


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

	async function inserData(p: CurrentLent) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const t_loan = {
			id: p.id,
			name: p.name,
			persen: p.persen,
			street: p.street,
			city: p.city,
			phone: p.phone,
			cell: p.cell,
			zip: p.zip

		}
		const t_rx = {
			id: lent.trx.id,
			refId: p.id,
			division: 'trx-loan',
			descriptions: lent.trx.descriptions,
			trxDate: dateOnly(lent.trx.trxDate),
			memo: lent.trx.memo,
			details: [
				{
					id: 1,
					codeId: 5512,
					trxId: lent.trx.id,
					debt: lent.trx.detail.cred,
					cred: 0
				},
				{
					id: 2,
					codeId: lent.trx.detail.codeId,
					trxId: lent.trx.id,
					debt: 0,
					cred: lent.trx.detail.cred
				}
			]
		}

		const xData = JSON.stringify({
			loan: t_loan,
			trx: t_rx,
			token: [lent.trx.descriptions || ' ', lent.trx.memo || ' ', p.name].join(" ")
		})

		await axios
			.post(`/loans`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onInsert && onInsert({
					...p,
					id: data.loan.id,
					trx: {
						...p.trx,
						id: data.trx.id,
						refId: data.loan.id,
						detail: { ...p.trx.detail, trxId: data.trx.id }
					}
				})
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
				onDelete && onDelete(lent.id)
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default LentForm;