import React, { FormEvent, useState } from 'react';
import {
  dateParam, dateOnly, iBranch, iFinance, iOrder, iUnit,
  // iReceivable, 
} from '../lib/interfaces'
import { TextField } from '@react-spectrum/textfield'
import { Button } from '@react-spectrum/button'
import { Form } from '@react-spectrum/form'
import axios from '../lib/axios-base';
import { Text } from '@react-spectrum/text'
import { Checkbox } from '@react-spectrum/checkbox'
import { View } from "@react-spectrum/view";
import { Divider } from '@react-spectrum/divider'
import { NumberField } from '@react-spectrum/numberfield'
import { Flex } from "@react-spectrum/layout";
import { Tabs, TabList } from '@react-spectrum/tabs'
import { Item, ComboBox } from "@react-spectrum/combobox";
import VerifyOrder from './VerifyOrder'

const CustomerForm = React.lazy(() => import('./CustomerForm'));
// const ReceivableForm = React.lazy(() => import('./Receivable'));
const AddressForm = React.lazy(() => import('./AddressForm'));
const Action = React.lazy(() => import('../component/Action'));
const UnitForm = React.lazy(() => import('./UnitForm'));
const TaskForm = React.lazy(() => import('./TaskForm'));

const initUnit: iUnit = {
  orderId: 0,
  nopol: '',
  year: new Date().getFullYear(),
  frameNumber: '',
  machineNumber: '',
  color: '',
  typeId: 0,
  warehouseId: 0
}

export const initOrder: iOrder = {
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
  matrix: 0,
}

type OrderFormProps = {
  orderId: number,
  onInsert?: (e: iOrder) => void,
  onUpdate?: (id: number, e: iOrder) => void,
  onDelete?: (id: number) => void,
  onCancle?: () => void,
  finances: iFinance[],
  branches: iBranch[]
}

