import React, { FormEvent, useState } from 'react';
import { dateParam, dateOnly, iBranch, iFinance, iOrder, iCustomer, iUnit, iReceivable, iTask, iAddress } from '../component/interfaces'
import { Button, ComboBox, Flex, TextField, useAsyncList, View, Text, NumberField, Checkbox, Tabs, TabList, ProgressCircle, Divider } from '@adobe/react-spectrum';
import axios from '../component/axios-base';
import { Item } from "@react-spectrum/combobox";

const CustomerForm = React.lazy(() => import('./CustomerForm'));
const ReceivableForm = React.lazy(() => import('./Receivable'));
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

const initReceivable: iReceivable = {
  orderId: 0,
  covenantAt: dateParam(null),
  dueAt: dateParam(null),
  mortgageByMonth: 0,
  mortgageReceivable: 0,
  runningFine: 0,
  restFine: 0,
  billService: 0,
  payDeposit: 0,
  restReceivable: 0,
  restBase: 0,
  dayPeriod: 0,
  mortgageTo: 0,
  dayCount: 0
}

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
	bpkbName: '',
	color: '',
	dealer: '',
	typeId: 0,
	warehouseId: 0
}

const initOrder: iOrder = {
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
	isStnk: true,
	stnkPrice: 0
}

type OrderFormOptions = {
	order: iOrder,
	updateChild: (data: iOrder) => void,
	callback: (params: { method: string, data?: iOrder }) => void
}

