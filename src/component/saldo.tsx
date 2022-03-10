import { Checkbox, Flex, Link, View } from '@adobe/react-spectrum'
import { FormatNumber } from '../lib/format'
import React, { useState } from 'react'
import useSWR from 'swr'
import axios from '../lib/axios-base'

interface iSaldo {
	id: number
	name: string,
	debt: number,
	cred: number
}

const fetcher = (url: string) => axios.get(url).then(res => res.data)

function RemainSaldo() {
	const [showDetail, setShowDetail] = useState<boolean>(false);
	const [isInterval, setIsInterval] = useState<boolean>(true);
	const sortType: number[] = [3, 1, 2];
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
			{showDetail && <SaldoDetail saldos={data} index={sortType} />}
		</div>
	);

	function saldo() {
		if (data) {
			const debt = data.filter(f => f.id === 1).reduce((t, c) => t + c.debt, 0);
			const cred = data.filter(f => f.id === 2).reduce((t, c) => t + c.debt, 0);
			const modal = data.filter(f => f.id === 3).reduce((t, c) => t + c.debt, 0);
			return (debt + modal) - cred;
		}
		return 0;
	}
}
type SaldoDetailProp = {
	index: number[]
	saldos: iSaldo[]
}
function SaldoDetail(props: SaldoDetailProp) {
	const { saldos, index } = props
	return (
		<View>
			{index.map(item => (
				<Flex key={item} direction='row' columnGap={'size-50'}>
					<View flex>{saldos.filter(o => o.id === item)[0].name}</View>
					<View width={'50%'} UNSAFE_className={'text-right'}>{FormatNumber(saldos.filter(o => o.id === item)[0].debt)}</View>
				</Flex>
			))}
		</View>
	)
}

export default RemainSaldo;