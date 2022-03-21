import React, { FormEvent, useEffect, useState } from "react";
import {
	ComboBox, Divider, Flex, Item, ProgressCircle,
	TextField, Text, View, TextArea, NumberField,
	useAsyncList, Button
} from "@adobe/react-spectrum";
import { dateOnly, dateParam, iAccCode, iAccountSpecific, iFinance, iTrxDetail } from "../lib/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../lib/axios-base";
import TableOrder, { OrderLists } from "./TableOrder";
import { InvoiceInfo } from "./InvoiceList";
import { MitraKerja } from "./MitraKerja";
import { ShowCash } from "./ShowCash";


const OrderList = React.lazy(() => import('./OrderList'))

type TransactionDetailsType = {
	id: number
	codeId: number
	trxId: number
	debt: number
	cred: number
}

type TransactionType = {
	id: number
	refId: number
	division: string
	trxDate: string
	descriptions: string
	memo?: string
	saldo: number,
	details?: TransactionDetailsType[]
}

interface InvoiceById extends InvoiceInfo {
	finance?: iFinance
	account?: iAccCode
	details?: OrderLists[]
	transaction?: TransactionType
}

const initInvoice: InvoiceById = {
	id: 0,
	invoiceAt: dateParam(null),
	paymentTerm: 0,
	dueAt: dateParam(null),
	salesman: '',
	financeId: 0,
	total: 0,
	tax: 0,
	accountId: 0
}

