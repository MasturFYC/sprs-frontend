import React, { FormEvent, useState } from 'react';
import {
	dateParam, dateOnly, iBranch, iFinance, iOrder, iCustomer, iUnit,
	// iReceivable, 
	iTask, iAddress
} from '../lib/interfaces'
import { Button, ComboBox, Flex, TextField, View, Text, NumberField, Checkbox, Tabs, TabList, Divider } from '@adobe/react-spectrum';
import axios from '../lib/axios-base';
import { Item } from "@react-spectrum/combobox";
import VerifyOrder from './VerifyOrder'

const CustomerForm = React.lazy(() => import('./CustomerForm'));
// const ReceivableForm = React.lazy(() => import('./Receivable'));
const AddressForm = React.lazy(() => import('./AddressForm'));
const Action = React.lazy(() => import('../component/Action'));
const UnitForm = React.lazy(() => import('./UnitForm'));
const TaskForm = React.lazy(() => import('./TaskForm'));

const initTask: iTask = {
	orderId: 0,
	descriptions: '',
	periodFrom: dateParam(null),
	periodTo: dateParam(null),
	recipientName: '',
	recipientPosition: '',
	giverPosition: '',
	giverName: '',
}

const initAddress: iAddress = {
	orderId: 0,
	street: '',
	city: '',
	phone: '',
	cell: '',
	zip: '',
	email: '',
}

// const initReceivable: iReceivable = {
// 	orderId: 0,
// 	covenantAt: dateParam(null),
// 	dueAt: dateParam(null),
// 	mortgageByMonth: 0,
// 	mortgageReceivable: 0,
// 	runningFine: 0,
// 	restFine: 0,
// 	billService: 0,
// 	payDeposit: 0,
// 	restReceivable: 0,
// 	restBase: 0,
// 	dayPeriod: 0,
// 	mortgageTo: 0,
// 	dayCount: 0
// }

