import React, { FormEvent, useEffect, useState } from "react";
import {
	ComboBox, Divider, Flex, Item, ProgressCircle,
	TextField, Text, View, TextArea, NumberField,
	useAsyncList, Button
} from "@adobe/react-spectrum";
import { dateOnly, dateParam, iAccCode, iAccountSpecific, iFinance } from "../lib/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import { iInvoice } from "../lib/invoice-interfaces";
import axios from "../lib/axios-base";
import TableOrder, { OrderLists } from "./TableOrder";


const OrderList = React.lazy(() => import('./OrderList'))

export interface InvoiceInfo extends iInvoice {
	finance?: iFinance
	account?: iAccCode
}

interface InvoiceById extends InvoiceInfo {
	finance?: iFinance
	account?: iAccCode
	details?: OrderLists[]
}

const initInvoice: InvoiceById = {
	id: 0,
	invoiceAt: dateParam(null),
	paymentTerm: 0,
	dueAt: dateParam(null),
	salesman: '',
	financeId: 0,
	total: 0,
	accountId: 0
}

const InvoiceForm = () => {
	const { financeId, invoiceId } = useParams()
	const [invoice, setInvoice] = useState<InvoiceById>({ ...initInvoice, financeId: financeId ? +financeId : 0})
	const [finance, setFinance] = useState<iFinance>({} as iFinance)
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [showOrderList, setShowOrderList] = useState(false)
	const navigate = useNavigate();

	const isCashValid = React.useMemo(
		() => invoice.accountId > 0,
		[invoice]
	)

	const isListValid = React.useMemo(
		() => {
			if (invoice.details) {
				return invoice.details.filter(f => f.isSelected).length > 0
			}
			return false;
		},
		[invoice]
	)

	const isTermValid = React.useMemo(
		() => invoice.paymentTerm > 0,
		[invoice]
	)

	const isSalesValid = React.useMemo(
		() => invoice.salesman.length > 0,
		[invoice]
	)
	const isDueValid = React.useMemo(
		() => {
			const startDate = new Date(invoice.invoiceAt)
			const endDate = new Date(invoice.dueAt)
			return endDate >= startDate
		},
		[invoice]
	)

	let accountCashes = useAsyncList<iAccountSpecific>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/acc-code/spec/1/", { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})

			return { items: res ? res : [] }
		},
		getKey: (item: iAccountSpecific) => item.id
	})

	async function loadInvoice(id?: string): Promise<InvoiceById> {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		let res = await axios
			.get(`/invoice/${id}/`, { headers: headers })
			.then(response => response.data)
			.then(data => data)
			.catch(error => {
				console.log(error)
			})

			console.log('-------------', res)
		return res;
	}


	useEffect(() => {
		let isLoaded = false;

		async function getFinance(id?: string): Promise<iFinance> {
			const headers = {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get(`/finances/${id}/`, { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})

			return res;
		}

		if (!isLoaded) {
			getFinance(financeId).then(e => {
				setFinance(e)
			})
			if (invoiceId && invoiceId !== '0') {
				loadInvoice(invoiceId).then(data => {
					setInvoice(data)
				})
			}

		}

		return () => { isLoaded = true }
	}, [financeId, invoiceId])


	if (accountCashes.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle size={'M'} aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<View>
			<View marginBottom={'size-200'}><span className="div-h1">Invoice #{invoiceId}</span></View>
			<form onSubmit={handleSubmit}>
				<Flex direction={{ base: 'column', M: 'row' }} rowGap={'size-400'} columnGap={'size-100'}>
					<Flex flex direction={'column'} columnGap={'size-200'} alignSelf='self-start'>
						<View flex>
							<strong>{finance.name} - ({finance.shortName})</strong>
						</View>
						<View flex>
							<div>{finance?.street}{finance.city ? `, ${finance.city}` : ''}
								{finance.zip ? ` - ${finance.zip}` : ''}
							</div>
							<div>{finance.phone ? `Telp. ${finance.phone}` : ''}
								{finance.cell && finance.phone ? ` / ` : ''}
								{finance.cell && finance.phone === '' ? `Cellular: ` : ''}
								{finance.cell ?? ''}
							</div>
							<div>{finance.email ? `e-mail: ${finance.email}` : ''}</div>

						</View>
					</Flex>
					<Flex width={{ base: 'auto', M: '35%' }} direction={'column'} rowGap={'size-75'}>
						<TextField
							flex
							type={'date'}
							label={<div style={{ width: '100px' }}>Tanggal</div>}
							labelPosition="side"
							width={{ base: 'auto' }}
							value={dateOnly(invoice.invoiceAt)}
							onChange={(e) => handleChange("orderAt", e)}
						/>
						<ComboBox
							flex
							menuTrigger="focus"
							width={'auto'}
							labelPosition={'side'}
							validationState={isTermValid ? 'valid' : 'invalid'}
							label={<div style={{ width: '100px' }}>Payment Term</div>}
							placeholder={"e.g. Cash"}
							defaultItems={[{ id: 1, name: 'Cash' }, { id: 2, name: 'Transfer' }]}
							selectedKey={invoice.paymentTerm}
							onSelectionChange={(e) => handleChange("paymentTerm", e)}
						>
							{(item) => <Item textValue={item.name}>{item.name}</Item>}
						</ComboBox>
						<TextField
							flex
							type={'date'}
							label={<div style={{ width: '100px' }}>Jatuh tempo</div>}
							labelPosition="side"
							validationState={isDueValid ? 'valid' : 'invalid'}
							width={{ base: 'auto' }}
							value={dateOnly(invoice.dueAt)}
							onChange={(e) => handleChange("dueAt", e)}
						/>
						<TextField
							flex
							label={<div style={{ width: '100px' }}>Salesman</div>}
							labelPosition="side"
							width={{ base: 'auto' }}
							validationState={isSalesValid ? 'valid' : 'invalid'}
							placeholder={'e.g. Beli kopi dan rokok untuk om Mastur.'}
							value={invoice.salesman}
							maxLength={128}
							onChange={(e) => handleChange("salesman", e)}
						/>
					</Flex>
				</Flex>
				{showOrderList && <View marginY={'size-200'}>{showOrderList && <React.Suspense fallback={<div>Please wait...</div>}>
					<OrderList financeId={financeId ? +financeId : 0}
						invoiceId={invoiceId ? +invoiceId : 0}
						onFinish={(list) => {
							setInvoice(o => ({ ...o, details: list }))
							setShowOrderList(false)
							setIsDirty(true)
						}}
						onCancel={() => setShowOrderList(false)}
					/>
				</React.Suspense>}
				</View>
				}

				{!showOrderList &&
					<View marginY={'size-200'} >
						<TableOrder list={invoice.details} onCheck={(id, e) => handleDetails(id, e)} />
						<View marginY={'size-200'}>
							<Button variant="cta" onPress={() => setShowOrderList(true)}>Tambahkan Order (SPK)</Button>
						</View>
					</View>
				}
				<Divider size="M" marginY={'size-200'} />
				<Flex direction={'column'} rowGap={'size-50'}>
					<TextArea
						label='Memo'
						marginBottom={'size-200'}
						flex
						width={'auto'}
						placeholder={'e.g. Memo'}
						value={invoice.memo || ''}
						maxLength={256}
						onChange={(e) => handleChange("memo", e)}
					/>
					<Flex flex direction={{ base: 'column', M: 'row' }} rowGap={'size-75'} columnGap={'size-400'} alignItems={'start'}>
						<Flex flex direction={'column'} rowGap={'size-75'} width={'auto'}>
							<NumberField
								hideStepper={true}
								width={{ base: "auto" }}
								labelPosition={'side'}
								label={<div style={{ width: '100px', fontWeight: 700, color: 'green' }}>Total invoice</div>}
								isReadOnly
								validationState={isListValid ? 'valid' : 'invalid'}
								value={getTotalInvoice()}
								onChange={(e) => handleChange("total", e)}
							/>
							<ComboBox
								flex
								menuTrigger='focus'
								width={'auto'}
								labelPosition={'side'}
								label={<div style={{ width: '100px' }}>Akun kas / bank</div>}
								validationState={isCashValid ? 'valid' : 'invalid'}
								placeholder={"e.g. Kas / bank"}
								defaultItems={accountCashes.items}
								selectedKey={invoice.accountId}
								onSelectionChange={(e) => handleChange("accountId", +e)}
							>
								{(item) => <Item textValue={`${item.id} - ${item.name}`}>
									<Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
									<Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
								</Item>}
							</ComboBox>
							{invoice.accountId > 0 && <ShowCash account={accountCashes.getItem(invoice.accountId)} />}
						</Flex>
						<Flex flex width={'auto'} direction={'row'} columnGap={'size-200'}>
							<View flex><Button variant="primary">Download</Button></View>
							<Flex direction={'row'} columnGap={'size-200'}>
								<Button type={'submit'} variant="cta" isDisabled={!isDirty || !(isListValid && isCashValid && isDueValid && isSalesValid && isTermValid)}>Save</Button>
								<Button variant="negative" isDisabled={invoiceId ? +invoiceId === 0 : false}>Remove</Button>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
			</form>
		</View>
	)

	function getTotalInvoice() {
		if (invoice.details) {
			return invoice.details.filter(f => f.isSelected).reduce((t, c) => t + c.btFinance, 0)
		}
		return 0
	}

	function handleDetails(id: number, e: boolean) {
		const details: OrderLists[] = invoice.details ? invoice.details : [];
		if (details.length > 0) {
			let i = -1;
			for (let c = 0; c < details.length; c++) {
				if (details[c].id === id) {
					i = c;
					break;
				}
			}

			if (i >= 0) {
				const detail = { ...details[i], isSelected: e };
				details.splice(i, 1, detail)
				setInvoice(o => ({ ...o, details: details }))
				setIsDirty(true)
			}
		}
	}


	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setInvoice(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}


	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		if(invoice.id === 0) {
			insertInvoice(invoice).then(data => {
				if(data) {
					navigate('/invoice/list')
				}
			});
		}
	}

	function createTransaction(p: InvoiceById) {

		const exInvoice = { ...p, total: getTotalInvoice() };
		delete exInvoice.details
		delete exInvoice.finance
		delete exInvoice.account

		return {
			invoice: exInvoice,
			detailIds: createDetail(p.details),
			token: createToken(p)
		}

	}

	function createToken(p: InvoiceById) {
		const s: string[] = [];

		if (p.memo) {
			s.push(p.memo);
		}
		s.push(p.salesman);

		return s.join(" ");
	}

	function createDetail(details?: OrderLists[]) {
		if (details) {
			return details.filter(f => f.isSelected).map(o => o.id)
		}
		return []
	}

	async function insertInvoice(p: InvoiceById): Promise<Boolean> {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const data = createTransaction(p)

		const res = await axios
			.post(`/invoice/`, data, { headers: headers })
			.then(response => response.data)
			.then(data => data ? true : false)
			.catch(error => {
				console.log(error)
				return false;
			})
		return res		 
	}	
}

export default InvoiceForm;

type showCashProps = {
	account: iAccountSpecific
}
function ShowCash({ account }: showCashProps) {
	return <View marginStart={'calc(100px + size-75 + 2px)'}>
		<View>{account.name}</View>
		<View>{account.descriptions ?? '-'}</View>
	</View>
}