const InvoiceForm = () => {
	const { financeId, invoiceId } = useParams()
	const [invoice, setInvoice] = useState<InvoiceById>({ ...initInvoice, financeId: financeId ? +financeId : 0 })
	const [finance, setFinance] = useState<iFinance>({} as iFinance)
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [showOrderList, setShowOrderList] = useState(false)
	const debtAccount = 4111;
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
	const isDateValid = React.useMemo(
		() => {
			const today = new Date()
			const invDate = new Date(invoice.invoiceAt)
			return invDate <= today
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
			.get(`/invoices/${id}/`, { headers: headers })
			.then(response => response.data)
			.then(data => data)
			.catch(error => {
				console.log(error)
			})

		//	console.log(res)
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
			setShowOrderList(false)
			getFinance(financeId).then(e => {
				setFinance(e)
			})
			if (invoiceId && invoiceId !== '0') {
				loadInvoice(invoiceId).then(data => {
					setInvoice(data)
				})
			} else {
				setInvoice({ ...initInvoice, financeId: financeId ? +financeId : 0 })
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
				<Flex direction={{ base: 'column', M: 'row' }} rowGap={'size-200'} columnGap={'size-400'}>
					<MitraKerja finance={finance} />
					<Flex flex width={'auto'} direction={'column'} rowGap={'size-75'} alignSelf={{ base: 'stretch', L: 'flex-end' }}>
						<TextField
							flex
							type={'date'}
							validationState={isDateValid ? 'valid' : 'invalid'}
							label={<div style={{ width: '100px' }}>Tanggal</div>}
							labelPosition="side"
							width={{ base: 'auto' }}
							value={dateOnly(invoice.invoiceAt)}
							onChange={(e) => handleChange("invoiceAt", e)}
						/>
						<ComboBox
							flex
							menuTrigger="focus"
							width={'auto'}
							labelPosition={'side'}
							validationState={isTermValid ? 'valid' : 'invalid'}
							label={<div style={{ width: '100px' }}>Payment term</div>}
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
				<View>
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
				</View>
				<View>

					{!showOrderList &&
						<View marginY={'size-200'} >
							<TableOrder list={invoice.details} onCheck={(id, e) => handleDetails(id, e)} />
							<View marginY={'size-200'}>
								<Button variant="primary" onPress={() => setShowOrderList(true)}>Tambahkan Order (SPK)</Button>
							</View>
						</View>
					}
				</View>
				<Divider size="M" marginY={'size-200'} />

				<Flex flex direction={{ base: 'column', M: 'row' }} rowGap={'size-200'} columnGap={'size-400'}>
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
					<Flex width={"auto"} flex direction={'column'} rowGap={'size-75'}>
						<NumberField
							flex
							width={"auto"}
							hideStepper={true}
							labelPosition={'side'}
							label={<div style={{ width: '100px', fontWeight: 700, color: 'green' }}>Total invoice</div>}
							isReadOnly
							validationState={isListValid ? 'valid' : 'invalid'}
							value={getTotalInvoice()}
							onChange={(e) => handleChange("total", e)}
						/>
						<NumberField
							flex
							hideStepper={true}
							width={"auto"}
							labelPosition={'side'}
							label={<div style={{ width: '100px' }}>Pajak</div>}
							isReadOnly
							value={getTotalTax()}
							onChange={(e) => handleChange("tax", e)}
						/>
						<NumberField
							flex
							hideStepper={true}
							width={"auto"}
							labelPosition={'side'}
							label={<div style={{ width: '100px' }}>Grand total</div>}
							isReadOnly
							value={getTotalTax() + getTotalInvoice()}

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
				</Flex>
				<Divider size="S" marginY={'size-200'} />
				<Flex flex width={"auto"} direction={'row'} columnGap={'size-100'}>
					<Flex flex direction={'row'} columnGap={'size-200'}>
						<Button type={'submit'} variant="cta" isDisabled={!isDirty || !(isListValid && isDateValid && isCashValid && isDueValid && isSalesValid && isTermValid)}>Save</Button>
						<Button onPress={() => navigate('/invoice/list')} variant="primary">{isDirty ? 'Cancel' : 'Close'}</Button>
					</Flex>
					<View>
						<Button
							variant="negative" isDisabled={invoiceId ? +invoiceId === 0 : false}
							onPress={() => removeInvoice(invoice.id).then(isDeleted => {
								if (isDeleted) {
									navigate('/invoice/list')
								}
							})}
						>Remove</Button>
					</View>
				</Flex>

			</form>
		</View>
	)

	async function removeInvoice(id: number): Promise<Boolean> {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const res = await axios
			.delete(`/invoices/${id}/`, { headers: headers })
			.then(response => response.data)
			.then(data => data ? true : false)
			.catch(error => {
				console.log(error)
				return false;
			})
		return res
	}

	function getTotalInvoice() {
		if (invoice.details) {
			return invoice.details.filter(f => f.isSelected).reduce((t, c) => t + c.btFinance, 0)
		}
		return 0
	}

	function getTotalTax() {
		if (invoice.details) {
			return invoice.details.filter(f => f.isSelected).reduce((t, c) => t + c.nominal, 0)
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
		if (invoice.id === 0) {
			insertInvoice(invoice).then(data => {
				if (data) {
					navigate('/invoice/list')
				}
			});
		} else {
			updateInvoice(invoice.id, invoice).then(data => {
				if (data) {
					navigate('/invoice/list')
				}
			});
		}
	}

	function createInvoice(p: InvoiceById) {

		const exInvoice = { ...p, total: getTotalInvoice(), tax: getTotalTax() };
		const transact = p.transaction;
		const detailIds = createInvoiceDetail(p.details)
		const token = createInvoiceToken(exInvoice)

		delete exInvoice.details
		delete exInvoice.finance
		delete exInvoice.account

		const transaction = createTransaction(exInvoice, transact);

		return {
			invoice: exInvoice,
			detailIds: detailIds,
			token: token,
			transaction: transaction
		}

	}

	function createTransaction(inv: InvoiceById, transact?: TransactionType) {

		if (transact) {
			if (transact.details) {
				if (inv.tax > 0) {
					transact.details[0].cred = inv.total
					transact.details[1].debt = inv.total - inv.tax
					if (transact.details.length > 2) {
						transact.details[2].debt = inv.tax
					} else {
						transact.details.push({
							id: 3,
							codeId: 6011, // Pajak
							trxId: transact.id,
							debt: inv.tax,
							cred: 0
						})
					}
				} else {
					transact.details[0].cred = inv.total
					transact.details[1].debt = inv.total
				}
			}
			return transact;

		}
		return {
			id: 0,
			refId: inv.id,
			division: 'trx-invoice',
			descriptions: 'Pendapatan jasa dari ' + finance.name + ' Invoice #' + (inv.id === 0 ? '' : inv.id),
			trxDate: dateParam(null),
			memo: inv.memo,
			saldo: inv.total,
			details: createTransactionDetails(inv)
		}
	}

	function createInvoiceToken(p: InvoiceById) {
		const s: string[] = [];

		if (p.memo) {
			s.push(p.memo);
		}
		s.push(p.salesman);
		s.push('/id-' + p.id)

		if (finance) {
			s.push(finance.name)
			s.push(finance.shortName)
		}

		if (p.account) {
			s.push(p.account.name)
		}
		if (p.details) {
			for (let c = 0; c < p.details.length; c++) {
				const d = p.details[c]
				if (d.unit) {
					s.push(d.unit.nopol)
					if (d.unit.type) {
						s.push(d.unit.type.name)
					}
				}
			}
		}

		return s.join(" ");
	}

	function createTransactionDetails(inv: InvoiceById): iTrxDetail[] {
		const details: iTrxDetail[] = [];


		details.push({
			id: 1,
			codeId: debtAccount,
			trxId: 0,
			debt: 0,
			cred: inv.total
		})

		details.push({
			id: 2,
			codeId: inv.accountId, // Bank BCA
			trxId: 0,
			debt: inv.tax > 0 ? inv.total - inv.tax : inv.total,
			cred: 0
		})

		if (inv.tax > 0) {
			details.push({
				id: 3,
				codeId: 6011, // akun pajak
				trxId: 0,
				debt: inv.tax,
				cred: 0
			})
		}

		return details;
	}

	function createInvoiceDetail(details?: OrderLists[]) {
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

		const data = createInvoice(p)
		//console.log(data)

		const res = await axios
			.post(`/invoices/`, data, { headers: headers })
			.then(response => response.data)
			.then(data => data ? true : false)
			.catch(error => {
				console.log(error)
				return false;
			})
		return res
	}

	async function updateInvoice(id: number, p: InvoiceById): Promise<Boolean> {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}

		const data = createInvoice(p)

		// console.log(data)

		const res = await axios
			.put(`/invoices/${id}/`, data, { headers: headers })
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


