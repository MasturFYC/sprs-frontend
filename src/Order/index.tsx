import React, {useState } from "react";
import { useNavigate, useParams, useLocation, Link as RouteLink } from 'react-router-dom';
import { iOrder, dateParam, iFinance, iBranch } from 'lib/interfaces'
import { Button, Flex,
	Link, ProgressCircle, SearchField, View
} from "@adobe/react-spectrum";

import { FormatDate, FormatNumber } from "lib/format";
import '../Report/report.css'

import { useFinanceList, useBranchList, useOrderList } from 'lib'
const OrderForm = React.lazy(() => import('./Form'))

const Order = () => {
	let { s, p } = useParams();
	const navigate = useNavigate();
	const [selectedId, setSelected] = React.useState<number>(-1);
	const [txtSearch, setTxtSearch] = useState<string | undefined>(p ? p === '0' ? '' : p : '');

	let finances = useFinanceList()
	let branchs = useBranchList()
	let { items: orders, isLoading, getIndex: orderGetIndex,
		removeItem, getItem: orderGetItem, addNewItem: orderAddNewItem,
		updateItem: orderUpdateItem } = useOrderList(s, p)

	return (
		<View>
			<Flex direction={'row'} columnGap={'size-100'} marginY={'size-200'}>
				<View marginBottom={'size-200'}><span className="div-h1">Order (SPK)</span></View>
				<View flex alignSelf={'center'}>
					{(finances.isLoading || branchs.isLoading || isLoading) &&
						<ProgressCircle aria-label="Loading…" isIndeterminate />
					}
				</View>
			</Flex>
			<Flex direction={'row'} columnGap={{ base: 'size-200', L: 'size-400' }} marginY={'size-200'}>
				<View>
					<Button variant="cta" onPress={() => orderInsertNew()}>Order Baru</Button>
				</View>
				<SearchField
					flex
					type="search"
					aria-label="order-search-item"
					width={{ base: 'auto', L: 'size-3600' }}
					value={txtSearch}
					placeholder={'e.g. yamaha | 2022 | BAF'}
					onClear={() => {
						navigate("/order/month/0")
						setSelected(-1)
					}}
					onSubmit={(e) => {
						setSelected(-1)
						navigate(`/order/search/${e}`)
					}}
					onChange={(e) => {
						setTxtSearch(e)
					}}
				/>

			</Flex>
			<TableOrder
				selectedId={selectedId}
				orders={orders}
				finances={finances.items}
				branchs={branchs.items}
				formResponse={formResponse}
				updateChild={(e) => orderUpdateItem(e.id, e)}
				setSelectedId={setSelected} />
		</View>
	)

	function formResponse(params: { method: string, data?: iOrder }) {
		const { method, data } = params

		if (method === 'save' && data) {
			if (selectedId === 0) {
				orderUpdateItem(0, data)
				setSelected(data.id)
			} else {
				orderUpdateItem(data.id, data)
				setSelected(-1)
			}
		}
		else if (method === 'cancel') {
			if (selectedId === 0) {
				removeItem(0)
			}
			setSelected(-1)
		}
		else if (method === 'remove') {
			removeItem(selectedId)
			setSelected(-1)
		}
	}

	function orderInsertNew() {
		if (!orderGetItem(0)) {
			orderAddNewItem({
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
			setSelected(0)
		}
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

	return <table className="table-100 table-small collapse-none" cellPadding={4}>
		<thead>
			<tr className={'text-white back-purple-700'}>
				<th>NO</th>
				<th>TANGGAL</th>
				<th className='text-center font-bold text-no-wrap'>NOMOR (SPK)</th>
				<th className='text-left font-bold'>CABANG</th>
				<th className='text-left font-bold'>FINANCE</th>
				<th className='text-left font-bold'>TYPE</th>
				<th className='text-left font-bold'>MERK</th>
				<th className='text-left font-bold'>NOPOL</th>
				<th className='text-center font-bold'>TAHUN</th>
				<th className='text-right font-bold text-no-wrap'>STNK ?</th>
				<th className='text-right font-bold text-no-wrap'>BT FINANCE</th>
				<th className='text-right font-bold text-no-wrap'>BT MATEL</th>
			</tr>
		</thead>
		<tbody style={{ color: selectedId < 0 ? 'black' : '#abc' }}>
			{orders.map((item, index) => item.id === selectedId ?
				<tr key={item.id} className={`back-purple-700'}`}>
					<td colSpan={13} style={{ color: selectedId >= 0 ? 'black' : 'auto' }}>
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
				<tr key={item.id} className={`border-b-gray-50 ${index % 2 === 1 ? 'tr-bg-green' : 'bg-white'}`}
					title={`${item.unit?.warehouse?.name} - ${item.branch?.name} `}>
					<td className={`text-center ${selectedId >= 0 ? '' : item.verifiedBy ? 'back-green-600 text-white' : 'back-orange-600 text-white'}`}>{index + 1}</td>
					<td className='text-center text-no-wrap'>{FormatDate(item.orderAt)}</td>
					<td className='text-center'>
						{selectedId < 0 ?
							<Link isQuiet variant="primary" onPress={(e) => {
								setSelectedId(item.id);
							}}><span className={"font-bold"}>{item.name}</span></Link>
							:
							item.name
						}
					</td>
					<td className='text-left'>{item.branch?.name}</td>
					<td className='text-left'>{item.finance?.shortName}</td>
					<td className='text-left text-no-wrap'>{item.unit?.type?.name}</td>
					<td className='text-left'>{item.unit?.type?.merk?.name}</td>
					<td className='text-left'>{selectedId >= 0 ? item.unit?.nopol || '---' : <Link isQuiet variant="primary"><RouteLink className="nopol" to={`/order/${item.id}`} state={{ from: pathname }}>{item.unit?.nopol || '---'}</RouteLink></Link>}</td>
					<td className='text-center'>{item.unit?.year}</td>
					<td className='text-right'>
						{item.isStnk ? '✔' : ''}{' '}
						{FormatNumber(item.stnkPrice)}
					</td>
					<td className='text-right'>{FormatNumber(item.btFinance)}</td>
					<td className='text-right'>{FormatNumber(item.btMatel)}</td>
				</tr>
			)}
		</tbody>
		<tfoot>
			<tr className='back-green-600 text-white'>
				<th className='text-left' colSpan={9} align="left">Total</th>
				<th className='text-right font-bold'>{FormatNumber(orders.reduce((acc, v) => acc + v.stnkPrice, 0))}</th>
				<th className='text-right font-bold'>{FormatNumber(orders.reduce((acc, v) => acc + v.btFinance, 0))}</th>
				<th className='text-right font-bold'>{FormatNumber(orders.reduce((acc, v) => acc + v.btMatel, 0))}</th>
			</tr>
		</tfoot>
	</table>;
}
