import React, { useState } from 'react';
import { dateParam, iAccountSpecific, iLoan } from 'lib/interfaces'
import { Flex, View, ProgressCircle, ActionButton, Text, useAsyncList, Divider } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
//import AddIcon from '@spectrum-icons/workflow/Add'
import { useNavigate, useParams } from 'react-router-dom';
import { FormatDate, FormatNumber } from 'lib/format';
import EditCircle from '@spectrum-icons/workflow/EditCircle';
import Back from '@spectrum-icons/workflow/BackAndroid';
import LoanListDetails from './listdetails';
//import { PrettyPrintJson } from 'lib/utils';
import { CurrentLoan } from './form';
import { useAccountCash } from 'lib/useAccountCash';

const LoanForm = React.lazy(() => import('./form'));

type TrxDetail = {
	groupId: number,
	id: number,
	trxId: number,
	codeId: number,
	debt: number,
	cred: number,
	saldo: number
}

type Trx = {
	id: number,
	refId: number,
	division: string,
	trxDate: string,
	descriptions?: string | undefined,
	memo?: string | undefined,
	detail: TrxDetail
}

interface Loan extends iLoan {
	trxs: Trx[]
}
const initTrx: Trx = {
	id: 0,
	refId: 0,
	division: '',
	trxDate: dateParam(null),
	descriptions: '',
	detail: {
		groupId: 0,
		id: 0,
		trxId: 0,
		codeId: 0,
		debt: 0,
		cred: 0,
		saldo: 0
	}
}

const initLoan: Loan = {
	trxs: [initTrx],
	id: 0,
	name: '',
	persen: 10,
}

