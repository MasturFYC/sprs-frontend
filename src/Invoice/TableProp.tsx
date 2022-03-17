import React from "react";
import { Link as RouterLink } from 'react-router-dom';
import { Flex, Link, View, Divider } from "@adobe/react-spectrum";
import { FormatDate, FormatNumber } from "../lib/format";
import { iInvoice } from "../lib/invoice-interfaces";
import { iAccCode, iFinance } from "../lib/interfaces";

export interface InvoiceInfo extends iInvoice {
  finance?: iFinance
  account?: iAccCode
}

type TableProp = { invoice: InvoiceInfo; };
export function TableInvoice({
	invoice
}: TableProp) {

	return (
		<View>
			<Flex direction={{ base: "column", M: "row" }} rowGap={"size-100"} columnGap={'size-200'}>
				<Flex flex direction={"column"} rowGap={"size-50"}>
					<View><Link isQuiet variant='primary' UNSAFE_className="font-bold"><RouterLink to={`/invoice/${invoice.financeId}/${invoice.id}`}>Invoice #{invoice.id}</RouterLink></Link></View>
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
			</Flex>
			<Divider size="S" marginY={'size-100'} />
		</View>
	);
}
