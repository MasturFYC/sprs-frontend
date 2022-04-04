import React, { FormEvent, useState } from 'react';
import {
	dateParam, dateOnly, iBranch, iFinance, iOrder, iUnit,
	// iReceivable, 
} from '../lib/interfaces'
import { Button, ComboBox, Flex, TextField, View, Text, NumberField, Checkbox, Tabs, TabList, Divider, Form } from '@adobe/react-spectrum';
import axios from '../lib/axios-base';
import { Item } from "@react-spectrum/combobox";
import VerifyOrder from './VerifyOrder'

const CustomerForm = React.lazy(() => import('./CustomerForm'));
// const ReceivableForm = React.lazy(() => import('./Receivable'));
const AddressForm = React.lazy(() => import('./AddressForm'));
const Action = React.lazy(() => import('../component/Action'));
const UnitForm = React.lazy(() => import('./UnitForm'));
const TaskForm = React.lazy(() => import('./TaskForm'));

const initUnit: iUnit = {
	orderId: 0,
	nopol: '',
	year: new Date().getFullYear(),
	frameNumber: '',
	machineNumber: '',
	color: '',
	typeId: 0,
	warehouseId: 0
}

export const initOrder: iOrder = {
	id: 0,
	name: '',
	orderAt: dateParam(null),
	printedAt: dateParam(null),
	btFinance: 0,
	btPercent: 20,
	btMatel: 0,
	userName: 'Opick',
	verifiedBy: '',
	financeId: 0,
	branchId: 0,
	isStnk: true,
	stnkPrice: 0,
	matrix: 0,
}

type OrderFormOptions = {
	order: iOrder,
	finances: iFinance[],
	branchs: iBranch[],
	updateChild: (data: iOrder) => void,
	callback: (params: { method: string, data?: iOrder }) => void
}

