import React, { Fragment, useState } from "react";
import { Link as RouterLink } from 'react-router-dom';
import axios from "../lib/axios-base";
import { iFinance } from '../lib/interfaces'
import { Button, ComboBox, Text, Flex, Item, Link, ProgressCircle, SearchField, useAsyncList, View } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "../lib/format";
import MonthComponent from "../component/Bulan";
import { useNavigate } from "react-router-dom";
import { InvoiceInfo } from "./InvoiceForm";

// const OrderForm = React.lazy(() => import('./Form'))


const Invoice = () => {
	const [financeId, setFinanceId] = useState<number>(0);
	const [txtSearch, setTxtSearch] = useState<string>('');
	const [bulan, setBulan] = useState<number>(0);
	const navigate = useNavigate();

	let finances = useAsyncList<iFinance>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/finances/", { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})

			return { items: res ? res : [] }
		},
		getKey: (item: iFinance) => item.id
	})

	let invoices = useAsyncList<InvoiceInfo>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/invoice/", { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})

			return { items: res ? res : [] }
		},
		getKey: (item: InvoiceInfo) => item.id
	})

	if (invoices.isLoading || finances.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<Fragment>
			<View marginBottom={'size-200'}><span className="div-h1">Invoices</span></View>

			<Flex direction={{ base: 'column', M: 'row' }} gap='size-100' marginY={'size-200'}>				
				<SearchField
					type="search"
					aria-label="order-search-item"
					flex
					width={'auto'}
					value={txtSearch}
					placeholder={'e.g. yamaha | 2022 | BAF'}
					//validationState={txtSearch.length > 2 ? 'valid' : 'invalid'}
					maxLength={50}
					onClear={() => {
						loadAllInvoices();
					}}
					onSubmit={(e) => {
						searchOrders(e)
					}}
					onChange={(e) => setTxtSearch(e)}
				/>
				<MonthComponent width="125px" selectedId={bulan}
					onChange={(e) => {
						setBulan(e.id);
						if (e.id > 0) {
							getOrdersByMonth(e.id)
						} else {
							loadAllInvoices();
						}
					}} />
				<ComboBox
					flex={{ base: true, M: false }}
					width={{ base: 'auto', M: "150px" }}
					aria-label="order-search-finance"
					labelPosition={'side'}
					menuTrigger='focus'
					placeholder={"e.g. Adira"}
					items={[{ id: 0, shortName: 'Semua finance', name: '', descriptions: '' }, ...finances.items]}
					selectedKey={financeId}
					onSelectionChange={(e) => {
						setFinanceId(+e);
						(+e === 0) ? loadAllInvoices() : getInvoicesByFinance(+e)
					}}
				>
					{(o) => <Item textValue={o.shortName}>
						<Text>{o.shortName}</Text>
						<Text slot='description'>{o.name}</Text>
					</Item>}
				</ComboBox>
				<Button isDisabled={financeId === 0} variant="cta" onPress={() => navigate(`/invoice/${financeId}/0`)}>Buat invoice baru</Button>
			</Flex>
			{invoices.items.map((e, i) => <TableInvoice key={e.id} invoice={e} />)}
		</Fragment>
	)


	async function searchOrders(e: string) {

		invoices.setSelectedKeys('all')
		invoices.removeSelectedItems();

		const headers = {
			'Content-Type': 'application/json'
		}

		//const txt = e.replace(/ /g, ' | ')

		await axios
			.post(`/invoice/search/`, { txt: e }, { headers: headers })
			.then(response => response.data)
			.then(data => {
				invoices.append(...data);
			})
			.catch(error => {
				console.log('-------', error)
			})

	}

	async function getOrdersByMonth(id: number) {

		invoices.setSelectedKeys('all')
		invoices.removeSelectedItems();

		const headers = {
			'Content-Type': 'application/json'
		}

		await axios
			.get(`/invoice/month/${id}/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				invoices.append(...data);
			})
			.catch(error => {
				console.log(error)
			})

	}

	async function getInvoicesByFinance(id: number) {

		invoices.setSelectedKeys('all')
		invoices.removeSelectedItems();

		const headers = {
			'Content-Type': 'application/json'
		}

		await axios
			.get(`/invoice/finance/${id}/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				invoices.append(...data);
			})
			.catch(error => {
				console.log(error)
			})

	}

	async function loadAllInvoices() {

		invoices.setSelectedKeys('all')
		invoices.removeSelectedItems();

		const headers = {
			'Content-Type': 'application/json'
		}

		await axios
			.get(`/invoice/`, { headers: headers })
			.then(response => response.data)
			.then(data => {
				invoices.append(...data);
			})
			.catch(error => {
				console.log('-------', error)
			})

	}
}

export default Invoice;

type TableProp = { invoice: InvoiceInfo }
function TableInvoice({
	invoice
}: TableProp) {

	return (
		<Flex direction={{ base: "column", M: "row" }} rowGap={"size-100"} columnGap={"size-200"}>
			<View>
				<View>No: <Link isQuiet variant="primary">
					<Link isQuiet variant='primary'>
						<RouterLink to={`/invoice/${invoice.financeId}/${invoice.id}`}>#{invoice.id}</RouterLink>
					</Link>
				</Link></View>
				<View>Tanggal: {FormatDate(invoice.invoiceAt)}</View>
				<View>Term: {invoice.paymentTerm === 1 ? "Cash" : "Transfer"} : {invoice.account ? invoice.account.name : ''}</View>
				<View>Total: {FormatNumber(invoice.total)}</View>
			</View>
			<View>
				<View>Jatuh tempo: {FormatDate(invoice.dueAt)}</View>
				<View>Salesman: {invoice.salesman}</View>
				<View>Finance: {invoice.finance ? `${invoice.finance.name} (${invoice.finance.shortName})` : ""}</View>
				<View>Memo: {invoice.memo || '-'}</View>
			</View>
		</Flex>
	)
}