const OrderForm = (props: OrderFormOptions) => {
	const { order, callback, updateChild } = props;
	const [data, setData] = useState<iOrder>(initOrder)
	let [tabId, setTabId] = useState(1);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [message, setMessage] = useState<string>('');

	const isNameValid = React.useMemo(
		() => data.name.length > 5,
		[data]
	)

	const isFinanceValid = React.useMemo(
		() => data.financeId > 0,
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
	const isPpnValid = React.useMemo(
		() => data.subtotal >= 0,
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
		let isLoaded = true;

		if (isLoaded) {
			setData(order)
		}

		return () => { isLoaded = false }

	}, [order])

	if (finances.isLoading || branchs.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
	}

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
									isDisabled={!isDirty || !(isNameValid && isBranchValid && isFinanceValid && isPpnValid
										&& isBtFinanceValid && isBtPercentValid && isPpnValid && isStnkValid)}
									variant='cta'>Save</Button>
								<Button type='button' variant='primary'
									onPress={() => callback({ method: 'cancel' })}>
									{isDirty ? 'Cancel' : 'Close'}
								</Button>
							</Flex>
							<View flex><span style={{ fontWeight: 700, fontSize: '16px' }}>DATA ORDER</span></View>
							{data.id > 0 &&
								<View>
									<Button type='button' alignSelf={'flex-end'} variant='negative'
										isDisabled={data.id === 0}
										onPress={() => deleteData(data.id)}>Remove</Button>
								</View>
							}
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
								flex={{ base: '1', M: 'none' }}
								type={'date'}
								label='Tanggal'
								width={{ base: 'auto', M: '25%' }}
								value={dateOnly(data.orderAt)}
								maxLength={10}
								onChange={(e) => changeData("orderAt", e)}
							/>
							<TextField
								type={'date'}
								label='Tanggal cetak'
								width={{ base: 'auto', M: '25%' }}
								value={dateOnly(data.printedAt)}
								maxLength={10}
								onChange={(e) => changeData("printedAt", e)}
							/>
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
							<NumberField
								flex
								hideStepper={true}
								validationState={isBtFinanceValid ? 'valid' : 'invalid'}
								width={"auto"}
								label={"BT Finance"}
								onChange={(e) => setFinance(e)}
								value={data.btFinance} />
							<Checkbox isSelected={data.isStnk}
								marginTop={'size-300'}
								onChange={(e) => {
									if (e) {
										setStnk(0)
									}
									changeData("isStnk", e)
								}}>
								Ada STNK
							</Checkbox>
							<NumberField
								isDisabled={data.isStnk}
								hideStepper={true}
								validationState={isStnkValid ? 'valid' : 'invalid'}
								width={"auto"}
								label={"Potongan STNK"}
								onChange={(e) => setStnk(e)}
								value={data.stnkPrice} />
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
								onChange={(e) => changeData("btMatel", e)}
								width={"auto"}
								label={"BT Matel"}
								value={data.btMatel} />
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
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
								onChange={(e) => changeData("nominal", e)}
								label={"Nominal"}
								value={data.nominal} />
							<NumberField
								flex
								hideStepper={true}
								isReadOnly
								width={"auto"}
								onChange={(e) => changeData("subtotal", e)}
								label={"Profit"}
								value={data.subtotal} />
						</Flex>
						<Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
							<ComboBox
								menuTrigger="focus"
								flex
								validationState={isFinanceValid ? "valid" : "invalid"}
								width={'auto'}
								label={"Finance"}
								placeholder={"e.g. Adira"}
								defaultItems={finances.items}
								selectedKey={data.financeId}
								onSelectionChange={(e) => {
									setIsDirty(true);
									setData((o) => ({
										...o,
										financeId: +e,
										finance: finances.getItem(+e)
									}))
								}}
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
								label={"Cabang penerima order"}
								placeholder={"e.g. Pusat"}
								defaultItems={branchs.items}
								selectedKey={data.branchId}
								onSelectionChange={(e) => {
									setIsDirty(true);
									setData((o) =>
									({
										...o,
										branchId: +e,
										branch: branchs.getItem(+e)
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

						<Flex direction="row">
							<Checkbox isSelected={data.verifiedBy ? data.verifiedBy?.length > 0 : false}
								onChange={(e) => changeData("verifiedBy", e ? data.userName : '')}>
								Verified
							</Checkbox>
							<Checkbox isSelected={data.validatedBy ? data.validatedBy?.length > 0 : false}
								onChange={(e) => changeData("validatedBy", e ? data.userName : '')}>
								Validated
							</Checkbox>
						</Flex>

					</Flex>
				</form>
			</View>
			{data.id > 0 &&
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
								<Item key={0}><span style={{ fontWeight: 700, color: 'green' }}>Data Konsumen</span></Item>
								<Item key={1}><span style={{ fontWeight: 700, color: 'orangered' }}>Data Asset</span></Item>
								<Item key={2}><span style={{ fontWeight: 700, color: 'green' }}>Data Tunggakan</span></Item>
								<Item key={3}><span style={{ fontWeight: 700, color: 'green' }}>History</span></Item>
								<Item key={4}><span style={{ fontWeight: 700, color: 'green' }}>Data Alamat</span></Item>
								<Item key={5}><span style={{ fontWeight: 700, color: 'green' }}>Perintah dan Tugas</span></Item>
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
							{tabId === 2 &&
								<React.Suspense fallback={<div>Please wait...</div>}>
									<ReceivableForm
										receive={data.receivable ? { ...data.receivable, orderId: data.id } : { ...initReceivable, orderId: data.id }}
										isNew={data.receivable ? data.receivable.orderId === 0 : true}
										callback={(e) => responseReceivableChange(e)} />
								</React.Suspense>
							}
							{tabId === 3 && <Action orderId={data.id} />}
							{tabId === 4 &&
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
							{tabId === 5 &&
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

		</View>

	);

	function setFinance(v: number) {
		const matel = v - (v * (data.btPercent / 100))
		const nominal = v * (data.ppn / 100.0)

		setData(o => ({
			...o,
			btFinance: v,
			btMatel: matel,
			nominal: nominal,
			subtotal: v - matel - nominal - o.stnkPrice
		}))

		setIsDirty(true)
	}

	function setPercent(v: number) {
		const matel = data.btFinance - (data.btFinance * (v / 100.0))

		setData(o => ({
			...o,
			btPercent: v,
			btMatel: matel,
			subtotal: o.btFinance - matel - o.nominal - o.stnkPrice
		}))

		setIsDirty(true)
	}

	function setPpn(v: number) {
		const nominal = data.btFinance * (v / 100.0)
		setData(o => ({
			...o,
			ppn: v,
			nominal: nominal,
			subtotal: o.btFinance - o.btMatel - nominal - o.stnkPrice
		}))

		setIsDirty(true)
	}

	function setStnk(v: number) {
		setData(o => ({
			...o,
			stnkPrice: v,
			subtotal: o.btFinance - o.btMatel - o.nominal - v
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
				//console.log(data)
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

	function responseReceivableChange(params: { method: string, receivable?: iReceivable }) {
		const { method, receivable } = params

		const u = method === 'remove' ? initReceivable : receivable;

		setData(o => ({ ...o, receivable: u }))
		updateChild({ ...order, receivable: u })
	}

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