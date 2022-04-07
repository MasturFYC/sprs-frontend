import React, { FormEvent, useState } from 'react';
import { dateOnly, dateParam, iAccountSpecific, iLoan } from 'lib/interfaces'
import { Button, ComboBox, Flex, Item, Text, NumberField, TextField, View } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
//import Trx from 'component/trx';
//import { PrettyPrintJson } from 'lib/utils';

export interface CurrentLoan extends iLoan {
	trx: {
		id: number,
		refId: number,
		division: string,
		trxDate: string,
		descriptions?: string | undefined,
		memo?: string | undefined,
		detail: {
			groupId: number,
			id: number,
			trxId: number,
			codeId: number,
			debt: number,
			cred: number,
			saldo: number
		}
	}
}

const initLoan: CurrentLoan = {
	id: 0,
	name: '',
	persen: 10,
	trx: {
		id: 0,
		refId: 0,
		division: '',
		trxDate: dateParam(null),
		descriptions: '',
		memo: '',
		detail: {
			groupId: 0,
			id: 0,
			trxId: 0,
			codeId: 0,
			debt: 0,
			cred: 0,
			saldo: 0
		}
	},
}

type LoanFormProps = {
	data: CurrentLoan
	accCode: iAccountSpecific[]
	onInsert?: (loan: CurrentLoan) => void
	onUpdate?: (id: number, loan: CurrentLoan) => void
	onDelete?: (id: number) => void
	onCancel?: (id: number) => void
}