const OrderForm = ({ orderId, onInsert, onUpdate, onDelete, onCancle, finances, branches }: OrderFormProps) => {
  const [order, setOrder] = useState<iOrder>(initOrder)
  let [tabId, setTabId] = useState(order.verifiedBy ? 1 : 0);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [newId, setNewId] = useState("");
  const [isLoading, setLoading] = useState(false)

  const isFinanceValid = React.useMemo(() => order.financeId > 0, [order])
  const isNameValid = React.useMemo(() => order.name.length > 5, [order])
  const isMatrixValid = React.useMemo(() => order.matrix > 0, [order])
  const isBranchValid = React.useMemo(() => order.branchId > 0, [order])
  const isBtFinanceValid = React.useMemo(() => order.btFinance > 0, [order])
  const isBtPercentValid = React.useMemo(() => order.btMatel > 0, [order])
  const isStnkValid = React.useMemo(
    () => {
      if (order) {
        if (order.isStnk) {
          return true;
        }
        return order.stnkPrice > 0
      }
      return true;
    },
    [order]
  )

  React.useEffect(() => {
    let isLoaded = false;

    async function getOrderName() {

      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get(`/order/name/seq`, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return res;
    }

    async function load() {

      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get(`/order/item/${orderId}`, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return res;
    }

    if (orderId === 0) {
      getOrderName().then(data => {
        if (!isLoaded) {
          const nm = ('' + data.id).padStart(9, "0")
          setNewId(nm)
        }
      })
    }

    setLoading(true)

    if (orderId > 0) {
      load().then(data => {
        if (!isLoaded) {
          setOrder(data)
          setLoading(false)
        }
      })
    }

    return () => { isLoaded = true }

  }, [orderId])

  return (
    <View>
      <Form onSubmit={(e) => handleSubmit(e)} isReadOnly={order.verifiedBy ? true : false}>
        <Flex direction={'column'} columnGap='size-200' rowGap={'size-50'}>
          <Flex direction={'row'} gap='size-50' marginBottom={'size-200'} marginTop={'size-50'}>
            <Flex flex direction={'row'} columnGap={'size-100'}>
              <Button type='submit'
                isDisabled={!isDirty || !(isNameValid && isBranchValid && isMatrixValid && isBtFinanceValid && isBtPercentValid && isStnkValid && isFinanceValid)
                  || (order.verifiedBy ? true : false)}
                variant='cta'>Save</Button>
              <Button type='button' variant='primary'
                onPress={() => { if (onCancle) onCancle() }}>
                {isDirty ? 'Cancel' : 'Back'}
              </Button>
            </Flex>
            <View flex><span className='div-h2'>ORDER #{order.name}</span></View>
            <View><VerifyOrder
              isDisable={isDirty || !(order.verifiedBy ? false : true) || !(order.id > 0) || !(isNameValid && isBranchValid && isMatrixValid
                && isBtFinanceValid && isBtPercentValid && isStnkValid && isFinanceValid)}
              order={order}
              onChange={(e) => {
                handleChange("verifiedBy", e);
                updateData({ ...order, verifiedBy: e });
              }} />
            </View>
            <View marginStart={'size-200'}>
              <Button type='button' alignSelf={'flex-end'} variant='negative'
                isDisabled={order.id === 0 || (order.verifiedBy ? true : false)}
                onPress={() => deleteData(order.id)}>Remove</Button>
            </View>
          </Flex>

          {
            message.length > 0 &&
            <View><span style={{ color: 'red' }}>{message}</span></View>
          }

          <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
            <TextField
              autoFocus
              validationState={isNameValid ? 'valid' : 'invalid'}
              label='Nomor SPK'
              flex
              width={{ base: 'auto' }}
              placeholder='e.g. X256/2022/VII/22665'
              value={order.name || newId}
              maxLength={50}
              onChange={(e) => handleChange("name", e)}
            />
            <Flex flex direction={'row'} columnGap='size-200'>
              <TextField
                flex
                type={'date'}
                label='Tanggal'
                width={'auto'}
                value={dateOnly(order.orderAt)}
                onChange={(e) => handleChange("orderAt", e)}
              />
              <TextField
                flex
                type={'date'}
                label='Tanggal cetak'
                width={'auto'}
                value={dateOnly(order.printedAt)}
                onChange={(e) => handleChange("printedAt", e)}
              />
            </Flex>
          </Flex>
          <View flex>
            <Flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
              <View flex>

                <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-100' rowGap={'size-50'}>
                  <NumberField
                    flex
                    hideStepper={true}
                    validationState={isMatrixValid ? 'valid' : 'invalid'}
                    width={{ base: 'auto', L: 'size-1700' }}
                    label={"Matrix"}
                    onChange={(e) => setMatrix(e)}
                    value={order.matrix} />
                  <Checkbox isSelected={order.isStnk}
                    marginTop={'size-300'}
                    width={{ base: 'auto', L: '140px' }}
                    onChange={(e) => {
                      setStnk(e ? 0 : 200000)
                      handleChange("isStnk", e)
                    }}>
                    {order.isStnk ? 'Ada STNK' : 'Tidak ada STNK'}
                  </Checkbox>
                  <NumberField
                    flex
                    isDisabled={order.isStnk}
                    hideStepper={true}
                    validationState={isStnkValid ? 'valid' : 'invalid'}
                    width={{ base: 'auto', L: 'size-1250' }}
                    label={"Potongan STNK"}
                    onChange={(e) => setStnk(e)}
                    value={order.stnkPrice} />
                </Flex>
              </View>
              <View flex>

                <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'}>
                  <NumberField
                    flex
                    hideStepper={true}
                    width={{ base: 'auto', L: 'size-1700' }}
                    isReadOnly
                    label={"BT Finance"}
                    onChange={(e) => handleChange("btFinance", e)}
                    value={order.btFinance} />
                  <NumberField
                    hideStepper={true}
                    validationState={isBtPercentValid ? 'valid' : 'invalid'}
                    width={{ base: "auto", M: "90px" }}
                    label={"Prosentase (%)"}
                    formatOptions={{ maximumFractionDigits: 2 }}
                    onChange={(e) => setPercent(e)}
                    value={order.btPercent} />
                  <NumberField
                    flex
                    hideStepper={true}
                    validationState={isBtPercentValid ? 'valid' : 'invalid'}
                    onChange={(e) => setMatel(e)}
                    width={{ base: 'auto', L: 'size-1700' }}
                    label={"BT Matel"}
                    value={order.btMatel} />
                </Flex>
              </View>
            </Flex>
          </View>
          <View flex>
            <Flex flex direction={{ base: 'column', M: 'row' }} columnGap='size-200' rowGap={'size-50'} marginBottom={'size-200'}>
              <ComboBox
                flex
                menuTrigger={order.verifiedBy ? "manual" : "focus"}
                validationState={isFinanceValid ? "valid" : "invalid"}
                label={"Finance"}
                width={'auto'}
                placeholder={"e.g. Adira"}
                defaultItems={finances}
                selectedKey={order.financeId}
                onSelectionChange={(e) => handleChange("financeId", +e)}
              >
                {(item) => <Item textValue={item.shortName}>
                  <Text>{item.shortName}</Text>
                  <Text slot='description'>{item.name}</Text>
                </Item>}
              </ComboBox>
              <ComboBox
                flex
                menuTrigger={order.verifiedBy ? "manual" : "focus"}
                validationState={isBranchValid ? "valid" : "invalid"}
                label={"Cabang penerima order"}
                width={'auto'}
                placeholder={"e.g. Pusat"}
                defaultItems={branches}
                selectedKey={order.branchId}
                onSelectionChange={(e) => handleChange("branchId", +e)}
              >
                {(item) => <Item textValue={item.name}>
                  <Text>{item.name}</Text>
                  <Text slot='description'>
                    Kepala Cabang: <span style={{ fontWeight: 700 }}>{item.headBranch}</span><br />
                    {item?.street}{item.city ? `, ${item.city}` : ''}
                    {item.zip ? ` - ${item.zip}` : ''}<br />
                    {item.phone ? `Telp. ${item.phone}` : ''}
                    {item.cell && item.phone ? ` / ` : ''}
                    {item.cell && item.phone === '' ? `Cellular: ` : ''}
                    {item.cell ?? ''}<br />{item.email ? `e-mail: ${item.email}` : ''}</Text>
                </Item>}
              </ComboBox>
            </Flex>
          </View>
        </Flex>
      </Form >
      <Divider size='M' marginY={'size-200'} />
      {
        order.id > 0 &&

        <View>
          <Tabs
            aria-label="Tab-Order"
            density='compact'
              onSelectionChange={(e) => !isLoading && setTabId(+e)}>
            <TabList aria-label="Tab-Order-List">
              <Item key={'0'} textValue={'Data Asset'}><span style={{ fontWeight: 700, color: 'orangered' }}>Data Asset</span></Item>
              <Item key={'1'} textValue={'Data Konsumen'}><span style={{ fontWeight: 700, color: 'green' }}>Data Konsumen</span></Item>
              <Item key={'2'} textValue={'History'}><span style={{ fontWeight: 700, color: 'green' }}>History</span></Item>
              <Item key={'3'} textValue={'Data Alamat'}><span style={{ fontWeight: 700, color: 'green' }}>Data Alamat</span></Item>
              <Item key={'4'} textValue={'Perintah dan Tugas'}><span style={{ fontWeight: 700, color: 'green' }}>Perintah dan Tugas</span></Item>
            </TabList>
          </Tabs>
          <View marginY={'size-100'}>
            {tabId === 0 && <React.Suspense fallback={<div>Please wait...</div>}><UnitForm
              isReadOnly={order.verifiedBy ? true : false}
              dataUnit={order.unit ? { ...order.unit, orderId: order.id } : { ...initUnit, orderId: order.id }}
              isNew={order.unit ? order.unit.orderId === 0 : true}
              callback={(e) => responseUnitChange(e)} />
            </React.Suspense>}
            {tabId === 1 &&
              <React.Suspense fallback={<div>Please wait...</div>}>
                <CustomerForm orderId={order.id} />
              </React.Suspense>
            }
            {tabId === 2 && <Action orderId={order.id} />}
            {tabId === 3 &&
              <Flex flex direction={'column'} gap={'size-100'}>
                <View flex>
                  <Flex flex direction={'row'} gap={'size-200'}>
                    <View flex>
                      <React.Suspense fallback={<div>Please wait...</div>}>
                        <AddressForm
                          title='Alamat Sesuai KTP'
                          apiAddress='ktp-address'
                          orderId={order.id}
                        />
                      </React.Suspense>
                    </View>
                    <View flex>
                      <React.Suspense fallback={<div>Please wait...</div>}>
                        <AddressForm
                          title='Alamat Rumah'
                          apiAddress='home-address'
                          orderId={order.id}
                        />
                      </React.Suspense>
                    </View>
                  </Flex>
                </View>
                <View flex>
                  <Flex flex direction={'row'} gap={'size-200'}>
                    <View flex>
                      <React.Suspense fallback={<div>Please wait...</div>}>
                        <AddressForm
                          title='Alamat Kantor'
                          apiAddress='office-address'
                          orderId={order.id}
                        />
                      </React.Suspense>
                    </View>
                    <View flex>
                      <React.Suspense fallback={<div>Please wait...</div>}>
                        <AddressForm
                          title='Alamat Surat / Tagih'
                          apiAddress='post-address'
                          orderId={order.id} />
                      </React.Suspense>
                    </View>
                  </Flex>
                </View>
              </Flex>
            }
            {tabId === 4 &&
              <React.Suspense fallback={<div>Please wait...</div>}>
                <TaskForm
                  orderId={order.id} />
              </React.Suspense>
            }
          </View>
        </View>
      }

    </View >

  );

  function setMatel(e: number) {
    const percent = ((order.btFinance - e) / order.btFinance) * 100.0
    //const fin = e + (e * (percent/100.0) )

    setOrder(o => ({
      ...o,
      //btFinance: fin,
      btPercent: percent,
      btMatel: e,
    }))

    setIsDirty(true)
  }

  function setMatrix(v: number) {
    const fin = v - order.stnkPrice
    const matel = fin - (fin * (order.btPercent / 100.0))

    setOrder(o => ({
      ...o,
      matrix: v,
      btFinance: fin,
      btMatel: matel
    }))

    setIsDirty(true)
  }

  function setPercent(v: number) {
    //console.log('test')
    const matel = order.btFinance - (order.btFinance * (v / 100.0))

    setOrder(o => ({
      ...o,
      btPercent: v,
      btMatel: matel
    }))

    setIsDirty(true)
  }

  function setStnk(v: number) {
    const fin = order.matrix - v
    const matel = fin - (fin * (order.btPercent / 100.0))
    setOrder(o => ({
      ...o,
      btFinance: fin,
      stnkPrice: v,
      btMatel: matel
    }))

    setIsDirty(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (order.name.trim().length === 0) {
      return
    }

    if (order.id === 0) {
      await inserData(order);
    } else {
      await updateData(order);
    }
  }

  async function updateData(p: iOrder) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(p)
    //console.log(p)

    await axios
      .put(`/order/${p.id}`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        setIsDirty(false)
        if (onUpdate) onUpdate(p.id, p)
      })
      .catch(error => {
        console.log(error)
        setMessage(`Nomor order SPK "${p.name}" sudah digunakan.`)
      })
  }

  async function inserData(p: iOrder) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const xData = JSON.stringify(p)
    //console.log(p)

    await axios
      .post(`/order`, xData, { headers: headers })
      .then(response => response.data)
      .then(data => {
        setOrder(data)
        setIsDirty(false)
        setMessage('')
        if (onInsert) onInsert(data)
      })
      .catch(error => {
        console.log(error)
        setMessage(`Nomor order SPK "${p.name}" sudah digunakan.`)
      })
  }

  async function deleteData(p: number) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    await axios
      .delete(`/order/${p}`, { headers: headers })
      .then(response => response.data)
      .then(data => {
        setIsDirty(false)
        if (onDelete) onDelete(p)
      })
      .catch(error => {
        console.log(error)
      })
  }


  function responseUnitChange(params: { method: string, dataUnit?: iUnit }) {
    const { method, dataUnit } = params

    const u = method === 'remove' ? initUnit : dataUnit;

    setOrder(o => ({ ...o, unit: u }))
    //if (onUpdate) onUpdate(order.id, { ...order, unit: u })
  }

  function handleChange(fieldName: string, value: string | number | boolean | undefined | null) {
    setOrder(o => ({ ...o, [fieldName]: value }))
    setIsDirty(true)
  }


}

export default OrderForm;