export default function PageForm() {
	const { pid } = useParams()
	const navigate = useNavigate();
	//const { state } = useLocation();
	const [loan, setLoan] = useState<Loan>(initLoan)
	let [isLoading, setIsLoading] = useState(false)
	let [isEdit, setIsEdit] = useState(false)
	// let [reload, setReload] = useState(0)

	let account = useAccountCash();

	React.useEffect(() => {
		let isLoaded = false;
		

		async function load(id: string) {

			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get(`/loans/${id}`, { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					console.log(error)
				})


			return res ? res : initLoan;
		}

		if (!isLoaded && pid) {
			setIsLoading(true)
			load(pid ? pid : '0').then(data => {
				setLoan(data);
				setIsLoading(false)
			})
		}

		return () => { isLoaded = true }

	}, [pid])


	if (isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	function loanGetDefaultTrx(): CurrentLoan {
		const x = loan.trxs.filter((f,i) => i === 0)[0];
		const t = {
			id: loan.id,
			name: loan.name,
			persen: loan.persen,
			trx: x
		}
		return t
	}

	function loanSetDefaultTrx(p: CurrentLoan) {
		const trxs = loan.trxs

		if (trxs.length > 0) {
			trxs.splice(0, 1, p.trx)
		}
		else {
			trxs.push(p.trx)
		}
		setLoan(o => ({
			...o,
			name: p.name,
			persen: p.persen,
			street: p.street,
			city: p.city,
			phone: p.phone,
			cell: p.cell,
			zip: p.zip,
			trxs: trxs
		}))

	}

	return (
		<View>
			<Flex direction={'row'} columnGap={'size-100'}>
				<View flex><div className='div-h2 font-bold'>Data Piutang</div></View>
				<View>
					<ActionButton isQuiet isDisabled={isEdit || loan.id === 0} onPress={() => setIsEdit(true)}>
						<EditCircle size={'S'} />
						<Text>Edit</Text>
					</ActionButton>
					<ActionButton isQuiet onPress={() => navigate('/loan/list')}>
						<Back size={'S'} />
						<Text>Back to list</Text>
					</ActionButton>
				</View>
			</Flex>

			<Divider size={'S'} marginBottom={'size-200'} />
			{isEdit || loan.id === 0 ? <React.Suspense fallback={<div>Please wait...</div>}>
				<LoanForm data={loanGetDefaultTrx()}
					accCode={account.items}
					onCancel={(id) => {
						setIsEdit(false)
						if (id === 0) {
							navigate('/loan/list')
						}
					}}
					onDelete={() => {
						setIsEdit(false)
						navigate(`/loan`)
					}}
					onUpdate={(id, data) => {
						loanSetDefaultTrx(data)
						//setLoan(data)
						//const count = reload + 1
						//setReload(count)
						setIsEdit(false)
					}}
					onInsert={(data) => {
						loanSetDefaultTrx(data)
						//const d = loan.details ? [...loan.details] : []
						//setLoan(data)
						//const count = reload + 1
						//setReload(count)
						navigate(`/loan/${data.id}`, { replace: false })
						//setIsEdit(false)
					}}
				/>
			</React.Suspense>
				:
				<View>

					<Flex direction={{ base: 'column', L: 'row' }} rowGap={'size-50'} columnGap={'size-200'}>
						<View flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Nama</View>
								<View flex><div className='font-bold'>{loan.name}</div></View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Tanggal</View>
								<View flex>{FormatDate(loan.trxs[0].trxDate)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Alamat</View>
								<View flex>{loan.street} - {loan.city}, {loan.zip}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Keterangan</View>
								<View flex>{loan.trxs[0].descriptions}</View>
							</Flex>
						</View>
						<View flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Dari kas</View>
								<View flex>{account.getItem(loan.trxs[0].detail.codeId).name}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Pokok</View>
								<View flex>{FormatNumber(loan.trxs.reduce((t, c) => t + c.detail.cred, 0))}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Prosentase</View>
								<View flex>{FormatNumber(loan.persen)}%</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Piutang</View>
								<View flex>{FormatNumber(getTotalPiutang())}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Angsuran</View>
								<View flex>{FormatNumber(loan.trxs.reduce((t, c) => t + c.detail.debt, 0))}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Sisa Bayar</View>
								<View flex>{FormatNumber(getSisaPiutang())}</View>
							</Flex>
						</View>
					</Flex>

				</View>
			}
			{/* 
			<View>
				<PrettyPrintJson data={loanGetDefaultTrx()} />
			</View>
 */}
			<Divider size={'S'} marginTop={'size-200'} />
			{pid && +pid > 0 &&
			<LoanListDetails
				name={loan.name}
				onDelete={(e) => {
					deleteTrx(e)
				}}
				onChange={(id, e) => {
					updateSelectedTrx(id, e)
					//setReload(reload + 1)
				}}
				loanId={loan.id}
				trxs={ loan.trxs.filter((f,i) => i > 0) } />
			}
		</View>

	);

	function deleteTrx(id: number) {
		const trxs = loan.trxs;
		let i = -1;
		for (let c = 0; c < trxs.length; c++) {
			if (trxs[c].id === id) {
				i = c;
				break;
			}
		}

		if (i !== -1) {
			trxs.splice(i, 1)
			setLoan(o => ({ ...o, trxs: trxs }))
		}


	}

	function updateSelectedTrx(id: number, p: Trx) {
		const trxs = loan.trxs;

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
				setLoan(o => ({ ...o, trxs: trxs }))
			}

			// else {
			// 	trxs.push(p)
			// }
		}
		setLoan({ ...loan, trxs: trxs })
	}

	function getTotalPiutang() {
		const pokok = loan.trxs.reduce((t, c) => t + c.detail.cred, 0);
		const total = pokok + (pokok * (loan.persen / 100.0))
		return total;
	}
	function getSisaPiutang() {
		const pokok = loan.trxs.reduce((t, c) => t + c.detail.cred, 0);
		const payment = loan.trxs.reduce((t, c) => t + c.detail.debt, 0);
		const total = pokok + (pokok * (loan.persen / 100.0))
		return total - payment;
	}

}