const initCustomer: iCustomer = {
	orderId: 0,
	name: '',
	agreementNumber: '',
	paymentType: ''
}

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
	let [tabId, setTabId] = useState(order.verifiedBy ? 2 : 1);
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
				.get(`/orders/name-seq`, { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log('-------', error)
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
		<View backgroundColor={'gray-100'}
			borderColor={'blue-400'}
			borderRadius={'medium'}
			borderWidth={'thin'}
		>
			<View
				paddingX={{ base: 'size-100', M: 'size-400' }}
				paddingY={{ base: 'size-50', M: 'size-50' }}
			>
				<form onSubmit={(e) => handleSubmit(e)}>
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
											onChange={(e) => setPercent(e)}
											value={data.btPercent} />
										<NumberField
											flex
											hideStepper={true}
											isReadOnly
											onChange={(e) => changeData("btMatel", e)}
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
									menuTrigger="focus"
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
									menuTrigger="focus"
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
				</form >
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
							disabledKeys={order.verifiedBy ? ['0', '1'] : ['']}
							defaultSelectedKey={order.verifiedBy ? '2' : '1'}
							//selectedKey={data.verifiedBy ? '2' : '0'}
							density='compact'
							onSelectionChange={(e) => setTabId(+e)}>
							<TabList aria-label="Tab-Order-List">
								<Item key={'0'}><span style={{ fontWeight: 700, color: data.verifiedBy ? '#cecece' : 'green' }}>Data Konsumen</span></Item>
								<Item key={'1'}><span style={{ fontWeight: 700, color: data.verifiedBy ? '#cecece' : 'orangered' }}>Data Asset</span></Item>
								{/* <Item key={'2'}><span style={{ fontWeight: 700, color: 'green' }}>Data Tunggakan</span></Item> */}
								<Item key={'2'}><span style={{ fontWeight: 700, color: 'green' }}>History</span></Item>
								<Item key={'3'}><span style={{ fontWeight: 700, color: 'green' }}>Data Alamat</span></Item>
								<Item key={'4'}><span style={{ fontWeight: 700, color: 'green' }}>Perintah dan Tugas</span></Item>
							</TabList>
						</Tabs>
						<View marginY={'size-100'}>
							{tabId === 0 &&
								<React.Suspense fallback={<div>Please wait...</div>}>
									<CustomerForm
										customer={data.customer ? { ...data.customer, orderId: data.id } : { ...initCustomer, orderId: data.id }}
										isNew={data.customer ? data.customer.orderId === 0 : true}
										callback={(e) => responseCustomerChange(e)} />
								</React.Suspense>
							}
							{tabId === 1 && <React.Suspense fallback={<div>Please wait...</div>}><UnitForm
								dataUnit={data.unit ? { ...data.unit, orderId: data.id } : { ...initUnit, orderId: data.id }}
								isNew={data.unit ? data.unit.orderId === 0 : true}
								callback={(e) => responseUnitChange(e)} />
							</React.Suspense>}
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
														address={data.ktpAddress ? { ...data.ktpAddress, orderId: data.id } : { ...initAddress, orderId: data.id }}
														isNew={data.ktpAddress ? data.ktpAddress.orderId === 0 : true}
														callback={(e) => {
															setData(o => ({ ...o, ktpAddress: e.address }))
															updateChild({ ...order, ktpAddress: e.address })
														}}
													/>
												</React.Suspense>
											</View>
											<View flex>
												<React.Suspense fallback={<div>Please wait...</div>}>
													<AddressForm
														title='Alamat Rumah'
														apiAddress='home-address'
														address={data.homeAddress ? { ...data.homeAddress, orderId: data.id } : { ...initAddress, orderId: data.id }}
														isNew={data.homeAddress ? data.homeAddress.orderId === 0 : true}
														callback={(e) => {
															setData(o => ({ ...o, homeAddress: e.address }))
															updateChild({ ...order, homeAddress: e.address })
														}}
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
														address={data.officeAddress ? { ...data.officeAddress, orderId: data.id } : { ...initAddress, orderId: data.id }}
														isNew={data.officeAddress ? data.officeAddress.orderId === 0 : true}
														callback={(e) => {
															setData(o => ({ ...o, officeAddress: e.address }))
															updateChild({ ...order, officeAddress: e.address })
														}}
													/>
												</React.Suspense>
											</View>
											<View flex>
												<React.Suspense fallback={<div>Please wait...</div>}>
													<AddressForm
														title='Alamat Surat / Tagih'
														apiAddress='post-address'
														address={data.postAddress ? { ...data.postAddress, orderId: data.id } : { ...initAddress, orderId: data.id }}
														isNew={data.postAddress ? data.postAddress.orderId === 0 : true}
														callback={(e) => {
															setData(o => ({ ...o, postAddress: e.address }))
															updateChild({ ...order, postAddress: e.address })
														}}
													/>
												</React.Suspense>
											</View>
										</Flex>
									</View>
								</Flex>
							}
							{tabId === 4 &&
								<React.Suspense fallback={<div>Please wait...</div>}>
									<TaskForm
										task={data.task ? { ...data.task, orderId: data.id } : { ...initTask, orderId: data.id }}
										isNew={data.task ? data.task.orderId === 0 : true}
										callback={(e) => responseTaskChange(e)} />
								</React.Suspense>
							}
						</View>
					</View>
				</View>
			}

		</View >

	);

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

		await axios
			.put(`/orders/${p.id}/`, xData, { headers: headers })
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

		await axios
			.post(`/orders/`, xData, { headers: headers })
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
			.delete(`/orders/${p}/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				callback({ method: 'remove' })
				// setIsDirty(false)
			})
			.catch(error => {
				console.log(error)
			})
	}

	function responseTaskChange(params: { method: string, task?: iTask }) {
		const { method, task } = params

		const u = method === 'remove' ? initTask : task;

		setData(o => ({ ...o, task: u }))
		updateChild({ ...order, task: u })
	}


	function responseUnitChange(params: { method: string, dataUnit?: iUnit }) {
		const { method, dataUnit } = params

		const u = method === 'remove' ? initUnit : dataUnit;

		setData(o => ({ ...o, unit: u }))
		updateChild({ ...order, unit: u })
	}

	// function responseReceivableChange(params: { method: string, receivable?: iReceivable }) {
	// 	const { method, receivable } = params

	// 	const u = method === 'remove' ? initReceivable : receivable;

	// 	setData(o => ({ ...o, receivable: u }))
	// 	updateChild({ ...order, receivable: u })
	// }

	function responseCustomerChange(params: { method: string, customer?: iCustomer }) {
		const { method, customer } = params

		const cust = method === 'remove' ? initCustomer : customer;

		setData(o => ({ ...o, customer: cust }))
		updateChild({ ...order, customer: cust })
	}

	function changeData(fieldName: string, value: string | number | boolean | undefined | null) {
		setData(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}


}

export default OrderForm;