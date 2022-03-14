import React, { FormEvent, useEffect, useState } from "react";
import { ComboBox, Divider, Flex, Item, ProgressCircle, TextField, Text, View, TextArea, NumberField } from "@adobe/react-spectrum";
import { dateOnly, dateParam, iFinance } from "../lib/interfaces";
import { useParams } from "react-router-dom";
import { iInvoice } from "../lib/invoice-interfaces";
import axios from "../lib/axios-base";

const initInvoice: iInvoice = {
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
	const { id: invoiceId } = useParams()
	const [invoice, setInvoice] = useState<iInvoice>(initInvoice)
	const [finance, setFinance] = useState<iFinance>({} as iFinance)
	const [isDirty, setIsDirty] = useState<boolean>(false);

	useEffect(() => {
		let isLoaded = false;

		async function loadInvoice(id?: string): Promise<iInvoice> {
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

			return res;
		}

		async function getFinance(id?: number): Promise<iFinance> {
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
			getFinance(1).then(e => {
				setFinance(e)
			})
			loadInvoice(invoiceId).then(data => {
				setInvoice(data)
			})

		}

		return () => { isLoaded = true }
	}, [invoiceId])


	// if (finances.isLoading) {
	// 	return <Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
	// }

	return (
		<View>
			<View marginBottom={'size-200'}><span className="div-h1">Invoice #{invoiceId}</span></View>
			<form>
				<Flex direction={'row'} rowGap={'size-400'}>
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
					<Flex width={'40%'} direction={'column'} columnGap={'size-200'} rowGap={'size-75'}>
						<TextField
							flex
							type={'date'}
							label={<div style={{ width: '100px' }}>Tanggal</div>}
							labelPosition="side"
							width={{ base: 'auto' }}
							value={dateOnly(invoice.invoiceAt)}
							onChange={(e) => handleChange("orderAt", e)}
						/>
						<TextField
							flex
							type={'date'}
							label={<div style={{ width: '100px' }}>Jatuh tempo</div>}
							labelPosition="side"
							width={{ base: 'auto' }}
							value={dateOnly(invoice.dueAt)}
							onChange={(e) => handleChange("dueAt", e)}
						/>
						<TextField
							flex
							label={<div style={{ width: '100px' }}>Salesman</div>}
							labelPosition="side"
							width={{ base: 'auto' }}
							//validationState={isDescriptionsValid ? 'valid' : 'invalid'}
							placeholder={'e.g. Beli kopi dan rokok untuk om Mastur.'}
							value={invoice.salesman}
							maxLength={128}
							onChange={(e) => handleChange("salesman", e)}
						/>
					</Flex>

				</Flex>
				<Divider size="M" marginY={'size-100'} />
				<Divider size="M" marginY={'size-100'} />
				<Flex direction={'column'} rowGap={'size-400'}>
					<TextArea
						label='Memo'
						flex
						width={'auto'}
						placeholder={'e.g. Memo'}
						value={invoice.memo || ''}
						maxLength={256}
						onChange={(e) => handleChange("memo", e)}
					/>
					<Flex flex direction={'row'} rowGap={'size-50'}>
						<Flex flex direction={'column'} rowGap={'size-75'}>
							<NumberField
								hideStepper={true}
								width={{ base: "auto" }}
								labelPosition={'side'}
								label={<div style={{ width: '100px', fontWeight: 700, color: 'green' }}>Total invoice</div>}
								onChange={(e) => {
									handleChange("debt", e)
									//changeData("debt", e)
								}}
								isReadOnly
								value={invoice.total} />

							<ComboBox
								flex
								menuTrigger="focus"
								width={'auto'}
								labelPosition={'side'}
								//validationState={isAccValid ? 'valid' : 'invalid'}
								label={<div style={{ width: '100px' }}>Payment Term</div>}
								placeholder={"e.g. Cash"}
								defaultItems={[{ id: 1, name: 'Cash' }, { id: 2, name: 'Transfer' }]}
								selectedKey={invoice.paymentTerm}
								onSelectionChange={(e) => handleChange("paymentTerm", e)}
							>
								{(item) => <Item textValue={item.name}>{item.name}</Item>}
							</ComboBox>
						</Flex>
						<View flex>

						</View>
					</Flex>

				</Flex>
			</form>
		</View>
	)


	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setInvoice(o => ({ ...o, [fieldName]: value }))
		setIsDirty(true)
	}


	async function handleSubmit(e: FormEvent) {
		e.preventDefault()
		// if (isDescriptionsValid && isAccValid && isNominalValid) {
		//   onSave(cashId, data)
		// }
	}
}

export default InvoiceForm;