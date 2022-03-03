import React, { FormEvent } from 'react';
import { dateParam, dateOnly, iBranch, iFinance, iOrder } from '../component/interfaces'
import { Button, ComboBox, Flex, Picker, TextField, useAsyncList, View, Text, NumberField, Checkbox } from '@adobe/react-spectrum';
import axios from '../component/axios-base';
import { Item } from "@react-spectrum/combobox";
import { serialize } from 'v8';

export const initOrder: iOrder = {
	id: 0,
	name: '',
	orderAt: dateParam(null),
	printedAt: dateParam(null),
	btFinance: 0,
	btPercent: 20,
	btMatel: 0,
	ppn: 0,
	nominal: 0,
	subtotal: 0,
	userName: 'Opick',
	verifiedBy: '',
	validatedBy: '',
	financeId: 0,
	branchId: 0,
}

type OrderFormOptions = {
	order: iOrder,
	callback: (params: { method: string, data?: iOrder }) => void
}

const OrderForm = (props: OrderFormOptions) => {
	const { order, callback } = props;
	const [data, setData] = React.useState<iOrder>(initOrder)

	const isNameValid = React.useMemo(
		() => data && data.name && data.name.length > 0,
		[data]
	)
	const isFinanceValid = React.useMemo(
		() => data && data.financeId && data.financeId > 0,
		[data]
	)
	const isBranchValid = React.useMemo(
		() => data && data.branchId && data.branchId > 0,
		[data]
	)
	const isBtFinanceValid = React.useMemo(
		() => data && data.btFinance && data.btFinance > 0,
		[data]
	)
	const isBtPercentValid = React.useMemo(
		() => data && data.btMatel && data.btMatel > 0,
		[data]
	)
	const isPpnValid = React.useMemo(
		() => data && data.subtotal && data.subtotal >= 0,
		[data]
	)

	let finances = useAsyncList<iFinance>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/finances/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data ? data : []
				})
				.catch(error => {
					console.log(error)
				})

			return { items: res }
		},
		getKey: (item: iFinance) => item.id
	})

	let branchs = useAsyncList<iBranch>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/branchs/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					//console.log(data)
					return data
				})
				.catch(error => {
					console.log(error)
				})
			return { items: res }
		},
		getKey: (item: iBranch) => item.id
	})

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setData(order)
		}

		return () => { isLoaded = true }

	}, [order])

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<View backgroundColor={'gray-100'}
				borderColor={'blue-400'}
				borderRadius={'medium'}
				borderWidth={'thin'}
				paddingX={{ base: 'size-100', M: 'size-400' }}
				paddingY={{ base: 'size-50', M: 'size-50' }}
			>
				<h3>DATA ORDER</h3>
				<Flex gap='size-100' direction={'column'}>

					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-100'>
						<TextField
							autoFocus
							validationState={isNameValid ? 'valid' : 'invalid'}
							label='Nomor'
							flex
							width={{ base: 'auto' }}
							value={data.name}
							maxLength={50}
							onChange={(e) => setData(prev => ({ ...prev, name: e }))}
						/>
						<TextField
							flex={{ base: '1', M: 'none' }}
							type={'date'}
							label='Tanggal'
							width={{ base: 'auto', M: '25%' }}
							value={dateOnly(data.orderAt)}
							maxLength={10}
							onChange={(e) => setData((prev) => ({ ...prev, orderAt: e }))}
						/>
						<TextField
							type={'date'}
							label='Tanggal Cetak'
							width={{ base: 'auto', M: '25%' }}
							value={dateOnly(data.printedAt)}
							maxLength={10}
							onChange={(e) => setData((prev) => ({ ...prev, printedAt: e }))}
						/>
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-100'>
						<NumberField
							flex
							hideStepper={true}
							validationState={isBtFinanceValid ? 'valid' : 'invalid'}
							width={"auto"}
							label={"BT Finance"}
							onChange={(e) => setFinance(e)}
							value={data.btFinance} />
						<NumberField
							hideStepper={true}
							validationState={isBtPercentValid ? 'valid' : 'invalid'}
							width={{ base: "auto", M: "15%" }}
							label={"Prosentase (%)"}
							onChange={(e) => setPercent(e)}
							value={data.btPercent} />
						<NumberField
							flex
							hideStepper={true}
							isReadOnly
							onChange={(e) => setData((prev) => ({ ...prev, btMatel: e }))}
							width={"auto"}
							label={"BT Matel"}
							value={data.btMatel} />
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-100'>
						<NumberField
							hideStepper={true}
							validationState={isPpnValid ? 'valid' : 'invalid'}
							width={{ base: "auto", M: "15%" }}
							label={"PPN (%)"}
							onChange={(e) => setPpn(e)}
							value={data.ppn} />
						<NumberField
							flex
							hideStepper={true}
							isReadOnly
							width={"auto"}
							onChange={(e) => setData((prev) => ({ ...prev, nominal: e }))}
							label={"Nominal"}
							value={data.nominal} />
						<NumberField
							flex
							hideStepper={true}
							isReadOnly
							width={"auto"}
							onChange={(e) => setData((prev) => ({ ...prev, subtotal: e }))}
							label={"Subtotal"}
							value={data.subtotal} />
					</Flex>
					<Flex flex direction={{ base: 'column', M: 'row' }} gap='size-100'>
						<ComboBox
							menuTrigger="focus"
							flex
							validationState={isFinanceValid ? "valid" : "invalid"}
							width={'auto'}
							label={"Finance"}
							placeholder={"e.g. Adira"}
							defaultItems={finances.items}
							selectedKey={data.financeId}
							onSelectionChange={(e) => setData((o) => ({
								...o,
								financeId: +e,
								finance: finances.getItem(+e)
							}))}
						>
							{(item) => <Item textValue={item.shortName}>
								<Text>{item.shortName}</Text>
								<Text slot='description'>{item.name}</Text>
							</Item>}
						</ComboBox>
						<ComboBox
							menuTrigger="focus"
							flex
							validationState={isBranchValid ? "valid" : "invalid"}
							width={'auto'}
							label={"Cabang"}
							placeholder={"e.g. Pusat"}
							defaultItems={branchs.items}
							selectedKey={data.branchId}
							onSelectionChange={(e) => setData((o) => ({
								...o,
								branchId: +e,
								branch: branchs.getItem(+e)
							}))}
						>
							{(item) => <Item textValue={item.name}>
								<Text>{item.name}</Text>
								<Text slot='description'>{item?.street}{item.city ? `, ${item.city}` : ''}
									{item.zip ? ` - ${item.zip}` : ''}<br />
									{item.phone ? `Telp. ${item.phone}` : ''}
									{item.cell && item.phone ? ` / ` : ''}
									{item.cell && item.phone === '' ? `Cellular: ` : ''}
									{item.cell ?? ''}<br />{item.email ? `e-mail: ${item.email}` : ''}</Text>
							</Item>}
						</ComboBox>
					</Flex>

					<Flex direction="row">
						<Checkbox isSelected={data.verifiedBy ? data.verifiedBy?.length > 0 : false}
							onChange={(e) => setData(o => ({ ...o, verifiedBy: e ? o.userName : '' }))}>
							Verified
						</Checkbox>
						<Checkbox isSelected={data.validatedBy ? data.validatedBy?.length > 0 : false}
							onChange={(e) => setData(o => ({ ...o, validatedBy: e ? o.userName : '' }))}>
							Validated
						</Checkbox>
					</Flex>

				</Flex>
				<Flex direction={'row'} gap='size-100' marginBottom={'size-400'} marginTop={'size-400'}>
					<Flex flex direction={'row'} columnGap={'size-100'}>
						<Button type='submit' variant='cta'>Save</Button>
						<Button type='button' variant='primary'
							onPress={() => callback({ method: 'cancel' })}>Cancel</Button>
					</Flex>
					{data.id > 0 &&
						<View>
							<Button type='button' alignSelf={'flex-end'} variant='negative'
								onPress={() => deleteData(data)}>Remove</Button>
						</View>
					}
				</Flex>
			</View>
		</form>
	);

	function setFinance(v: number) {
		const matel = v - (v * (data.btPercent / 100))
		const nominal = matel * (data.ppn / 100.0 )

		setData(o => ({
			...o,
			btFinance: v,
			btMatel: matel,
			nominal: nominal,
			subtotal: matel - nominal
		}))
	}

	function setPercent(v: number) {
		const matel = data.btFinance - (data.btFinance * (v / 100.0))
		const nominal = matel * (data.ppn / 100.0);

		setData(o => ({
			...o,
			btPercent: v,
			btMatel: matel,
			nominal: nominal,
			subtotal: matel - nominal
		}))
	}

	
	function setPpn(v: number) {
		const nominal = data.btMatel * (v / 100.0)
		setData(o => ({
			...o,
			ppn: v,
			nominal: nominal,
			subtotal: o.btMatel - nominal
		}))
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if (data.name.trim().length === 0) {
			return
		}

		if (data.id === 0) {
			await inserData(data);
		} else {
			await updateData(data);
		}
	}


	async function updateData(p: iOrder) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.put(`/orders/${p.id}/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				console.log(data)
				callback({ method: 'save', data: p })
			})
			.catch(error => {
				console.log(error)
			})
	}

	async function inserData(p: iOrder) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)

		await axios
			.post(`/orders/`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}


	async function deleteData(p: iOrder) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/orders/${p.id}/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove', data: data })
			})
			.catch(error => {
				console.log(error)
			})
	}

}

export default OrderForm;