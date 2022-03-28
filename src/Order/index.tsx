import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link as RouteLink } from 'react-router-dom';
import axios from "../lib/axios-base";
import { dateParam, iBranch, iFinance, iOrder } from '../lib/interfaces'
//import OrderForm, { initOrder } from './Form'
import { Button, Flex,
	//ComboBox, Text,  Item, 
	Link, ProgressCircle, SearchField, View } from "@adobe/react-spectrum";
import { useAsyncList } from '@react-stately/data'

import { FormatDate, FormatNumber } from "../lib/format";
//import MonthComponent from "../component/Bulan";
import { AxiosRequestConfig } from "axios";
import './table.css'

const OrderForm = React.lazy(() => import('./Form'))


const Order = () => {
	let { s, p } = useParams();
	const navigate = useNavigate();
	const [selectedId, setSelectedId] = React.useState<number>(-1);
	//const [financeId, setFinanceId] = useState<number>(0);
	//const [branchId, setBranchId] = useState<number>(0);
	const [txtSearch, setTxtSearch] = useState<string>('');
	//const [bulan, setBulan] = useState<number>(0);
	//const [isSearch, setIsSearch] = useState(false)
	//const [test, setTest] = useState(false)
	//const [url, setUrl] = useState("/orders")
	const [orders, setOrders] = useState<iOrder[]>([])


	// const getUrlParameter = (name: string) => {
	// 	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	// 	let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	// 	let results = regex.exec(window.location.search);
	// 	return results === null ? '/orders' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	// };


	let finances = useAsyncList<iFinance>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/finances/", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data
				})
				.catch(error => {
					console.log(error)
				})

			return { items: res ? res : [] }
		},
		getKey: (item: iFinance) => item.id
	})

	let branchs = useAsyncList<iBranch>({
		async load({ signal }) {
			const headers = {
				'Content-Type': 'application/json'
			}

			let res = await axios
				.get("/branchs", { headers: headers })
				.then(response => response.data)
				.then(data => {
					return data
				})
				.catch(error => {
					console.log(error)
				})
			return { items: res ? res : [] }
		},
		getKey: (item: iBranch) => item.id
	})

	
	useEffect(() => {
		let isLoaded = false
		async function load (search: string, p: string) {

			const headers = {
				'Content-Type': 'application/json'
			}
	
			const config: AxiosRequestConfig = search === 'search' ? {
				method: "post",
				data: { txt: p },
			} : {
				method: "get",
			}
	
			let res = await axios({
				...config,
				url: `/orders/${search}/${p}`,
				headers: headers,
			}).then(
				response => response.data
			).then(
				data => data
			).catch(error => console.log(error)
			)
			
			return res ? res : []
		}

		if (!isLoaded && s && p) {
			load(s, p).then(res => {
				setOrders(res)
			})

			//console.log(p)

			s === 'search' && setTxtSearch(p)
			//s === 'month' && setBulan(+p)
			//s === 'finance' && setFinanceId(+p)
			//s === 'branch' && setBranchId(+p)
		}

		return () => { isLoaded = true }
	}, [s,p])

	if (finances.isLoading || branchs.isLoading) {
		return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
	}

	return (
		<Fragment>
			<View marginBottom={'size-200'}><span className="div-h1">Order (SPK)</span></View>

			<Flex direction={{ base: 'column', M: 'row' }} gap='size-100' marginY={'size-200'}>
				<View flex>
					<Button variant="cta" onPress={() => orderInsertNew()}>Order Baru</Button>
				</View>
				<SearchField
					type="search"
					aria-label="order-search-item"
					width={{base:'auto', L:'size-3600'}}
					value={txtSearch}
					placeholder={'e.g. yamaha | 2022 | BAF'}
					maxLength={128}
					onClear={() => {
						navigate("/order/month/0")
					}}
					onSubmit={(e) => {
						setSelectedId(-1)
						navigate(`/order/search/${e}`)
					}}
					onChange={(e) => {
						setTxtSearch(e)
					}}
				/>
				{/*
				<MonthComponent width="150px" selectedId={bulan}
					onChange={(e) => {
						setBulan(e.id)
						setSelectedId(-1)
						navigate(`/order/month/${e.id}`)
					}} />
				<ComboBox
					flex={{ base: true, M: false }}
					width={{ base: 'auto', M: "150px" }}
					aria-label="order-search-finance"
					labelPosition={'side'}
					menuTrigger='focus'
					placeholder={"e.g. Adira"}
					defaultItems={[{ id: 0, shortName: 'Semua finance', name: '', descriptions: '' }, ...finances.items]}
					selectedKey={financeId}
					onSelectionChange={(e) => {
						setFinanceId(+e);
						setSelectedId(-1)
						navigate(`/order/finance/${+e}`)
					}}
				>
					{(o) => <Item textValue={o.shortName}>
						<Text>{o.shortName}</Text>
						<Text slot='description'>{o.name}</Text>
					</Item>}
				</ComboBox>
				<ComboBox
					flex
					width={'auto'}
					aria-label="order-search-branch"
					labelPosition={'side'}
					menuTrigger='focus'
					placeholder={"e.g. Jatibarang"}
					defaultItems={[{
						id: 0,
						name: 'Semua Cabang',
						headBranch: ''
					}, ...branchs.items]}
					selectedKey={branchId}
					onSelectionChange={(e) => {
						setBranchId(+e);
						setSelectedId(-1)
						navigate(`/order/branch/${+e}`)
					}}
				>
					{(item) => <Item textValue={item.name}>
						<Text>{item.name}</Text>
						<Text slot='description'>
							{item.id > 0 ?
								<div>Kepala Cabang: <span style={{ fontWeight: 700 }}>{item.headBranch}</span><br />
									{item?.street}{item.city ? `, ${item.city}` : ''}
									{item.zip ? ` - ${item.zip}` : ''}<br />
									{item.phone ? `Telp. ${item.phone}` : ''}
									{item.cell && item.phone ? ` / ` : ''}
									{item.cell && item.phone === '' ? `Cellular: ` : ''}
									{item.cell ?? ''}<br />{item.email ? `e-mail: ${item.email}` : ''}
								</div>
								:
								<div>{item.headBranch}</div>
							}
						</Text>

					</Item>}
				</ComboBox>
						*/}
			</Flex>
			<TableOrder
				selectedId={selectedId}
				orders={orders}
				finances={finances.items}
				branchs={branchs.items}
				formResponse={formResponse}
				updateChild={updateChild}
				setSelectedId={setSelectedId} />
		</Fragment>
	)

	function formResponse(params: { method: string, data?: iOrder }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				orderUpdateItem(0, data)
				//orders.remove(0)
				setSelectedId(data.id)
			} else {
				orderUpdateItem(data.id, data)
				setSelectedId(-1)
			}
		}
		else if (method === 'cancel') {
			if (selectedId === 0) {
				orderRemoveItem(0)
			}
			setSelectedId(-1)
		}
		else if (method === 'remove') {

			const i = orderGetIndex(selectedId)

			const list = [...orders]
			
			if(i>=0) {
				list.splice(i,1)
				setOrders(list)
			}
			//orders.remove(selectedId)
			setSelectedId(-1)
		}


	}

	function updateChild(data: iOrder) {
		orderUpdateItem(data.id, data)
		//orders.update(data.id, data)
	}

	function orderGetIndex(id: number): number {
		for(let c=0; c<orders.length;c++) {
			if(orders[c].id === id) {
				return c
			}
		}
		return -1;
	}

	function orderRemoveItem(id: number) {
		const i = orderGetIndex(id)

		if(i>=0) {
			const list = [...orders]
			list.splice(i,1)
			setOrders(list)
		}
	}

	function orderUpdateItem(id: number, data: iOrder) {
		const i = orderGetIndex(id)
		
		if(i>=0) {
			const list = [...orders]
			list.splice(i, 1, data)
			setOrders(list)
		}
	}

	function orderGetItem(id: number): iOrder | undefined {
		const i = orderGetIndex(id);
		if(i >= 0) {
			return orders[i]
		}
		return undefined
	}

	function orderInsertNew() {
		if (!orderGetItem(0)) {
			const list = [...orders]
			list.splice(0, 0, {
				id: 0,
				name: '',
				orderAt: dateParam(null),
				printedAt: dateParam(null),
				btFinance: 0,
				btPercent: 20,
				btMatel: 0,
				userName: 'Opick',
				verifiedBy: '',
				financeId: 0,
				branchId: 0,
				isStnk: true,
				stnkPrice: 0,
				matrix: 0
			})
			setOrders(list)
		}
		setSelectedId(0)
	}
}

