import React, { useState } from 'react';
import { dateParam, iLoan } from 'lib/interfaces'
import { Flex, View, ProgressCircle, ActionButton, Text } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
//import AddIcon from '@spectrum-icons/workflow/Add'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FormatDate, FormatNumber } from 'lib/format';
import EditCircle from '@spectrum-icons/workflow/EditCircle';
// import LoanListDetails from './listdetails';

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
	trx: Trx[]
}
const initTrx: Trx = {
	id: 0,
	refId: 0,
	division: '',
	trxDate: dateParam(null),
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
	trx: [initTrx],
	id: 0,
	name: '',
	Persen: 0
}

export default function PageForm() {
	const { pid } = useParams()
	const navigate = useNavigate();
	const { state } = useLocation();
	const [loan, setLoan] = useState<Loan>(initLoan)
	let [isLoading, setIsLoading] = useState(false)
	let [isEdit, setIsEdit] = useState(false)

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

			console.log(res)
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

	return (
		<View>
			<View marginBottom={'size-200'}><div className='div-h1'>Data Piutang</div></View>
			{isEdit || loan.id === 0 ? <React.Suspense fallback={<div>Please wait...</div>}>
				<LoanForm data={loan}
					onCancel={(id) => {
						setIsEdit(false)
						if(id===0) {
							navigate(`${(state as any).from}`)
						}
					}}
					onDelete={() => navigate(`${(state as any).from}`)}
					onUpdate={(id, data) => {
						setLoan(data)
						setIsEdit(false)
					}}
					onInsert={(data) => {
						setIsEdit(false)
						//const d = loan.details ? [...loan.details] : []
						setLoan(data)
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
								<View flex>{FormatDate(loan.trx[0].trxDate)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Alamat</View>
								<View flex>{loan.street} - {loan.city}, {loan.zip}</View>
							</Flex>
						</View>
						<View flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Keterangan</View>
								<View flex>{loan.trx[0].descriptions}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Pinjaman</View>
								<View flex>{FormatNumber(loan.trx[0].detail.debt)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Angsuran</View>
								<View flex>{FormatNumber(loan.trx[0].detail.cred)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Sisa Bayar</View>
								<View flex>{FormatNumber(loan.trx[0].detail.saldo)}</View>
							</Flex>
						</View>
					</Flex>
				</View>
			}

			<View marginY={'size-200'}>
				<ActionButton isQuiet isDisabled={isEdit || loan.id === 0} onPress={() => setIsEdit(true)}>
					<EditCircle size={'S'} />
					<Text>Edit</Text>
				</ActionButton>
			</View>

			{/* <LoanListDetails details={loan.trx} /> */}

		</View>

	);

}
