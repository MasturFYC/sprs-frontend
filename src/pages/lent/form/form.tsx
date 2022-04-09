import React, { FormEvent, useState } from 'react';
import { dateOnly, dateParam, iLent } from 'lib/interfaces'
import { Button, Flex, TextField, View, ActionButton, Text } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
import { lentUnit, lentTrx } from '../interfaces';
import SelectUnit from '@spectrum-icons/workflow/BreakdownAdd';

const ListUnit = React.lazy(() => import('./ListUnit'));

interface tsItem extends iLent {
	unit: lentUnit,
	trx: lentTrx
}

const initLent: tsItem = {
	unit: {
		id: 0,
		name: '',
		orderAt: dateParam(null),
		btFinance: 0,
		btPercent: 0,
		btMatel: 0,
		nopol: '',
		year: 0,
		type: '',
		wheel: '',
		merk: ''
	},
	trx: {
		id: 0,
		refId: 0,
		division: 'trx-lent',
		trxDate: dateParam(null),
		memo: '',
		detail: {
			id: 0,
			trxId: 0,
			codeId: 0,
			debt: 0,
			cred: 0,
			saldo: 0
		}
	},
	orderId: 0,
	name: ''
}



type LentFormProps = {
	data: tsItem
	onInsert?: (lent: tsItem) => void
	onUpdate?: (id: number, lent: iLent) => void
	onDelete?: (id: number) => void
	onCancel?: (id: number) => void
}

const LentForm = ({ data, onInsert, onUpdate, onDelete, onCancel }: LentFormProps) => {
	const [lent, setLent] = useState<tsItem>(initLent)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);
	let [isNew, setIsNew] = useState(false)
	let [showUnit, setShowUnit] = useState(false)

	const isDescriptionsValid = React.useMemo(
		() => {
			if (lent.trx.descriptions) {
				return lent.trx.descriptions.length >= 5
			}
			return false
		},
		[lent]
	)

	const isBtMatelValid = React.useMemo(
		() => lent.trx.detail.cred > 0
		, [lent])

	const isNameValid = React.useMemo(
		() => lent.name.length >= 3,
		[lent]
	)

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setLent(data)
			setIsNew(data.orderId === 0)
		}

		return () => { isLoaded = true }

	}, [data])


	return (
		<View>
			<form onSubmit={(e) => handleSubmit(e)}>
				<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isBtMatelValid && isDescriptionsValid)}>Save</Button>
						<Button type='button' variant='primary' onPress={() => onCancel && onCancel(isNew ? 0 : lent.orderId)}>
							{isDirty ? 'Cancel' : 'Close'}</Button>
					</Flex>
					<View>
						<Button type='button'
							isDisabled={isNew}
							alignSelf={'flex-end'} variant='negative'
							onPress={() => deleteData(lent.orderId)}>Remove</Button>
					</View>
				</Flex>
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
								onChange={(e) => {
									setLent(o => ({ ...o, name: e }))
									setIsDirty(true)
								}}
							/>
							<TextField
								flex
								label={<div className='width-80'>Keterangan</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								validationState={isDescriptionsValid ? "valid" : "invalid"}
								value={lent.trx.descriptions || ''}
								placeholder={'e.g. Indramayu'}
								maxLength={50}
								onChange={(e) => {
									setLent(o => ({ ...o, trx: { ...o.trx, descriptions: e } }))
									setIsDirty(true)
								}}
							/>
						</Flex>
						<Flex flex direction={'column'} rowGap='size-75'>
							<TextField
								flex
								label={<div className='width-80'>Jalan</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={lent.street || ''}
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
								value={lent.city || ''}
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
								value={lent.phone || ''}
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
								value={lent.cell || ''}
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
								value={lent.zip || ''}
								placeholder={'e.g. 45215'}
								maxLength={10}
								onChange={(e) => handleChange("zip", e)}
							/>
						</Flex>
					</Flex>
				</View>
			</form>
			{isNew && <View><ActionButton isQuiet onPress={()=>setShowUnit(!showUnit)}>
				<SelectUnit size="S" />
				<Text>Pilih unit</Text>
				</ActionButton>
				</View>}
			{showUnit &&
				<View>
					<React.Suspense fallback={<div>Please wait...</div>}>
						<ListUnit
							onSelectionChange={(e) => {
								setLent(o => ({
									...o,
									unit: e,
									orderId: e.id,
									trx: {
										...o.trx, refId: e.id,
										detail: {
											...o.trx.detail,
											cred: e.btMatel,
											saldo: e.btMatel
										}
									}
								}))
							}}
						/>
					</React.Suspense>
				</View>
			}
		</View>

	);

	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setLent(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()

		if (isNew) {
			await inserData();
		} else {
			await updateData();
		}
	}

	async function updateData() {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const t_lent = {
			orderId: lent.orderId,
			name: lent.name,
			street: lent.street,
			city: lent.city,
			phone: lent.phone,
			cell: lent.cell,
			zip: lent.zip			
		}

		const xData = JSON.stringify({...t_lent, descriptions: lent.trx.descriptions})

		await axios
			.put(`/lent/${lent.orderId}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onUpdate && onUpdate(lent.orderId, t_lent)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData() {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const t_lent = {
			orderId: lent.orderId,
			name: lent.name,
			street: lent.street,
			city: lent.city,
			phone: lent.phone,
			cell: lent.cell,
			zip: lent.zip

		}
		const t_rx = {
			id: lent.trx.id,
			refId: lent.trx.refId,
			division: 'trx-lent',
			descriptions: lent.trx.descriptions,
			trxDate: dateOnly(lent.trx.trxDate),
			memo: lent.trx.memo,
			details: [
				{
					id: 1,
					codeId: 5513,
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
			lent: t_lent,
			trx: t_rx,
			token: [lent.trx.descriptions || ' ', lent.trx.memo || ' ', lent.name].join(" ")
		})

		await axios
			.post(`/lent`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onInsert && onInsert(lent)
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
			.delete(`/lent/${p}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onDelete && onDelete(p)
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default LentForm;