import { useState } from "react";
import { ComboBox, Text, Flex, Item, ProgressCircle, SearchField, View, Divider, NumberField } from "@adobe/react-spectrum";
import MonthComponent from "component/Bulan";
import { InvoiceList } from "./InvoiceList";
import { useFinanceList } from "lib/useFinance";
import { useInvoiceList } from "lib/useInvoice";

// const OrderForm = React.lazy(() => import('./Form'))
const defaultYear = new Date().getFullYear()

const Invoice = () => {
	const [financeId, setFinanceId] = useState<number>(0);
	const [txtSearch, setTxtSearch] = useState<string>('');
	const [bulan, setBulan] = useState<number>(0);
	const [year, setYear] = useState<number>(defaultYear);

	const finances = useFinanceList()
	const invoices = useInvoiceList()

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
						invoices.reload();
					}}
					onSubmit={(e) => {
						invoices.search(e)
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
						invoices.getByMonth(bulan, e)
					}}
				/>
				<MonthComponent width="150px" selectedId={bulan}
					onChange={(e) => {
						setBulan(e.id);
						invoices.getByMonth(e.id, year)
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
						invoices.getByFinance(+e);
					}}
				>
					{(o) => <Item textValue={o.shortName}>
						<Text>{o.shortName}</Text>
						<Text slot='description'>{o.name}</Text>
					</Item>}
				</ComboBox>
			</Flex>
			<Divider size="S" marginY={'size-100'} />
			{invoices.items.map((e) => <InvoiceList key={e.id} invoice={e} />)}
		</View>
	)
}

export default Invoice;