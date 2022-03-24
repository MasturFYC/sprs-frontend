import { useState } from 'react'
import { Link } from 'react-router-dom';
import { ActionButton, ComboBox, Flex, Item, NumberField, ProgressCircle, Text, useAsyncList, View } from '@adobe/react-spectrum';
import axios from "../lib/axios-base";
import { FormatDate, FormatNumber } from '../lib/format';
import MonthComponent from "../component/Bulan";
import './report.css'
import { iFinance } from '@src/lib/interfaces';
//import FindAndReplace from '@spectrum-icons/workflow/FindAndReplace';
import Find from '../find.svg';

type tOrderInvoiced = {
  id: number
  name: string
  orderAt: string
  btFinance: number
  btPercent: number
  btMatel: number
  isStnk: boolean
  stnkPrice: number
  status: number
  financeId: number

  branch: {
    name: string
  }

  unit: {
    nopol: string
    year: number

    type: {
      name: string
      wheel: { name: string, shortName: string }
      merk: { name: string }
    }
  }

  finance: {
    name: string
    shortName: string
  }
}

const ReportOrder = () => {
  ///let {m, y, f} = useParams();
  //const navigate = useNavigate();
  let [monthId, setMonthId] = useState<number>(new Date().getMonth() + 1);
  let [yearId, setYearId] = useState<number>(new Date().getFullYear());
  const [financeId, setFinanceId] = useState<number>(0);

  const status: string[] = ['Not verified', 'Invoiced', 'Waiting']

  let finances = useAsyncList<iFinance>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get("/finances/", { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return { items: res ? res : [] }
    },
    getKey: (item: iFinance) => item.id
  })
  let orders = useAsyncList<tOrderInvoiced>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }      

      const url = `/orders/invoiced/${monthId}/${yearId}/${financeId}`

      let res = await axios
        .get(url, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return { items: res ? res : [] }
    },
    getKey: (item: tOrderInvoiced) => item.id
  })

  if (orders.isLoading || finances.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <View marginBottom={'size-200'}><span className='div-h1'>Satus Order</span></View>
      <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} marginBottom={'size-100'}>
        <MonthComponent labelPosition='side' label={'Dari bulan'} selectedId={monthId} onChange={(e) => setMonthId(e.id)} />
        <NumberField
          minValue={2021}
          label='Tahun'
          labelPosition='side'
          formatOptions={{ useGrouping: false }}
          hideStepper={true}
          width={'size-1250'}
          value={yearId}
          onChange={(e) => {
            setYearId(e)
          }}
        />
        <ComboBox
          flex={{ base: true, M: false }}
          width={'auto'}
          label="Finance"
          labelPosition={'side'}
          menuTrigger='focus'
          placeholder={"e.g. Adira"}
          defaultItems={[{ id: 0, shortName: 'Semua finance', name: '', descriptions: '' }, ...finances.items]}
          selectedKey={financeId}
          onSelectionChange={(e) => {
            setFinanceId(+e);
          }}
        >
          {(o) => <Item textValue={o.shortName}>
            <Text>{o.shortName}</Text>
            <Text slot='description'>{o.name}</Text>
          </Item>}
        </ComboBox>
        <ActionButton width={'size-1200'} onPress={() => {
          // navigate(`/report/order-status/${monthId}/${yearId}/${financeId}`, {replace: true, state: monthId+yearId+financeId}) 
          orders.reload()
          }}
         >
           <img src={Find} alt="logo" style={{ width: "32px", marginLeft: '12px' }} />
          <Text>Load</Text>
        </ActionButton>
      </Flex>

      {[1, 2, 0].map(s => <View key={s}>

        <View marginTop={'size-400'} marginBottom={'size-200'}>
          <span className='table-caption'>Status: <strong>{status[s]}</strong></span>
        </View>
        <table className={'table-100 table-small collapse-none'} cellPadding={4}>
          <TableHead isInvoice={s === 1} status={s} />
          <tbody>
            {orders.items.filter(f => f.status === s).map((o, i) => <tr key={o.id} className={`tr-hover border-b-gray-50 ${i % 2 === 1 ? 'tr-bg-green' : 'bg-white'}`}>
              {/* <td className=' text-right '>{i+1}.</td> */}
              <td>{o.branch.name}</td>
              <td className='text-no-wrap'>{s === 1 ?<Link to={`/invoice/${o.financeId}/${o.name}`}>Invoice #{o.name}</Link> : o.name}</td>
              <td className='text-center'>{FormatDate(o.orderAt, '2-digit')}</td>
              <td>{o.unit.type.merk.name}</td>
              <td>{o.unit.type.name}</td>
              <td>{o.finance.name} ({o.finance.shortName})</td>
              <td className='text-no-wrap'>{o.unit.nopol}</td>
              <td className='text-center'>{o.unit.year}</td>
              <td className={`${s === 1 ? "text-right" : "text-center"}`}>{s === 1 ? FormatNumber(o.btFinance) : o.isStnk ? '✔' : ''}</td>
              <td className='text-right'>{s === 1 ? `${FormatNumber(o.btPercent)}%` : FormatNumber(o.btFinance)}</td>
              <td className='text-right'>{FormatNumber(o.btMatel)}</td>
            </tr>
            )}
          </tbody>
          <TableFooter count={orders.items.filter(f => f.status === s).length}
            isInvoice={s === 1}
            finance={orders.items.filter(f => f.status === s).reduce((t, c) => t + c.btFinance, 0)}
            matel={orders.items.filter(f => f.status === s).reduce((t, c) => t + c.btMatel, 0)} />
        </table>
      </View>
      )}
    </View>
  )

}

