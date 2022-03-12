import React, { useState } from 'react'
import { Checkbox, Flex, Link, View } from '@adobe/react-spectrum'
import { FormatNumber } from '../lib/format'
import useSWR from 'swr'
import axios from '../lib/axios-base'
// import { iAccGroup } from '@src/lib/interfaces'

interface iSaldo {
	id: number
	name: string
	debt: number
	cred: number
	saldo: number
}

const fetcher = (url: string) => axios.get(url).then(res => res.data)

function RemainSaldo() {
	const [showDetail, setShowDetail] = useState<boolean>(false);
	const [isInterval, setIsInterval] = useState<boolean>(true);
	//const sortType: number[] = [3, 1, 2];
	const { data, error } = useSWR<iSaldo[]>('/saldo/', fetcher, {
		refreshInterval: 0, //isInterval ? 3000 : 0,
		revalidateOnFocus: isInterval ? false : true,
		revalidateOnMount: isInterval ? true : false,
		revalidateOnReconnect: isInterval ? false : true
	}
	)
	
	if (error) return <div>Failed to load saldo</div>
	if (!data) return <div>Silahkan tunggu...</div>
	return (
		<div className="green-200 padding-12">
			<Flex direction='row' columnGap={'size-200'}>
				<View>
					<Checkbox isSelected={isInterval}
						onChange={(e) => setIsInterval(e)}
						aria-label='check-interval' />
				</View>
				<View flex marginTop={'size-75'}>Saldo:</View>
				<View marginTop={'size-75'} width={'50%'} UNSAFE_className={'text-right'}>
					<Link isQuiet variant='primary'
						UNSAFE_className='font-bold'
						onPress={() => setShowDetail(!showDetail)}
					>{data && FormatNumber(saldo())}</Link>
				</View>
			</Flex>
			{showDetail && <SaldoDetail saldos={data} />}
		</div>
	);

	function saldo() {
		if (data) {
			
			// const debt = data.filter(f => f.id <= 3).reduce((t, c) => t + c.saldo, 0);
			// const cred = data.filter(f => f.id > 3).reduce((t, c) => t + c.saldo, 0);
			//const modal = data.filter(f => f.id === 3).reduce((t, c) => t + c.debt, 0);

			//return (debt + modal) - cred;
			return data.reduce((t, c) => t + c.saldo, 0);
		}
		return 0;
	}
}
type SaldoDetailProp = {
	saldos: iSaldo[]
}
function SaldoDetail(props: SaldoDetailProp) {
	const { saldos } = props
	
//	let groups = useAsyncList<iAccGroup>({
	// 	async load({ signal }) {
	// 		const headers = {
	// 			'Content-Type': 'application/json'
	// 		}

	// 		let res = await axios
	// 			.get("/acc-group/", { headers: headers })
	// 			.then(response => response.data)
	// 			.then(data => {
	// 				return data ? data : []
	// 			})
	// 			.catch(error => {
	// 				console.log('-------', error)
	// 			})

	// 		return { items: res }
	// 	},
	// 	getKey: (item: iAccGroup) => item.id
	// })	

	return (
		<View>
			{saldos.map(g => (
				<Flex key={g.id} direction='row' columnGap={'size-50'}>
					<View flex>{g.name}</View>
					<View width={'50%'} UNSAFE_className={'text-right'}>{FormatNumber(g.saldo)}</View>
				</Flex>
			))}
		</View>
	)
}

export default RemainSaldo;