const LoanForm = ({ data, accCode, onInsert, onUpdate, onDelete, onCancel }: LoanFormProps) => {
	const [loan, setLoan] = useState<CurrentLoan>(initLoan)
	const [isDirty, setIsDirty] = React.useState<boolean>(false);

	const isDescriptionsValid = React.useMemo(
		() => {
		
			if (loan.trx.descriptions) {
				return loan.trx.descriptions.length >= 5
			}
			return false
		},
		[loan]
	)

	const isNameValid = React.useMemo(
		() => loan.name.length >= 3,
		[loan]
	)

	const isPiutangValid = React.useMemo(
		() => loan.trx.detail.cred > 0,
		[loan]
	)

	const isPersenValid = React.useMemo(
		() => {
			return loan.persen >= 0
		},
		[loan]
	)


	const isCodeValid = React.useMemo(
		() => loan.trx.detail.codeId > 0,
		[loan.trx.detail.codeId]
	)

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setLoan(data);
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
								value={loan.name}
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
								value={dateOnly(loan.trx.trxDate)}
								onChange={(e) => {
									setIsDirty(true)
									setLoan(o => ({ ...o, trx: { ...o.trx, trxDate: e } }))
								}}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} rowGap={'size-75'}>
							<NumberField
								flex
								hideStepper={true}
								labelPosition='side'
								labelAlign='end'
								width={{ base: 'auto', M: 'size-2000' }}
								formatOptions={{ currency: 'IDR', style: 'currency', maximumFractionDigits: 0 }}
								validationState={isPiutangValid ? "valid" : "invalid"}
								label={<div className='width-80'>Pokok</div>}
								onChange={(e) => {
									setLoan(o => ({ ...o, trx: { ...o.trx, detail: { ...o.trx.detail, cred: e, saldo: -e } } }))
									setIsDirty(true)
								}}
								value={loan.trx.detail.cred} />
							<ComboBox
								flex
								menuTrigger='focus'
								labelAlign='end'
								label={<div className='width-80'>Dari kas</div>}
								labelPosition='side'
								validationState={isCodeValid ? 'valid' : 'invalid'}
								placeholder={"e.g. Kas / bank"}
								defaultItems={accCode}
								selectedKey={loan.trx.detail.codeId}
								onSelectionChange={(e) => {
									setIsDirty(true)
									setLoan(o => ({ ...o, trx: { ...o.trx, detail: { ...o.trx.detail, codeId: +e } } }))
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
								formatOptions={{ style: 'percent', useGrouping: false, maximumFractionDigits: 4 }}
								width={{ base: 'auto', M: 'size-2000' }}
								validationState={isPersenValid ? "valid" : "invalid"}
								label={<div className='width-80'>Prosentase</div>}
								onChange={(e) => handleChange("persen", e*100.0)}
								value={loan.persen/100.0} />

							<NumberField
								flex
								hideStepper={true}
								labelPosition='side'
								labelAlign='end'
								formatOptions={{ currency: 'IDR', style: 'currency', maximumFractionDigits: 0 }}
								width={{ base: 'auto', M: 'size-2000' }}
								validationState={isPiutangValid ? "valid" : "invalid"}
								label={<div className='width-80'>Piutang</div>}
								value={((loan.persen / 100) * loan.trx.detail.cred) + loan.trx.detail.cred}
								onChange={(e) => {
									setLoan(o => ({ ...o, 
										persen: ((e - loan.trx.detail.cred) / loan.trx.detail.cred) * 100.0
									}))
									setIsDirty(true)
								}}
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
								value={loan.trx.descriptions}
								placeholder={'e.g. Indramayu'}
								maxLength={50}
								onChange={(e) => {
									setLoan(o => ({ ...o, trx: { ...o.trx, descriptions: e } }))
									setIsDirty(true)
								}}
							/>
							<TextField
								flex
								label={<div className='width-80'>Alamat</div>}
								labelAlign='end'
								labelPosition='side'
								width={'auto'}
								value={loan.street}
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
								value={loan.city}
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
								value={loan.phone}
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
								value={loan.cell}
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
								value={loan.zip}
								placeholder={'e.g. 45215'}
								maxLength={10}
								onChange={(e) => handleChange("zip", e)}
							/>
						</Flex>
					</Flex>
					<Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-400'}>
						<Flex flex direction={'row'} columnGap={'size-100'}>
							<Button type='submit' variant='cta' isDisabled={!isDirty || !(isNameValid && isPersenValid && isDescriptionsValid && isPiutangValid && isCodeValid)}>Save</Button>
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

	async function updateData(p: CurrentLoan) {
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
			id: loan.trx.id,
			refId: p.id,
			division: 'trx-loan',
			descriptions: loan.trx.descriptions,
			trxDate: dateOnly(loan.trx.trxDate),
			memo: loan.trx.memo,
			details: [
				{
					id: 1,
					codeId: 5512,
					trxId: loan.trx.id,
					debt: loan.trx.detail.cred,
					cred: 0
				},
				{
					id: 2,
					codeId: loan.trx.detail.codeId,
					trxId: loan.trx.id,
					debt: 0,
					cred: loan.trx.detail.cred
				}
			],
		}


		const xData = JSON.stringify({
			loan: t_loan,
			trx: t_rx,
			token: [loan.trx.descriptions || ' ', loan.trx.memo || ' ', p.name].join(" ")
		})


		await axios
			.put(`/loan/${p.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false)
				onUpdate && onUpdate(p.id, p)
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(p: CurrentLoan) {
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
			id: loan.trx.id,
			refId: p.id,
			division: 'trx-loan',
			descriptions: loan.trx.descriptions,
			trxDate: dateOnly(loan.trx.trxDate),
			memo: loan.trx.memo,
			details: [
				{
					id: 1,
					codeId: 5512,
					trxId: loan.trx.id,
					debt: loan.trx.detail.cred,
					cred: 0
				},
				{
					id: 2,
					codeId: loan.trx.detail.codeId,
					trxId: loan.trx.id,
					debt: 0,
					cred: loan.trx.detail.cred
				}
			]
		}

		const xData = JSON.stringify({
			loan: t_loan,
			trx: t_rx,
			token: [loan.trx.descriptions || ' ', loan.trx.memo || ' ', p.name].join(" ")
		})

		await axios
			.post(`/loan`, xData, { headers: headers })
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
			.delete(`/loan/${p}`, { headers: headers })
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