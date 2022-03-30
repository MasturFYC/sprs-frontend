import React, { useState } from 'react';
import { dateParam, iLoan } from 'lib/interfaces'
import { Flex, View, ProgressCircle, ActionButton, Text } from '@adobe/react-spectrum';
import axios from 'lib/axios-base';
//import AddIcon from '@spectrum-icons/workflow/Add'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FormatDate, FormatNumber } from 'lib/format';
import EditCircle from '@spectrum-icons/workflow/EditCircle';
import LoanListDetails, { LoanDetailSaldo } from './listdetails';

const LoanForm = React.lazy(() => import('./form'));

export interface LoanDetail extends iLoan {
	details?: LoanDetailSaldo[]
}

const initLoan: LoanDetail = {
	id: 0,
	name: '',
	loanAt: dateParam(null),
	details: []
}

export default function PageForm() {
	const { pid } = useParams()
	const navigate = useNavigate();
	const { state } = useLocation();
	const [loan, setLoan] = useState<LoanDetail>(initLoan)
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
				<LoanForm data={getLoan(loan)}
					onCancel={(id) => {
						setIsEdit(false)
						if(id===0) {
							navigate(`${(state as any).from}`)
						}
					}}
					onDelete={() => navigate(`${(state as any).from}`)}
					onUpdate={(id, data) => {
						const d = loan.details ? [...loan.details] : []
						setLoan({ ...data, details: d })
						setIsEdit(false)
					}}
					onInsert={(data) => {
						setIsEdit(false)
						//const d = loan.details ? [...loan.details] : []
						setLoan({ ...data, details: [] })
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
								<View flex>{FormatDate(loan.loanAt)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Alamat</View>
								<View flex>{loan.street} - {loan.city}, {loan.zip}</View>
							</Flex>
						</View>
						<View flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Keterangan</View>
								<View flex>{loan.descripts}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Pinjaman</View>
								<View flex>{loan.details && FormatNumber(loan.details.reduce((t, c) => t + c.debt, 0))}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Angsuran</View>
								<View flex>{loan.details && FormatNumber(loan.details.reduce((t, c) => t + c.cred, 0))}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Sisa Bayar</View>
								<View flex>{loan.details && FormatNumber(loan.details.reduce((t, c) => t + c.debt - c.cred, 0))}</View>
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

			<LoanListDetails details={loan.details} />

		</View>

	);

	function getLoan(p: LoanDetail) {
		if (p.id > 0) {
			const t = { ...p }
			delete t.details;
			return t;
		}
		return {
			id: 0,
			name: '',
			loanAt: dateParam(null)
		}
	}

}