type TableFooterProps = {
  count: number
  finance: number
  matel: number
  isInvoice?: boolean
}

function TableFooter({
  count, finance, matel, isInvoice
}: TableFooterProps) {
  return (<tfoot>
    <tr>
      <td colSpan={isInvoice ? 8 : 9} className={'border-b-1 border-t-1'}>Total: {count} unit{count > 1 ? 's' : ''}</td>
      <td className='border-b-1 border-t-1 text-right font-bold'>{FormatNumber(finance)}</td>
      {isInvoice && <td className='border-b-1 border-t-1 text-right font-bold'>{'-'}</td>}
      <td className='border-b-1 border-t-1 text-right font-bold'>{FormatNumber(matel)}</td>
    </tr>
  </tfoot>)
}

type TableHeadProps = {
  isInvoice?: boolean
  status: number
}
function TableHead({ isInvoice, status }: TableHeadProps) {
  const backColor = ['back-orange-700', 'back-green-700', 'back-purple-700']
  return (
    <thead>
      <tr className={`text-white ${backColor[status]}`}>
        {/* <td className=' text-right font-bold padding-left-6'>NO.</td> */}
        <td className='font-bold'>CABANG</td>
        <td className='font-bold text-no-wrap'>{isInvoice ? 'INVOICE' : 'ORDER (SPK)'}</td>
        <td className='text-center font-bold'>TANGGAL</td>
        <td className='font-bold'>MERK</td>
        <td className='font-bold'>TIPE</td>
        <td className='font-bold'>FINANCE</td>
        <td className='font-bold'>NOPOL</td>
        <td className='text-center font-bold'>TAHUN</td>
        <td className={`${isInvoice ? 'text-right' : 'text-center'} font-bold`}>{isInvoice ? 'BT-FINANCE' : 'STNK?'}</td>
        <td className='text-right font-bold text-no-wrap'>{isInvoice ? 'PPN' : 'BT-FINANCE'}</td>
        <td className='text-right font-bold text-no-wrap'>{isInvoice ? 'SUBTOTAL' : 'BT-MATEL'}</td>
      </tr>
    </thead>
  )
}

export default ReportOrder;