const OrderForm = (props: OrderFormOptions) => {
	const { order, callback, updateChild, finances, branchs } = props;
	const [data, setData] = useState<iOrder>(initOrder)
	let [tabId, setTabId] = useState(order.verifiedBy ? 1 : 0);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [message, setMessage] = useState<string>('');

	const isFinanceValid = React.useMemo(
		() => data.financeId > 0,
		[data]
	)
	const isNameValid = React.useMemo(
		() => data.name.length > 5,
		[data]
	)

	const isMatrixValid = React.useMemo(
		() => data.matrix > 0,
		[data]
	)
	const isBranchValid = React.useMemo(
		() => data.branchId > 0,
		[data]
	)
	const isBtFinanceValid = React.useMemo(
		() => data.btFinance > 0,
		[data]
	)
	const isBtPercentValid = React.useMemo(
		() => data.btMatel > 0,
		[data]
	)
	const isStnkValid = React.useMemo(
		() => {
			if (data) {
				if (data.isStnk) {
					return true;
				}
				return data.stnkPrice > 0
			}
			return true;
		},
		[data]
	)

	React.useEffect(() => {
		let isLoaded = true;

		async function getOrderName() {

			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get(`/orders/name/seq`, { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})

			return await res;
		}

		if (isLoaded) {
			setData(order);
			if (order.id === 0) {
				getOrderName().then(data => {
					const nm = ('' + data.id).padStart(9, "0")
					setData({ ...order, name: nm });
				})
			}
		}

		return () => { isLoaded = false }

	}, [order])

	return (
		<View backgroundColor={'gray-75'}
			borderColor={'blue-400'}
			borderRadius={'medium'}
			borderWidth={'thin'}
		>
			<View
				paddingX={{ base: 'size-100', M: 'size-400' }}
				paddingY={{ base: 'size-50', M: 'size-50' }}
			>
				<Form onSubmit={(e) => handleSubmit(e)} isReadOnly={data.verifiedBy ? true : false}>
					<Flex direction={'column'} columnGap='size-200' rowGap={'size-50'}>
						<Flex direction={'row'} gap='size-50' marginBottom={'size-200'} marginTop={'size-50'}>
							<Flex flex direction={'row'} columnGap={'size-100'}>
								<Button type='submit'
									isDisabled={!isDirty || !(isNameValid && isBranchValid && isMatrixValid && isBtFinanceValid && isBtPercentValid && isStnkValid && isFinanceValid)
										|| (data.verifiedBy ? true : false)}
									variant='cta'>Save</Button>
								<Button type='button' variant='primary'
									onPress={() => callback({ method: 'cancel' })}>
									{isDirty ? 'Cancel' : 'Close'}
								</Button>
							</Flex>
							<View flex><span style={{ fontWeight: 700, fontSize: '16px' }}>DATA ORDER</span></View>
							<View><VerifyOrder
								isDisable={isDirty || !(data.verifiedBy ? false : true) || !(data.id > 0) || !(isNameValid && isBranchValid && isMatrixValid
									&& isBtFinanceValid && isBtPercentValid && isStnkValid && isFinanceValid)}
								order={data}
								onChange={(e) => {
									changeData("verifiedBy", e);
									updateData({ ...data, verifiedBy: e });
								}} />
							</View>
							<View marginStart={'size-200'}>
								<Button type='button' alignSelf={'flex-end'} variant='negative'
									isDisabled={data.id === 0 || (data.verifiedBy ? true : false)}
									onPress={() => deleteData(data.id)}>Remove</Button>
							</View>
						</Flex>

						{
							message.length > 0 &&
							<View UNSAFE_style={{ color: 'red' }}>
								{message}
							</View>
						}

						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
							<TextField
								autoFocus
								validationState={isNameValid ? 'valid' : 'invalid'}
								label='Nomor SPK'
								flex
								width={{ base: 'auto' }}
								placeholder='e.g. X256/2022/VII/22665'
								value={data.name}
								maxLength={50}
								onChange={(e) => changeData("name", e)}
							/>
							<TextField
								//flex={{ base: '1', M: 'none' }}
								type={'date'}
								label='Tanggal'
								width={{ base: 'auto', L: 'calc((50% - size-300)/2)' }}
								value={dateOnly(data.orderAt)}
								onChange={(e) => changeData("orderAt", e)}
							/>
							<TextField
								type={'date'}
								label='Tanggal cetak'
								width={{ base: 'auto', L: 'calc((50% - size-300)/2)' }}
								value={dateOnly(data.printedAt)}
								onChange={(e) => changeData("printedAt", e)}
							/>
						</Flex>
						<View flex>
							<Flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
								<View flex>

									<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-100' rowGap={'size-50'}>
										<NumberField
											flex
											hideStepper={true}
											validationState={isMatrixValid ? 'valid' : 'invalid'}
											width={{ base: 'auto', L: 'size-1700' }}
											label={"Matrix"}
											onChange={(e) => setMatrix(e)}
											value={data.matrix} />
										<Checkbox isSelected={data.isStnk}
											marginTop={'size-300'}
											width={{ base: 'auto', L: '140px' }}
											onChange={(e) => {
												setStnk(e ? 0 : 200000)
												changeData("isStnk", e)
											}}>
											{data.isStnk ? 'Ada STNK' : 'Tidak ada STNK'}
										</Checkbox>
										<NumberField
											flex
											isDisabled={data.isStnk}
											hideStepper={true}
											validationState={isStnkValid ? 'valid' : 'invalid'}
											width={{ base: 'auto', L: 'size-1250' }}
											label={"Potongan STNK"}
											onChange={(e) => setStnk(e)}
											value={data.stnkPrice} />
									</Flex>
								</View>
								<View flex>

									<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
										<NumberField
											flex
											hideStepper={true}
											width={{ base: 'auto', L: 'size-1700' }}
											isReadOnly
											label={"BT Finance"}
											onChange={(e) => changeData("btFinance", e)}
											value={data.btFinance} />
										<NumberField
											hideStepper={true}
											validationState={isBtPercentValid ? 'valid' : 'invalid'}
											width={{ base: "auto", M: "90px" }}
											label={"Prosentase (%)"}
											formatOptions={{ maximumFractionDigits: 2 }}
											onChange={(e) => setPercent(e)}
											value={data.btPercent} />
										<NumberField
											flex
											hideStepper={true}
											validationState={isBtPercentValid ? 'valid' : 'invalid'}
											onChange={(e) => setMatel(e)}
											width={{ base: 'auto', L: 'size-1700' }}
											label={"BT Matel"}
											value={data.btMatel} />
									</Flex>
								</View>
							</Flex>
						</View>
						<View flex>
							<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'} marginBottom={'size-200'}>
								<ComboBox
									menuTrigger={data.verifiedBy ? "manual" : "focus"}
									flex
									validationState={isFinanceValid ? "valid" : "invalid"}
									width={'auto'}
									label={"Finance"}
									placeholder={"e.g. Adira"}
									defaultItems={finances}
									selectedKey={data.financeId}
									onSelectionChange={(e) => {
										setIsDirty(true);
										setData((o) => ({
											...o,
											financeId: +e,
											finance: finances.filter(o => o.id === +e)[0]
										}))
									}}
								>
									{(item) => <Item textValue={item.shortName}>
										<Text>{item.shortName}</Text>
										<Text slot='description'>{item.name}</Text>
									</Item>}
								</ComboBox>
								<ComboBox
									flex
									menuTrigger={data.verifiedBy ? "manual" : "focus"}
									validationState={isBranchValid ? "valid" : "invalid"}
									label={"Cabang penerima order"}
									placeholder={"e.g. Pusat"}
									defaultItems={branchs}
									selectedKey={data.branchId}
									onSelectionChange={(e) => {
										setIsDirty(true);
										setData((o) =>
										({
											...o,
											branchId: +e,
											branch: branchs.filter(o => o.id === +e)[0]
										}))
									}}
								>
									{(item) => <Item textValue={item.name}>
										<Text>{item.name}</Text>
										<Text slot='description'>
											Kepala Cabang: <span style={{ fontWeight: 700 }}>{item.headBranch}</span><br />
											{item?.street}{item.city ? `, ${item.city}` : ''}
											{item.zip ? ` - ${item.zip}` : ''}<br />
											{item.phone ? `Telp. ${item.phone}` : ''}
											{item.cell && item.phone ? ` / ` : ''}
											{item.cell && item.phone === '' ? `Cellular: ` : ''}
											{item.cell ?? ''}<br />{item.email ? `e-mail: ${item.email}` : ''}</Text>
									</Item>}
								</ComboBox>
							</Flex>
						</View>
					</Flex>
				</Form >
			</View >
			{
				data.id > 0 &&
				<View backgroundColor={'gray-50'}
					borderRadius={'medium'}
					paddingBottom={'size-100'}
				>
					<Divider size='M' marginBottom={'size-200'} />
					<View paddingX={'size-400'}>
						<Tabs
							aria-label="Tab-Order"
							density='compact'
							onSelectionChange={(e) => setTabId(+e)}>
							<TabList aria-label="Tab-Order-List">
								<Item key={'0'}><span style={{ fontWeight: 700, color: 'orangered' }}>Data Asset</span></Item>
								<Item key={'1'}><span style={{ fontWeight: 700, color: 'green' }}>Data Konsumen</span></Item>
								{/* <Item key={'2'}><span style={{ fontWeight: 700, color: 'green' }}>Data Tunggakan</span></Item> */}
								<Item key={'2'}><span style={{ fontWeight: 700, color: 'green' }}>History</span></Item>
								<Item key={'3'}><span style={{ fontWeight: 700, color: 'green' }}>Data Alamat</span></Item>
								<Item key={'4'}><span style={{ fontWeight: 700, color: 'green' }}>Perintah dan Tugas</span></Item>
							</TabList>
						</Tabs>
						<View marginY={'size-100'}>
							{tabId === 0 && <React.Suspense fallback={<div>Please wait...</div>}><UnitForm
								isReadOnly={data.verifiedBy ? true : false}
								dataUnit={data.unit ? { ...data.unit, orderId: data.id } : { ...initUnit, orderId: data.id }}
								isNew={data.unit ? data.unit.orderId === 0 : true}
								callback={(e) => responseUnitChange(e)} />
							</React.Suspense>}
							{tabId === 1 &&
								<React.Suspense fallback={<div>Please wait...</div>}>
									<CustomerForm orderId={data.id} />
								</React.Suspense>
							}
							{/* tabId === 2 &&
								<React.Suspense fallback={<div>Please wait...</div>}>
									<ReceivableForm
										receive={data.receivable ? { ...data.receivable, orderId: data.id } : { ...initReceivable, orderId: data.id }}
										isNew={data.receivable ? data.receivable.orderId === 0 : true}
										callback={(e) => responseReceivableChange(e)} />
								</React.Suspense>
						*/}
							{tabId === 2 && <Action orderId={data.id} />}
							{tabId === 3 &&
								<Flex flex direction={'column'} gap={'size-100'}>
									<View flex>
										<Flex flex direction={'row'} gap={'size-200'}>
											<View flex>
												<React.Suspense fallback={<div>Please wait...</div>}>
													<AddressForm
														title='Alamat Sesuai KTP'
														apiAddress='ktp-address'
														orderId={data.id}
													/>
												</React.Suspense>
											</View>
											<View flex>
												<React.Suspense fallback={<div>Please wait...</div>}>
													<AddressForm
														title='Alamat Rumah'
														apiAddress='home-address'
														orderId={data.id}
													/>
												</React.Suspense>
											</View>
										</Flex>
									</View>
									<View flex>
										<Flex flex direction={'row'} gap={'size-200'}>
											<View flex>
												<React.Suspense fallback={<div>Please wait...</div>}>
													<AddressForm
														title='Alamat Kantor'
														apiAddress='office-address'
														orderId={data.id}
													/>
												</React.Suspense>
											</View>
											<View flex>
												<React.Suspense fallback={<div>Please wait...</div>}>
													<AddressForm
														title='Alamat Surat / Tagih'
														apiAddress='post-address'
														orderId={data.id} />
												</React.Suspense>
											</View>
										</Flex>
									</View>
								</Flex>
							}
							{tabId === 4 &&
								<React.Suspense fallback={<div>Please wait...</div>}>
									<TaskForm
										orderId={data.id} />
								</React.Suspense>
							}
						</View>
					</View>
				</View>
			}

		</View >

	);

	function setMatel(e: number) {
		const percent = data.btPercent; // ((data.btFinance - e) / data.btFinance) * 100.0
		const fin = e + (e * (percent/100.0) )
  
		setData(o => ({
		  ...o,
		  btFinance: fin,
		  //btPercent: percent,
		  btMatel: e,
		}))
  
		setIsDirty(true)
	 }
  

	function setMatrix(v: number) {
		const fin = v - data.stnkPrice
		const matel = fin - (fin * (data.btPercent / 100.0))

		setData(o => ({
			...o,
			matrix: v,
			btFinance: fin,
			btMatel: matel
		}))

		setIsDirty(true)
	}

	function setPercent(v: number) {
		const matel = data.btFinance - (data.btFinance * (v / 100.0))

		setData(o => ({
			...o,
			btPercent: v,
			btMatel: matel
		}))

		setIsDirty(true)
	}


	function setStnk(v: number) {
		const fin = data.matrix - v
		const matel = fin - (fin * (data.btPercent / 100.0))
		setData(o => ({
			...o,
			btFinance: fin,
			stnkPrice: v,
			btMatel: matel
		}))

		setIsDirty(true)
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
		//console.log(p)

		await axios
			.put(`/orders/${p.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'save', data: p })
				setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
				setMessage(`Nomor order SPK "${p.name}" sudah digunakan.`)
			})
	}

	async function inserData(p: iOrder) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const xData = JSON.stringify(p)
		//console.log(p)

		await axios
			.post(`/orders`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setData(data)
				callback({ method: 'save', data: data })
				setIsDirty(false)
				setMessage('')
			})
			.catch(error => {
				console.log(error)
				setMessage(`Nomor order SPK "${p.name}" sudah digunakan.`)
			})
	}

	async function deleteData(p: number) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		await axios
			.delete(`/orders/${p}`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove' })
				// setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}


	function responseUnitChange(params: { method: string, dataUnit?: iUnit }) {
		const { method, dataUnit } = params

		const u = method === 'remove' ? initUnit : dataUnit;

		setData(o => ({ ...o, unit: u }))
		updateChild({ ...order, unit: u })
	}

	function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}


}

export default OrderForm;