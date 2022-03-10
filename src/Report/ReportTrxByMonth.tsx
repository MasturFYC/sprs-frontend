import { ActionButton, Flex, Link, NumberField, ProgressCircle, Text } from '@adobe/react-spectrum';
import React, { Fragment, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import axios from "../lib/axios-base";
import { FormatNumber } from '../lib/format';
import './report.css'
import MonthComponent from "../component/Bulan";
import SearchIcon from '@spectrum-icons/workflow/Search'

type reportTrxByMonth = {
	group: number
	id: number
	name: string
	debt: number
	cred: number
	saldo: number
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
			await axios
				.get(`/report/trx/month/${month}/${year}/`, { headers: headers })
				//.get(`/report/trx/month/${month}/${month2}/${year}/`, { headers: headers })
				.then(response => response.data)
				.then(data => {
					setTrxs(data);
					setLoaded(true);
					setMonthId(month)
					//setMonthTo(month2)
					setYearId(year)
				})
				.catch(error => {
					setLoaded(true)
				})

		}


		if (!isLoaded && m && y) {
			//if (!isLoaded && m && m2 && y) {
			if (+m === 0 || +y === 0) {
				const t = new Date();
				const m = t.getMonth() + 1;
				//const m2 = m;
				const y = t.getFullYear();
				//loadData(m, m2, y);
				loadData(m, y);
			} else {
				//loadData(+m, +m2, +y);
				loadData(+m, +y);
			}
		}

		return () => { isLoaded = true }

	}, [m, y])
	// }, [m, m2, y])

	if (!loaded) {
		return <Flex flex justifyContent={'center'}><ProgressCircle size={'S'} aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<div>
			<Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-100'} marginBottom={'size-100'}>
				<MonthComponent removeId={0} labelPosition='side' label={'Dari bulan'} selectedId={monthId} onChange={(e) => setMonthId(e.id)} />
				{/* <MonthComponent removeId={0} labelPosition='side' label={'Sampai bulan'} selectedId={monthTo} onChange={(e) => setMonthTo(e.id)} /> */}
				<NumberField
					minValue={2022}
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
					//setLoaded(false)
					//setTrxs([])
					//navigate(`/report/trx/${monthId}/${monthTo}/${yearId}`, {replace: true})
					navigate(`/report/trx/${monthId}/${yearId}`)
				}}>
					<SearchIcon size="S" />
					<Text>Load</Text>
				</ActionButton>
			</Flex>
			<table className='table-100 collapse-none'>
				<thead>
					<tr className='back-green-700 text-white'>
						<td className='font-bold'>AKUN</td>
						<td className='font-bold'>DESKRIPSI</td>
						<td className='text-right font-bold'>DEBET</td>
						<td className='text-right font-bold'>CREDIT</td>
						<td className='text-right font-bold'>SALDO</td>
					</tr>
				</thead>
				<tbody>
					{trxs.map((o, i) => {
						if (i === 0) {
							return (<tr key={`${o.id}-${i}`} className={i % 2 === 0 ? '' : 'back-green-200'}>
								<td>{o.id}</td>
								<td className='font-bold' colSpan={3}>{o.name}</td>
								<td className='text-right font-bold'>{FormatNumber(o.saldo)}</td>
							</tr>)
						}
						return <RowDetail key={o.id} trx={o} month={monthId} year={yearId} />
					})}
				</tbody>
				<tfoot>
					<tr className='border-t-1'>
						<td colSpan={2}>Total</td>
						<td className='text-right width-100'>{FormatNumber(trxs.filter(f => f.group !== 0).reduce((t,c) => t + c.debt, 0))}</td>
						<td className='text-right width-100'>{FormatNumber(trxs.filter(f => f.group !== 0).reduce((t, c) => t + c.cred, 0))}</td>
						<td className='text-right width-100'>{' '}</td>
					</tr>

				</tfoot>
			</table>
		</div>
	)
}

type RowDetailProps = {
	trx: reportTrxByMonth
	month: number
	year: number
}

function RowDetail(props: RowDetailProps) {
	const { month, year, trx } = props
	const [isSlelected, setIsSelected] = useState<boolean>(false);
	return (
		<Fragment>
			<tr>
				<td className='width-50'>{trx.id}</td>
				<td><Link isQuiet UNSAFE_className='font-bold' onPress={() => setIsSelected(!isSlelected)}>{trx.name}</Link></td>
				<td className='text-right width-100'>{FormatNumber(trx.debt)}</td>
				<td className='text-right width-100'>{FormatNumber(trx.cred)}</td>
				<td className='text-right width-100'>{FormatNumber(trx.saldo)}</td>
			</tr>
			{isSlelected &&
				<tr>
					<td></td>
					<td colSpan={4}>
						<DetailByAccountType accId={trx.id} month={month} year={year} />
					</td>
				</tr>}
		</Fragment>
	);
}

export default ReportTrxtByMonth;

type DetailByAccountTypeProps = {
	accId: number, month: number, year: number
}
function DetailByAccountType({ accId, month, year }: DetailByAccountTypeProps) {
	let [trxs, setTrxs] = useState<reportTrxByMonth[]>([]);

	React.useEffect(() => {
		let isLoaded = false

		async function loadData(accId: number, month: number, year: number) {
			const headers = {
				'Content-Type': 'application/json'
			}
			await axios
				.get(`/report/trx/month/acc/${accId}/${month}/${year}/`, { headers: headers })
				.then(response => response.data)
				.then(data => {
					setTrxs(data);
				})
				.catch(error => {
					console.log('-------', error)
				})
		}

		if (!isLoaded) {
			loadData(accId, month, year);
		}

		return () => { isLoaded = true }

	}, [accId, month, year])

	return (
		<div className='border-t-1 border-b-1 bg-gray-50'>
			<table className='collapse-none table-100'>
			<tbody>
				{trxs.map((o, i) => (<tr key={`${o.id}-${i}`} className={i % 2 === 0 ? '' : 'back-green-200'}>
					<td className='text-left width-50'>{o.id}</td>
					<td className='text-left'>{o.name}</td>
					<td className='text-right width-100'>{FormatNumber(o.saldo)}</td>
				</tr>)
				)}
			</tbody>
		</table>
		</div>
	);
}
