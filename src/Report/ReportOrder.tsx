import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Form, Checkbox, ComboBox, Flex, Item, NumberField, ProgressCircle, Text, View, Tabs, TabList, Divider, Button } from '@adobe/react-spectrum';
import axios from "../lib/axios-base";
import MonthComponent from "../component/Bulan";
import { dateOnly, dateParam } from '../lib/interfaces';
import Find from '../find.svg';
import ComboBranch from '../component/combo-branch';
import ComboWheel from '../component/combo-wheel';
import { ReportOrderAllWaiting } from './ReportOrderAllWaiting';
import { tOrderInvoiced } from './interface';
import { TableContent } from "./TableContent";
import { useFinanceList } from 'lib/useFinance';

const ReportOrder = () => {
  const navigate = useNavigate();
  let { m: pmonth, y: pyear, f: pfinance, b: pbranch, t: ptype, tf: pfrom, to: pto } = useParams();
  let [monthId, setMonthId] = useState<number>(0);
  let [yearId, setYearId] = useState<number>(0);
  const [financeId, setFinanceId] = useState<number>(0);
  const [branchId, setBranchId] = useState<number>(0);
  const [orders, setOrders] = useState<tOrderInvoiced[]>([])
  //const [isOrderLoading, setIsOrderLoading] = useState<boolean>(false)
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [isDate, setIsDate] = useState(false)
  const [typeId, setTypeId] = useState(0)
  const [dateFrom, setDateFrom] = useState(dateParam(null))
  const [dateTo, setDateTo] = useState(dateParam(null))
  const [tabId, setTabId] = useState(0)

  const status: string[] = ['Not verified', 'Invoiced', 'Waiting', 'Installment']


  const isFromValid = useMemo(
    () => {
      const d = new Date(dateFrom);
      const t = new Date(dateTo);

      return d <= t
    },
    [dateFrom, dateTo]
  )

  let finances = useFinanceList()


  useEffect(() => {
    let isLoaded = false

    const load = async () => {
      const headers = {
        'Content-Type': 'application/json'
      }

      const url = `/report/order-status/${pfinance}/${pbranch}/${ptype}/${pmonth}/${pyear}/${pfrom}/${pto}`
      //const url = `orders/{finance}/{branch}/{type}/{month}/{year}/{from}/{to}`

      let res = await axios
        .get(url, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return res ? res : []
    }


    const month = pmonth ? +pmonth : new Date().getMonth() + 1
    const year = pyear ? +pyear : new Date().getFullYear()
    //setIsOrderLoading(true)
    setMonthId(month)
    setYearId(year)
    setFinanceId(pfinance ? +pfinance : 0)
    setBranchId(pbranch ? +pbranch : 0)
    setTypeId(ptype ? +ptype : 0)

    if (pmonth && pyear && pbranch && ptype) {
      load().then(data => {
        if (!isLoaded) {
          setOrders(data)
          //setIsOrderLoading(false)
          setIsDirty(false)
        }
      })
    }


    return () => { isLoaded = true }

  }, [pmonth, pyear, pfinance, pbranch, ptype, pfrom, pto])

  if (finances.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <Form onSubmit={handleSubmit}>
        <Flex direction={{ base: 'column', L: 'row' }} marginBottom={'size-200'} columnGap={'size-400'} rowGap={'size-50'}>
          <View flex><span className='div-h1'>Status Order</span></View>
          <View alignSelf={{ base: 'center', L: 'flex-end' }}>
            {isDate ?
              <Flex direction={{ base: 'column', L: 'row' }} gap={'size-100'}>
                <TextField
                  type={'date'}
                  labelAlign={'end'}
                  label='Dari tanggal'
                  labelPosition={'side'}
                  width={'auto'}
                  validationState={isFromValid ? 'valid' : 'invalid'}
                  value={dateOnly(dateFrom)}
                  onChange={(e) => {
                    setDateFrom(dateOnly(e))
                    setIsDirty(true)
                  }}
                />
                <TextField
                  type={'date'}
                  labelAlign={'end'}
                  labelPosition={'side'}
                  validationState={isFromValid ? 'valid' : 'invalid'}
                  label='Sampai'
                  width={'auto'}
                  value={dateOnly(dateTo)}
                  onChange={(e) => {
                    setDateTo(dateOnly(e))
                    setIsDirty(true)
                  }}
                />
              </Flex>
              :
              <Flex flex direction={{ base: 'column', L: 'row' }} gap={'size-100'} >
                <NumberField
                  minValue={2021}
                  label={<div style={{ width: '60px' }}>Tahun</div>}
                  labelAlign={'end'}
                  labelPosition='side'
                  formatOptions={{ useGrouping: false }}
                  hideStepper={true}
                  width={'size-1600'}
                  value={yearId}
                  onChange={(e) => {
                    setYearId(e)
                    setIsDirty(true)
                  }}
                />

                <MonthComponent labelPosition='side' labelAilgn='end'
                  label={<div style={{ width: '60px' }}>Bulan</div>} selectedId={monthId} onChange={(e) => {
                    setMonthId(e.id);
                    setIsDirty(true);
                  }} />
              </Flex>
            }
          </View>
          <View alignSelf={{ base: 'center', L: 'flex-end' }}><Checkbox isSelected={isDate} onChange={(e) => {
            setIsDate(e)
            setIsDirty(true)
          }}>Cari dengan tanggal</Checkbox></View>
        </Flex>

        <Flex direction={{ base: 'column', M: 'row' }} columnGap={'size-200'} rowGap={'size-50'} marginBottom={'size-100'}>

          <ComboBranch
            labelAlign={'end'}
            label={<div style={{ width: '60px' }}>Cabang</div>}
            onSelectionChange={(e) => {
              setBranchId(e)
              setIsDirty(true)
            }} labelPosition={'side'} selectedKey={branchId} />
          <ComboBox
            flex={{ base: true, M: false }}
            width={'auto'}
            labelAlign={'end'}
            label={<div style={{ width: '60px' }}>Finance</div>}
            labelPosition={'side'}
            menuTrigger='focus'
            placeholder={"e.g. Adira"}
            defaultItems={[{ id: 0, shortName: 'Semua finance', name: '', descriptions: '' }, ...finances.items]}
            selectedKey={financeId}
            onSelectionChange={(e) => {
              setFinanceId(+e);
              setIsDirty(true);
            }}
          >
            {(o) => <Item textValue={o.shortName}>
              <Text>{o.shortName}</Text>
              <Text slot='description'>{o.name}</Text>
            </Item>}
          </ComboBox>
          <Flex flex direction={'row'} columnGap={'size-200'}>
            <ComboWheel
              labelAlign={'end'}
              label={<div style={{ width: '60px' }}>Roda</div>}
              onSelectionChange={(e) => {
                setTypeId(e)
                setIsDirty(true)
              }} labelPosition={'side'} selectedKey={typeId} />

            <Button type="submit" variant="cta">
              <img src={Find} alt="logo" style={{ width: "32px" }} />
              <Text>Load</Text>
            </Button>
          </Flex>
        </Flex>
      </Form>

      <Divider size="S" marginY={'size-200'} />

      <View>
        <Tabs
          aria-label="Tab-Order"
          defaultSelectedKey={0}
          density='compact'
          onSelectionChange={(e) => setTabId(+e)}>
          <TabList aria-label="Tab-Order-List">
            <Item key={'0'}>All</Item>
            <Item key={'2'}>Invoiced</Item>
            <Item key={'4'}>Installment</Item>
            <Item key={'3'}>Waiting</Item>
            <Item key={'1'}>Not verified</Item>
            <Item key={'5'}>All waiting list</Item>
          </TabList>
        </Tabs>

      </View>

      {tabId === 5 ?
        <ReportOrderAllWaiting financeId={pfinance} branchId={pbranch} typeId={ptype} />
        :
        <View>
          {(tabId === 0 ? [1, 3, 2, 0] : [tabId - 1]).map(s => <View key={s}>

            <View marginTop={'size-200'} marginBottom={'size-200'}>
              <span className='table-caption'>Status: <strong>{status[s]}</strong></span>
            </View>
            {TableContent(s, orders)}
          </View>
          )}
        </View>
      }
    </View>
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isDirty) {
      if (isDate) {
        navigate(`/report/order-status/${monthId}/${yearId}/${financeId}/${branchId}/${typeId}/${dateFrom}/${dateTo}`)
      } else {
        navigate(`/report/order-status/${monthId}/${yearId}/${financeId}/${branchId}/${typeId}/-/-`)
      }
    }

  }
}

export default ReportOrder;


