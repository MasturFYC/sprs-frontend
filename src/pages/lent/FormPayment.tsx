import React, { FormEvent, useState } from "react";
import axios from 'lib/axios-base';
import { Text } from '@react-spectrum/text';
import { Flex } from '@react-spectrum/layout';
import { TextField } from '@react-spectrum/textfield';
import { Button } from '@react-spectrum/button';
import { ComboBox, Item } from '@react-spectrum/combobox';
//import { useAsyncList } from '@react-stately/data'
import { NumberField } from '@react-spectrum/numberfield';
import { lentTrx, lentDetail } from "./interfaces";
import { dateOnly, dateParam } from 'lib/interfaces';
import { useAccountCash } from "../../lib/useAccountCash";
//import { load } from "mime";

const initDetail: lentDetail = {
	id: 0,
	trxId: 0,
	codeId: 0,
	debt: 0,
	cred: 0,
	saldo: 0
};
export const initTrx: lentTrx = {
	id: 0,
	refId: 0,
	division: "trx-cicilan",
	trxDate: dateParam(null),
	detail: initDetail,
	memo: ""
};
type FormPaymentProps = {
	trxData: lentTrx;
	name: string;
	onCancel?: (id: number) => void;
	onInsert?: (data: lentTrx) => void;
	onUpdate?: (id: number, data: lentTrx) => void;
	onDelete?: (id: number) => void;
};

export function FormPayment({ name, trxData, onCancel, onUpdate, onInsert, onDelete }: FormPaymentProps) {
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [trx, setTrx] = useState<lentTrx>(initTrx);

	let account = useAccountCash()

	const isDescriptionsValid = React.useMemo(
		() => trx.descriptions ? trx.descriptions.length > 5 : false,
		[trx]
	);

	const isDebtValid = React.useMemo(() => trx.detail.debt > 0, [trx]);
	const isCodeValid = React.useMemo(() => trx.detail.codeId > 0, [trx]);

	React.useEffect(() => {
		let isLoaded = false;

		if (!isLoaded) {
			setTrx(trxData);
		}

		return () => { isLoaded = true; };
	}, [trxData]);

	return (
		<form onSubmit={handleSubmit}>
			<Flex rowGap='size-200' direction={'column'} width={{ base: 'auto', L: 'calc(size-6000 + size-1000)' }}>
				<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>
					<TextField
						type={'date'}
						label='Tanggal'
						width={{ base: 'auto', M: 'size-2000' }}
						value={dateOnly(trx.trxDate)}
						maxLength={10}
						onChange={(e) => handleChange("trxDate", e)} />
					<TextField
						flex
						label='Deskripsi'
						autoFocus
						width={'auto'}
						validationState={isDescriptionsValid ? 'valid' : 'invalid'}
						placeholder={'e.g. Cicilan 1.'}
						value={trx.descriptions || ''}
						maxLength={128}
						onChange={(e) => handleChange("descriptions", e)} />
				</Flex>
				<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'}>
					<NumberField
						hideStepper={true}
						width={{ base: 'auto', M: 'size-2000' }}
						validationState={isDebtValid ? 'valid' : 'invalid'}
						label={"Jumlah cicilan"}
						value={trx.detail.debt}
						onChange={(e) => {
							const n = e;
							const d = { ...trx.detail, debt: n, saldo: n };
							setTrx(o => ({ ...o, detail: d }));
							setIsDirty(true);
						}} />

					<ComboBox
						flex
						menuTrigger='focus'
						width={'auto'}
						validationState={isCodeValid ? 'valid' : 'invalid'}
						label={"Akun kas"}
						placeholder={"e.g. Kas / bank"}
						defaultItems={account.items}
						selectedKey={trx.detail.codeId}
						onSelectionChange={(e) => {
							setTrx(o => ({ ...o, detail: { ...o.detail, codeId: +e } }));
							setIsDirty(true);
						}}
					>
						{(item) => <Item textValue={`${item.id} - ${item.name}`}>
							<Text><div className='font-bold'>{item.id} - {item.name}</div></Text>
							<Text slot='description'><span className='font-bold'>{item.name}</span>{item.descriptions && `, ${item.descriptions}`}</Text>
						</Item>}
					</ComboBox>
				</Flex>
			</Flex>
			<Flex direction={'row'} gap='size-100' marginBottom={'size-300'} marginTop={'size-400'}>
				<Button type='submit' variant='cta'
					isDisabled={!isDirty || !(isDescriptionsValid && isCodeValid && isDebtValid)}>Save</Button>
				<Button type='button' variant='primary'
					onPress={() => {
						onCancel && onCancel(trx.id);
					}}
				>
					{isDirty ? 'Cancel' : 'Close'}</Button>
			</Flex>
			{/* <PrettyPrintJson data={trx.detail} /> */}
		</form>
	);

	function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
		setTrx(o => ({ ...o, [fieldName]: value }));
		setIsDirty(true);
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		inserData(trx);

	}

	async function inserData(p: lentTrx) {
		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		};

		const t_rx = {
			id: p.id,
			refId: p.refId,
			division: 'trx-cicilan',
			descriptions: p.descriptions,
			trxDate: dateOnly(p.trxDate),
			memo: ['Cicilan', name].join(" "),
			details: [
				{
					id: 1,
					codeId: p.detail.codeId,
					trxId: p.id,
					debt: p.detail.debt,
					cred: 0
				},
				{
					id: 2,
					codeId: 4113,
					trxId: p.id,
					debt: 0,
					cred: p.detail.debt
				}
			]
		};

		const xData = JSON.stringify({
			trx: t_rx,
			token: [trx.descriptions || ' ', trx.memo].join(" ")
		});

		await axios
			.post(`/lents/payment/${trx.id}`, xData, { headers: headers })
			.then(response => response.data)
			.then(data => {
				setIsDirty(false);
				if (trx.id === 0) {
					const t = { ...p, id: data.id, detail: { ...t_rx.details[0], trxId: data.id, saldo: p.detail.debt } };
					setTrx(t);
					onInsert && onInsert(t);
				}
				onUpdate && onUpdate(trx.refId, { ...trx, id: data.id, detail: { ...t_rx.details[0], trxId: data.id, saldo: p.detail.debt } });
			})
			.catch(error => {
				console.log(error);
			});
	}
}
