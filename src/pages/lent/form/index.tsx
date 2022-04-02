import React, { useState } from 'react';
import { dateParam, iAccountSpecific, iLent } from 'lib/interfaces'
import { Flex, View, ProgressCircle, ActionButton, Text, useAsyncList, Divider } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
//import AddIcon from '@spectrum-icons/workflow/Add'
import { useNavigate, useParams } from 'react-router-dom';
import { FormatDate, FormatNumber } from 'lib/format';
import EditCircle from '@spectrum-icons/workflow/EditCircle';
import Back from '@spectrum-icons/workflow/BackAndroid';
//import LentListDetails from './listdetails';
import { PrettyPrintJson } from 'lib/utils';
import { lentTrx, lentDetail, tsLentItem } from '../interfaces';

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

const initLent: tsLentItem = {
	unit: {
		id: 0,
		name: '',
		orderAt: dateParam(null),
		btFinance: 0,
		btPercent: 0,
		btMatel: 0,
		nopol: '',
		year: 0,
		type: '',
		wheel: '',
		merk: ''
	},
	trxs: [initTrx],
	orderId: 0,
	name: ''
}


export default function LentPageForm() {
	const { pid } = useParams()
	const navigate = useNavigate();
	//const { state } = useLocation();
	const [lent, setLent] = useState<tsLentItem>(initLent)
	let [isLoading, setIsLoading] = useState(false)
	let [isEdit, setIsEdit] = useState(false)
	// let [reload, setReload] = useState(0)


	let accountCashes = useAsyncList<iAccountSpecific>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/acc-code/spec/1", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data
				})
				.catch(error => {
					console.log(error)
				})

			return { items: res }
		},
		getKey: (item: iAccountSpecific) => item.id
	})

	React.useEffect(() => {
		let isLoaded = false;

		async function load(id: string) {

			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get(`/lents/${id}`, { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})

			return res ? res : initLent;
		}

		if (!isLoaded && pid) {
			setIsLoading(true)
			load(pid ? pid : '0').then(data => {

				console.log(data)
				setLent(data);
				setIsLoading(false)
			})
		}

		return () => { isLoaded = true }

	}, [pid])


	if (isLoading || accountCashes.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<View>
			<Flex direction={'row'} columnGap={'size-100'}>
				<View flex><div className='div-h2 font-bold'>Data Piutang</div></View>
				<View>
					<ActionButton isQuiet isDisabled={isEdit || lent.orderId === 0} onPress={() => setIsEdit(true)}>
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

			{isEdit || lent.orderId === 0 ? <React.Suspense fallback={<div>Please wait...</div>}>
				<LentForm data={getEditedLent()}
					accCode={accountCashes.items}
					onCancel={(id) => {
						setIsEdit(false)
						if (id === 0) {
							navigate('/lent/list')
						}
					}}
					onDelete={() => {
						//setIsEdit(false)
						navigate(`/lent`)
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
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Nama</View>
								<View flex><div className='font-bold'>{lent.name}</div></View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Tanggal</View>
								<View flex>{FormatDate(lent.trxs[0].trxDate)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Alamat</View>
								<View flex>{lent.street} - {lent.city}, {lent.zip}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Keterangan</View>
								<View flex>{lent.trxs[0].descriptions}</View>
							</Flex>
						</View>
						<View flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Dari kas</View>
								<View flex>{accountCashes.getItem(lent.trxs[0].detail.codeId).name}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Pokok</View>
								<View flex>{FormatNumber(lent.unit.btMatel)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Piutang</View>
								<View flex>{FormatNumber(lent.unit.btFinance)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Angsuran</View>
								<View flex>{FormatNumber(lent.trxs.reduce((t, c) => t + c.detail.debt, 0))}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Sisa Bayar</View>
								<View flex>{FormatNumber(getSisaPiutang())}</View>
							</Flex>
						</View>
					</Flex>

				</View>
			}

			{/* <View>
				<PrettyPrintJson data={lent.trxs[0]} />
			</View> */}

			<Divider size={'S'} marginTop={'size-200'} />

			{/* <LentListDetails
				name={lent.name}
				onDelete={(e) => {
					deleteTrx(e)
				}}
				lentId={lent.orderId}
				trxs={lent.trxs.filter((x, i) => i > 0)} /> */}

		</View>

	);

	function loanSetDefaultTrx(p: any) {

		setLent(o => ({
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
			orderId: lent.orderId,
			name: lent.name,
			street: lent.street,
			city: lent.city,
			phone: lent.phone,
			cell: lent.cell,
			zip: lent.zip,
			unit: lent.unit,
			trx: lent.trxs[0]
		}
		return data;
	}


	function deleteTrx(id: number) {
		const trxs = lent.trxs;
		let i = -1;
		for (let c = 0; c < trxs.length; c++) {
			if (trxs[c].id === id) {
				i = c;
				break;
			}
		}

		if (i !== -1) {
			trxs.splice(i, 1)
			setLent(o => ({ ...o, trxs: trxs }))
		}


	}

	function updateSelectedTrx(id: number, p: lentTrx) {
		const trxs = lent.trxs;

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
				setLent(o => ({ ...o, trxs: trxs }))
			}

			// else {
			// 	trxs.push(p)
			// }
		}
		setLent({ ...lent, trxs: trxs })
	}

	// function getTotalPiutang() {
	// 	const pokok = lent.trxs.reduce((t, c) => t + c.detail.cred, 0);
	// 	return pokok;
	// }

	function getSisaPiutang() {
		const payment = lent.trxs.reduce((t, c) => t + c.detail.debt, 0);
		return lent.unit.btFinance - payment;
	}

}
