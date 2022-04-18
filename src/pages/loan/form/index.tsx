import React, { useState } from 'react';
import { Flex, View, ProgressCircle, ActionButton, Text, Divider } from '@adobe/react-spectrum';
//import AddIcon from '@spectrum-icons/workflow/Add'
import { useNavigate, useParams } from 'react-router-dom';
import { FormatDate, FormatNumber } from 'lib/format';
import EditCircle from '@spectrum-icons/workflow/EditCircle';
import Back from '@spectrum-icons/workflow/BackAndroid';
import LoanListDetails from './listdetails';
//import { PrettyPrintJson } from 'lib/utils';
import { CurrentLoan } from './form';
import { useAccountCash } from 'lib/useAccountCash';
import { useLoan } from 'lib/useLoan';

const LoanForm = React.lazy(() => import('./form'));

export default function PageForm() {
	const { pid } = useParams()
	const navigate = useNavigate();
	const [isEdit, setIsEdit] = useState(false)

	const account = useAccountCash();
	const loan = useLoan(pid ? +pid : 0);

	if (account.isLoading || loan.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	function loanGetDefaultTrx(): CurrentLoan {

		// ambil salah satu data transaksi untuk menghitung prosentasi piutang
		const t = {
			id: loan.item.id,
			name: loan.item.name,
			persen: loan.item.persen,
			trx: loan.getTransaction()
		}
		return t
	}

	function loanSetDefaultTrx(p: CurrentLoan) {
		const trxs = loan.item.trxs

		if (trxs.length > 0) {
			trxs.splice(0, 1, p.trx)
		}
		else {
			trxs.push(p.trx)
		}
		loan.setItem(o => ({
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
					<ActionButton isQuiet isDisabled={isEdit || loan.item.id === 0} onPress={() => setIsEdit(true)}>
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
			{isEdit || loan.item.id === 0 ? <React.Suspense fallback={<div>Please wait...</div>}>
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
						navigate(`/loan/list`)
					}}
					onUpdate={(id, data) => {
						loanSetDefaultTrx(data)
						setIsEdit(false)
					}}
					onInsert={(data) => {
						loanSetDefaultTrx(data)
						navigate(`/loan/${data.id}`, { replace: false })
					}}
				/>
			</React.Suspense>
				:
				<View>

					<Flex direction={{ base: 'column', L: 'row' }} rowGap={'size-50'} columnGap={'size-200'}>
						<View flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Nama</View>
								<View flex><div className='font-bold'>{loan.item.name}</div></View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Tanggal</View>
								<View flex>{FormatDate(loan.item.trxs[0].trxDate)}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Alamat</View>
								<View flex>{loan.item.street} - {loan.item.city}, {loan.item.zip}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Keterangan</View>
								<View flex>{loan.item.trxs[0].descriptions}</View>
							</Flex>
						</View>
						<View flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Dari kas</View>								
								<View flex>{account.getItem(loan.getCashId()).name}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Pokok</View>
								<View flex>{FormatNumber(loan.getPokok())}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Prosentase</View>
								<View flex>{FormatNumber(loan.item.persen)}%</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Piutang</View>
								<View flex>{FormatNumber(loan.getTotalPiutang())}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Angsuran</View>
								<View flex>{FormatNumber(loan.getPayment())}</View>
							</Flex>
							<Flex direction={{ base: 'column', L: 'row' }} columnGap={'size-200'} rowGap={'size-50'}>
								<View width={'size-1250'}>Sisa Bayar</View>
								<View flex>{FormatNumber(loan.getSisaPiutang())}</View>
							</Flex>
						</View>
					</Flex>

				</View>
			}

			<Divider size={'S'} marginTop={'size-200'} />
			{pid && +pid > 0 &&
			<LoanListDetails
				name={loan.item.name}
				onDelete={(e) => {
					loan.deleteTransaction(e)
				}}
				onChange={(id, e) => {
					loan.updateTransaction(id, e)
				}}
				loanId={loan.item.id}
				trxs={loan.getListPayment() } />
			}
		</View>

	);

	

	



}
