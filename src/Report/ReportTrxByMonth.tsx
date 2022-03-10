import { ActionButton, Button, Flex, NumberField, ProgressCircle, Text } from '@adobe/react-spectrum';
import React, { useState } from 'react'
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
			//console.log('1111111111111', `/report/trx/month/${month}/${year}/`)
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
					console.log('-------', error)
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
			<table className='table-100'>
				<thead>
					<tr className='back-green-700 text-white'>
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
								<td className='font-bold' colSpan={3}>{o.name}</td>
								<td className='text-right font-bold'>{FormatNumber(o.saldo)}</td>
							</tr>)

						}
						return (<tr key={`${o.id}-${i}`} className={i % 2 === 0 ? '' : 'back-green-200'}>
							<td>{o.name}</td>
							<td className='text-right'>{FormatNumber(o.debt)}</td>
							<td className='text-right'>{FormatNumber(o.cred)}</td>
							<td className='text-right'>{FormatNumber(o.saldo)}</td>
						</tr>)
					})}
				</tbody>
			</table>
		</div>

	)
}

export default ReportTrxtByMonth;