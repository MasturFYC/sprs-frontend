import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flex, View, ProgressCircle, ActionButton, Text, Divider } from '@adobe/react-spectrum';
import { FormatDate, FormatNumber } from 'lib/format';
import EditCircle from '@spectrum-icons/workflow/EditCircle';
import Back from '@spectrum-icons/workflow/BackAndroid';
import { lentTrx } from '../interfaces';
import { dateParam } from 'lib/interfaces'
import LentListDetails from './LentListDetails';
import { useLent } from 'lib/useLent';

const LentForm = React.lazy(() => import('./form'));

const initTrx: lentTrx = {
	id: 0,
	refId: 0,
	division: 'trx-lent',
	trxDate: dateParam(null),
	memo: '',
	detail: {
		id: 0,
		trxId: 0,
		codeId: 0,
		debt: 0,
		cred: 0,
		saldo: 0
	}
}


export default function LentPageForm() {
	const { pid } = useParams()
	const navigate = useNavigate();
	let [isEdit, setIsEdit] = useState(false)

	const lent = useLent(pid ? pid : '0')

	if (lent.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<View>
			<Flex direction={'row'} columnGap={'size-100'}>
				<View flex><div className='div-h2 font-bold'>Data Pinjaman</div></View>
				<View>
					<ActionButton isQuiet isDisabled={isEdit || lent.item.orderId === 0} onPress={() => setIsEdit(true)}>
						<EditCircle size={'S'} />
						<Text>Edit</Text>
					</ActionButton>
					<ActionButton isQuiet onPress={() => navigate('/lent/list')}>
						<Back size={'S'} />
						<Text>Back to list</Text>
					</ActionButton>
				</View>
			</Flex>

			<Divider size={'S'} marginBottom={'size-200'} />

			{isEdit || lent.item.orderId === 0 ? <React.Suspense fallback={<div>Please wait...</div>}>
				<LentForm data={getEditedLent()}
					onCancel={(id) => {
						setIsEdit(false)
						if (id === 0) {
							navigate('/lent/list')
						}
					}}
					onDelete={() => {
						//setIsEdit(false)
						navigate(`/lent/list`)
					}}
					onUpdate={(id, data) => {
						loanSetDefaultTrx(data)
						setIsEdit(false)
					}}
					onInsert={(data) => {
						loanSetDefaultTrx(data)
						navigate(`/lent/${data.orderId}`, { replace: false })
					}}
				/>
			</React.Suspense>
				:
				<View>

					<Flex direction={{ base: 'column', L: 'row' }} rowGap={'size-50'} columnGap={'size-200'}>
						<View flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Nama</View>
								<View flex><div className='font-bold'>{lent.item.name}</div></View>
							</Flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Tanggal</View>
								<View flex>{FormatDate(getTrxInfo().trxDate)}</View>
							</Flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Alamat</View>
								<View flex>{lent.item.street} - {lent.item.city}, {lent.item.zip}</View>
							</Flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Keterangan</View>
								<View flex>{getTrxInfo().descriptions}</View>
							</Flex>
						</View>
						<View flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Pokok</View>
								<View flex>{FormatNumber(lent.item.unit.btMatel)}</View>
							</Flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Pinjaman</View>
								<View flex>{FormatNumber(lent.item.unit.btFinance)}</View>
							</Flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Cicilan</View>
								<View flex>{FormatNumber(lent.item.trxs.reduce((t, c) => t + c.detail.debt, 0))}</View>
							</Flex>
							<Flex direction={'row' } columnGap={'size-200'}>
								<View width={'size-1250'}>Sisa Bayar</View>
								<View flex>{FormatNumber(getSisaPiutang())}</View>
							</Flex>
						</View>
					</Flex>

				</View>
			}


			<Divider size={'S'} marginTop={'size-200'} />

			<View>
				{pid && +pid > 0 &&
					<LentListDetails
						name={lent.item.name}
						onDelete={(e) => {
							deleteTrx(e)
						}}

						onChange={(id, e) => {
							updateSelectedTrx(id, e)
						}}

						lentId={lent.item.orderId}
						trxs={lent.item.trxs.filter(x => x.division === 'trx-cicilan')} />
				}
			</View>
		</View>

	);

	function getTrxInfo(): lentTrx {
		if (lent.item.trxs.length > 0) {
			return lent.item.trxs.filter(f => f.division === 'trx-lent')[0]
		}

		return initTrx
	}

	function loanSetDefaultTrx(p: any) {

		lent.setLent(o => ({
			...o,
			name: p.name,
			street: p.street,
			city: p.city,
			phone: p.phone,
			cell: p.cell,
			zip: p.zip,
		}))

	}

	function getEditedLent() {
		const data = {
			orderId: lent.item.orderId,
			name: lent.item.name,
			street: lent.item.street,
			city: lent.item.city,
			phone: lent.item.phone,
			cell: lent.item.cell,
			zip: lent.item.zip,
			unit: lent.item.unit,
			trx: lent.item.trxs[0]
		}
		return data;
	}


	function deleteTrx(id: number) {
		const trxs = lent.item.trxs;
		let i = -1;
		for (let c = 0; c < trxs.length; c++) {
			if (trxs[c].id === id) {
				i = c;
				break;
			}
		}

		if (i !== -1) {
			trxs.splice(i, 1)
			lent.setLent(o => ({ ...o, trxs: trxs }))
		}
	}

	function updateSelectedTrx(id: number, p: lentTrx) {
		const trxs = lent.item.trxs;

		if (id === 0) {
			trxs.push(p)
		} else {
			let i = -1;
			for (let c = 0; c < trxs.length; c++) {
				if (trxs[c].id === id) {
					i = c;
					break;
				}
			}

			if (i !== -1) {
				trxs.splice(i, 1, p)
				lent.setLent(o => ({ ...o, trxs: trxs }))
			}

		}
		lent.setLent({ ...lent.item, trxs: trxs })
	}

	function getSisaPiutang() {
		const payment = lent.item.trxs.reduce((t, c) => t + c.detail.debt, 0);
		return lent.item.unit.btFinance - payment;
	}

}