export default Order;

type TableOrderProp = {
	selectedId: number,
	orders: iOrder[],
	finances: iFinance[],
	branchs: iBranch[],
	formResponse: (params: { method: string; data?: iOrder | undefined; }) => void,
	updateChild: (data: iOrder) => void,
	setSelectedId: React.Dispatch<React.SetStateAction<number>>
}
function TableOrder(props: TableOrderProp) {
	const {
		selectedId,
		orders,
		formResponse,
		updateChild,
		setSelectedId,
		finances,
		branchs
	} = props;
	const { pathname } = useLocation();

	return <table className="table-small2">
		<thead>
			<tr>
				<th>NO</th>
				<th>TANGGAL</th>
				<th align="left" style={{ whiteSpace: 'nowrap' }}>NOMOR (SPK)</th>
				<th align="left">CABANG</th>
				<th align="left">FINANCE</th>
				<th align="left">TYPE</th>
				<th align="left">MERK</th>
				<th align="left">NOPOL</th>
				<th>TAHUN</th>
				<th align="right" style={{ whiteSpace: 'nowrap' }}>STNK ?</th>
				<th align="right" style={{ whiteSpace: 'nowrap' }}>BT FINANCE</th>
				<th align="right" style={{ whiteSpace: 'nowrap' }}>BT MATEL</th>
			</tr>
		</thead>
		<tbody style={{ color: selectedId < 0 ? 'black' : '#abc' }}>
			{orders.map((item, index) => item.id === selectedId ?
				<tr key={item.id}>
					<td colSpan={13} style={{ padding: '12px 0', color: selectedId >= 0 ? 'black' : 'auto' }}>
						<React.Suspense fallback={<div>Please wait...</div>}>
							<OrderForm order={item}
								branchs={branchs}
								finances={finances}
								callback={(e) => formResponse(e)}
								updateChild={e => updateChild(e)} />
						</React.Suspense>
					</td>
				</tr>
				:
				<tr key={item.id} style={{ backgroundColor: index % 2 === 1 ? '#f3f3f3' : '#fff' }}
					title={`${item.unit?.warehouse?.name} - ${item.branch?.name} `}>
					<td className={selectedId >= 0 ? '' : item.verifiedBy ? 'back-green-700 text-white' : 'back-orange-600 text-white'} align="center">{index + 1}</td>
					<td align="center" style={{ whiteSpace: 'nowrap' }}>{FormatDate(item.orderAt)}</td>
					<td>
						{selectedId < 0 ?
							<Link isQuiet variant="primary" onPress={(e) => {
									setSelectedId(item.id);
							}}><span className={"font-bold"}>{item.name}</span></Link>
							:
							item.name
						}
					</td>
					<td>{item.branch?.name}</td>
					<td>{item.finance?.shortName}</td>
					<td style={{ whiteSpace: 'nowrap' }}>{item.unit?.type?.name}</td>
					<td>{item.unit?.type?.merk?.name}</td>
					<td>{selectedId >= 0 ? item.unit?.nopol || '---' : <Link isQuiet variant="primary"><RouteLink className="nopol" to={`/order/${item.id}`} state={{ from: pathname }}>{item.unit?.nopol || '---'}</RouteLink></Link>}</td>
					<td align="center">{item.unit?.year}</td>
					<td align="right">
						{item.isStnk ? '✔' : ''}{' '}
						{FormatNumber(item.stnkPrice)}
					</td>
					<td align="right">{FormatNumber(item.btFinance)}</td>
					<td align="right">{FormatNumber(item.btMatel)}</td>
				</tr>
			)}
		</tbody>
		<tfoot>
			<tr>
				<th colSpan={9} align="left">Total</th>
				<th align="right">{FormatNumber(orders.reduce((acc, v) => acc + v.stnkPrice, 0))}</th>
				<th align="right">{FormatNumber(orders.reduce((acc, v) => acc + v.btFinance, 0))}</th>
				<th align="right">{FormatNumber(orders.reduce((acc, v) => acc + v.btMatel, 0))}</th>
			</tr>
		</tfoot>
	</table>;
}


