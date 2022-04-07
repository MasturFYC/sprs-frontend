import { ActionButton, Flex, Link, NumberField, ProgressCircle, Text, View } from '@adobe/react-spectrum';
import React, { Fragment, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from "../lib/axios-base";
import { FormatDate, FormatNumber } from '../lib/format';
import MonthComponent from "../component/Bulan";
import SearchIcon from '@spectrum-icons/workflow/Search'


type reportTrxAccount = {
	id: number
	name: string
	debt: number
	cred: number
	saldo: number
	trxDate: string
}

type reportTrxType = {
	id: number
	name: string
	debt: number
	cred: number
	saldo: number
	accounts?: reportTrxAccount[]
}

type reportTrxByMonth = {
	id: number
	name: string
	debt: number
	cred: number
	saldo: number
	groupId: number
	types?: reportTrxType[]
}


const ReportTrxtByMonth = () => {
	let { m, y } = useParams();
	const navigate = useNavigate();
	// let [month, setMonth] = useState<number>(0);
	// let [year, setYear] = useState<number>(0);
	let [trxs, setTrxs] = useState<reportTrxByMonth[]>([]);
	let [loaded, setLoaded] = useState<boolean>(false);
	let [monthId, setMonthId] = useState<number>(m ? +m : 0);
	//let [monthTo, setMonthTo] = useState<number>(m2 ? +m2 : 0);
	let [yearId, setYearId] = useState<number>(y ? +y : 0);

	React.useEffect(() => {
		let isLoaded = false

		async function loadData(month: number, year: number) {
			//async function loadData(month: number, month2: number, year: number) {
			const headers = {
				'Content-Type': 'application/json'
			}
			const res = await axios
				.get(`/report/trx/month/${month}/${year}`, { headers: headers })
				.then(response => response.data)
				.then(data => data)
				.catch(error => {
					setLoaded(true)
				})


			return res

		}

		loadData(m ? +m : new Date().getMonth() + 1, y ? +y : new Date().getFullYear()).then(res => {
			if (!isLoaded) {
				setTrxs(res ? res : []);
				setLoaded(true);
				setMonthId(m ? +m : new Date().getMonth() + 1)
				setYearId(y ? +y : new Date().getFullYear())
			}
		});

		return () => { isLoaded = true }

	}, [m, y])
	// }, [m, m2, y])

	if (!loaded) {
		return <Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<View>
			<View marginBottom={'size-200'}><span className='div-h1'>Laporan Saldo (Group Akun)</span></View>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-100'} marginBottom={'size-100'}>
				<MonthComponent removeId={0} labelPosition='side' label={'Dari bulan'} selectedId={monthId} onChange={(e) => setMonthId(e.id)} />
				{/* <MonthComponent removeId={0} labelPosition='side' label={'Sampai bulan'} selectedId={monthTo} onChange={(e) => setMonthTo(e.id)} /> */}
				<NumberField
					minValue={2021}
					label='Tahun'
					labelPosition='side'
					formatOptions={{ useGrouping: false }}
					hideStepper={true}
					width={'auto'}
					value={yearId}
					onChange={(e) => {
						setYearId(e)
					}}
				/>
				<ActionButton width={'size-1200'} onPress={() => {
					navigate(`/report/trx/${monthId}/${yearId}`)
				}}>
					<SearchIcon size="S" />
					<Text>Load</Text>
				</ActionButton>
			</Flex>
			<table className='table-100 collapse-none table-small2' cellPadding={5}>
				<thead>
					<tr className='back-green-700 text-white'>
						<td className='font-bold width-50'>AKUN</td>
						<td className='font-bold'>DESKRIPSI</td>
						<td className='text-right width-100 font-bold'>DEBET</td>
						<td className='text-right width-100 font-bold'>CREDIT</td>
						<td className='text-right width-100 font-bold'>SALDO</td>
					</tr>
				</thead>
				<tbody>
					{trxs.map((o, i) => {
						if (i === 0) {
							return (
								<tr key={i} className={'border-b-1'}>
									<td className='font-bold' colSpan={4}>{o.name}</td>
									<td className='text-right font-bold'>{FormatNumber(o.saldo)}</td>
								</tr>)
						}
						return <RowDetail key={o.id} data={o} />
					})}
				</tbody>
				<tfoot>
					<tr className='border-b-1'>
						<td colSpan={2} className={'border-t-1'}>Total</td>
						<td className='border-t-1 text-right width-100 font-bold'>{FormatNumber(trxs.filter(f => f.groupId !== 0).reduce((t, c) => t + c.debt, 0))}</td>
						<td className='border-t-1 text-right width-100 font-bold'>{FormatNumber(trxs.filter(f => f.groupId !== 0).reduce((t, c) => t + c.cred, 0))}</td>
						<td className='border-t-1 text-right width-100 font-bold' title={'SALDO AWAL + CREDIT - DEBET'}>
							{getRemainSaldo(trxs)}
						</td>
					</tr>
				</tfoot>
			</table>
		</View>
	)

	function getRemainSaldo(p?: reportTrxByMonth[]): string {
		if (p && p.length > 0) {
			const remain = p[p.length - 1].saldo
			return FormatNumber(remain)
		}
		return '0'
	}
}

type RowDetailProps = {
	data: reportTrxByMonth
}

function RowDetail(props: RowDetailProps) {
	const { data } = props
	const [isSelected, setIsSelected] = useState<boolean>(false);
	return (
		<Fragment>
			<tr className={'border-b-gray-50'}>
				<td className='width-50'>{data.id}</td>
				<td><Link isQuiet onPress={() => setIsSelected(!isSelected)}><span className='font-bold'>{data.name}</span></Link></td>
				<td className={`text-right width-100 ${isSelected ? 'font-bold' : ''}`}>{FormatNumber(data.debt)}</td>
				<td className={`text-right width-100 ${isSelected ? 'font-bold' : ''}`}>{FormatNumber(data.cred)}</td>
				<td className={`text-right width-100 ${isSelected ? 'font-bold' : ''}`}>{FormatNumber(data.saldo)}</td>
			</tr>
			{isSelected &&
				<tr className='border-t-gray-50'>
					<td>{' '}</td>
					<td colSpan={4} style={{ paddingLeft: 0, paddingRight: 0 }}>
						<DetailByType types={data.types} />
					</td>
				</tr>}
		</Fragment>
	);
}

export default ReportTrxtByMonth;

type DetailByTypePRops = {
	types?: reportTrxType[]
}

function DetailByType({ types }: DetailByTypePRops) {
	if (types) {
		return (
			<div>
				<table className='collapse-none table-100' cellPadding={5}>
					<tbody>
						{types.map((o, i) => <DetailByAccount key={o.id} rpt={o} index={i} />)}
					</tbody>
				</table>
			</div>
		)
	}

	return null;
}

type DetailByAccountPRops = {
	rpt: reportTrxType,
	index: number
}

function DetailByAccount({ rpt, index }: DetailByAccountPRops) {
	let [isDetail, showDetail] = useState(false)

	return (<Fragment>
		<tr className={`bg-gray-50 text-left border-b-1 ${index % 2 === 0 ? '' : 'back-green-200'}`}>
			<td className='font-italic text-left width-50'>{rpt.id}</td>
			<td className={'font-italic text-left width-150'} colSpan={rpt.accounts && rpt.accounts.length === 1 ? 1 : 2}>
				{rpt.accounts && rpt.accounts.length > 1 ?
					<Link isQuiet variant={'primary'} onPress={() => showDetail(!isDetail)}>{rpt.name}</Link>
					:
					<span>{rpt.name}</span>
				}
			</td>
			{rpt.accounts && rpt.accounts.length === 1 &&
				<td className={'font-italic text-left color-gray-700'}>{FormatDate(rpt.accounts[0].trxDate)} - {rpt.accounts[0].name}</td>
			}
			{rpt.accounts &&
				<Fragment>
					<td className={`font-italic text-right width-100 font-bold color-gray-700`}>{FormatNumber(rpt.accounts.reduce((t, c) => t + c.debt, 0))}</td>
					<td className={`font-italic text-right width-100 font-bold color-gray-700`}>{FormatNumber(rpt.accounts.reduce((t, c) => t + c.cred, 0))}</td>
					<td className={`width-100 border-b-gray-50`}>{' '}</td>
				</Fragment>
			}
		</tr>

		{isDetail && rpt.accounts &&
			rpt.accounts.map((o, i) => (
				<tr key={i} className={`${i % 2 === 0 ? 'bg-green-50' : ''}`}>
					<td className='width-50 bg-white border-bottom-none'>{' '}</td>
					<td className={`border-b-gray-50 text-left width-100`}>{FormatDate(o.trxDate)}</td>
					<td className={`text-left border-b-gray-50`}>{o.name}</td>
					<td className={`text-right width-100 border-b-gray-50`}>{FormatNumber(o.debt)}</td>
					<td className={`text-right width-100 border-b-gray-50`}>{FormatNumber(o.cred)}</td>
					<td className={`width-100 border-b-gray-50`}>{' '}</td>
				</tr>))
		}
	</Fragment>);
}
