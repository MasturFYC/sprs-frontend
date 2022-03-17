import React, { useState } from "react";
import axios from "../lib/axios-base";
import { iFinance } from '../lib/interfaces'
import { ComboBox, Text, Flex, Item, ProgressCircle, SearchField, useAsyncList, View, Divider, NumberField } from "@adobe/react-spectrum";
import MonthComponent from "../component/Bulan";
import { InvoiceInfo, TableInvoice } from "./TableProp";

// const OrderForm = React.lazy(() => import('./Form'))
const defaultYear = new Date().getFullYear()

const Invoice = () => {
	const [financeId, setFinanceId] = useState<number>(0);
	const [txtSearch, setTxtSearch] = useState<string>('');
	const [bulan, setBulan] = useState<number>(0);
	const [year, setYear] = useState<number>(defaultYear);


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
				.get("/invoices/", { headers: headers })
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
		<View>
			<View marginBottom={'size-200'}><span className="div-h1">Invoices</span></View>

			<Flex direction={{ base: 'column', M: 'row' }} gap='size-100' marginY={'size-200'}>
				<SearchField
					type="search"
					aria-label="order-search-item"
					flex
					width={'auto'}
					defaultValue={txtSearch}
					placeholder={'e.g. yamaha | 2022 | BAF'}
					//validationState={txtSearch.length > 2 ? 'valid' : 'invalid'}
					maxLength={50}
					onClear={() => {
						loadAllInvoices();
					}}
					onSubmit={(e) => {
						searchInvoices(e)
					}}
					onChange={(e) => setTxtSearch(e)}
				/>
				<NumberField
					label='Tahun'
					labelPosition="side"
					formatOptions={{ useGrouping: false }}
					hideStepper={true}
					width={'110px'}
					defaultValue={year}
					onChange={(e) => {
						setYear(e);
						getOrdersByMonth(bulan, e)
					}}
				/>
				<MonthComponent width="150px" selectedId={bulan}
					onChange={(e) => {
						setBulan(e.id);
							getOrdersByMonth(e.id, year)
					}} />
				<ComboBox
					flex={{ base: true, M: false }}
					width={{ base: 'auto', M: "200px" }}
					aria-label="order-search-finance"
					labelPosition={'side'}
					menuTrigger='focus'
					placeholder={"e.g. Adira"}
					items={[{ id: 0, shortName: 'Semua finance', name: '', descriptions: '' }, ...finances.items]}
					defaultSelectedKey={financeId}
					onSelectionChange={(e) => {
						setFinanceId(+e);
						getInvoicesByFinance(+e);
					}}
				>
					{(o) => <Item textValue={o.shortName}>
						<Text>{o.shortName}</Text>
						<Text slot='description'>{o.name}</Text>
					</Item>}
				</ComboBox>
			</Flex>
			<Divider size="S" marginY={'size-100'} />
			{invoices.items.map((e, i) => <TableInvoice key={e.id} invoice={e} />)}
		</View>
	)


	async function searchInvoices(e: string) {

		invoices.setSelectedKeys('all')
		invoices.removeSelectedItems();

		const headers = {
			'Content-Type': 'application/json'
		}

		//const txt = e.replace(/ /g, ' | ')

		await axios
			.post(`/invoices/search/`, { txt: e }, { headers: headers })
			.then(response => response.data)
			.then(data => {
				invoices.append(...data);
			})
			.catch(error => {
				console.log('-------', error)
			})

	}

	async function getOrdersByMonth(month: number, year: number) {

		invoices.setSelectedKeys('all')
		invoices.removeSelectedItems();

		const headers = {
			'Content-Type': 'application/json'
		}

		await axios
			.get(`/invoices/month-year/${month}/${year}/`, { headers: headers })
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
			.get(`/invoices/finance/${id}/`, { headers: headers })
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
			.get(`/invoices/`, { headers: headers })
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


