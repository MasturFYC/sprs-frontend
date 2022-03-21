import React, { useState } from "react";
import { Link as RouterLink } from 'react-router-dom';
import { Flex, Link, View, Divider, ProgressCircle } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "../lib/format";
import { iInvoice } from "../lib/invoice-interfaces";
import { iAccCode, iFinance } from "../lib/interfaces";
import axios from "../lib/axios-base";

export interface InvoiceInfo extends iInvoice {
	finance?: iFinance
	account?: iAccCode
}

type TableProp = { invoice: InvoiceInfo; };
export function InvoiceList({
	invoice
}: TableProp) {
	const [isDownloading, setIsDownloading] = useState(false)

	return (
		<View>
			<Flex direction={{ base: "column", M: "row" }} rowGap={"size-100"} columnGap={'size-200'}>
				<Flex flex direction={"column"} rowGap={"size-50"}>
					<View>
						<Link isQuiet variant='primary' UNSAFE_className="font-bold"><RouterLink to={`/invoice/${invoice.financeId}/${invoice.id}`}>Invoice #{invoice.id}</RouterLink></Link>
					</View>
					<Flex flex direction={"row"} rowGap={"size-100"}>
						<View width={'size-1200'}>Tanggal:</View>
						<View flex>{FormatDate(invoice.invoiceAt)}</View>
					</Flex>
					<Flex flex direction={"row"} rowGap={"size-100"}>
						<View width={'size-1200'}>Term:</View>
						<View flex>{invoice.paymentTerm === 1 ? "Cash" : "Transfer"} : {invoice.account ? invoice.account.name : ''}</View>
					</Flex>
					<Flex flex direction={"row"} rowGap={"size-100"}>
						<View width={'size-1200'}>Total:</View>
						<View flex>{FormatNumber(invoice.total)}</View>
					</Flex>
				</Flex>
				<Flex flex direction={"column"} rowGap={"size-50"}>
					<Flex flex direction={"row"} rowGap={"size-100"}>
						<View width={'size-1200'}>Jatuh tempo:</View>
						<View flex>{FormatDate(invoice.dueAt)}</View>
					</Flex>
					<Flex flex direction={"row"} rowGap={"size-100"}>
						<View width={'size-1200'}>Salesman:</View>
						<View flex>{invoice.salesman}</View>
					</Flex>
					<Flex flex direction={"row"} rowGap={"size-100"}>
						<View width={'size-1200'}>Finance:</View>
						<View flex>{invoice.finance ? `${invoice.finance.name} (${invoice.finance.shortName})` : ""}</View>
					</Flex>
					<Flex flex direction={"row"} rowGap={"size-100"}>
						<View width={'size-1200'}>Memo:</View>
						<View flex>{invoice.memo || '-'}</View>
					</Flex>
				</Flex>
				<View width={'size-1600'}>
					{isDownloading ? <Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
						:
						<Link
							onPress={() => {
								setIsDownloading(true)
								downloadInvoice(invoice.id).then(data => {
									downloadFile(invoice.id, data)
									setIsDownloading(false)
								})

							}}
							isQuiet variant='primary'>Download invoice</Link>

					}</View>
			</Flex>
			<Divider size="S" marginY={'size-100'} />
		</View>
	);


	function downloadFile(id: number, data: any) {
		const blob = new Blob([data], {
			type: "application/pdf",
		});
		var url = window.URL.createObjectURL(blob)
		var a = document.createElement('a')
		a.href = url
		a.download = `invoice#${id}.pdf`
		a.click()
		a.remove()
		setTimeout(() => window.URL.revokeObjectURL(url), 100)
	}

	async function downloadInvoice(id: number) {
		const url = `/invoices/download/${id}`;
		let res = await axios.get(url, {
			responseType: 'arraybuffer',
			headers: {
				Accept: 'application/pdf',
				'Content-Type': 'application/pdf'
			}
		})
			.then(response => response.data)
			.then(data => data)
			.catch(error => {
				console.log(error)
			})
		return res;
	}
}
