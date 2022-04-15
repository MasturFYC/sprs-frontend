import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'lib/axios-base';
import { View } from "@react-spectrum/view";
import { ProgressCircle } from '@react-spectrum/progress'
import { Text } from '@react-spectrum/text'
import { Flex } from "@react-spectrum/layout";
import { TextField } from "@react-spectrum/textfield";
import { Button } from "@react-spectrum/button";
import { dateParam, dateOnly, iBranch } from "lib/interfaces";
import { FormatNumber, FormatDate } from "lib/format";
import Find from "@spectrum-icons/workflow/Search"
import { useBranchList } from "lib/useBranch";
import { Item, TabList, Tabs } from "@react-spectrum/tabs";

type labaRugi = {
  id: number,
  index: number,
  title: string,
  branch: number,
  division: string,
  debt: number,
  cred: number,
  profit: number,
}

const LabaRugiTanggal = () => {
  const { dari, ke } = useParams()
  const navigate = useNavigate();
  let [isLoading, setLoaded] = React.useState(false)
  let [data, setData] = React.useState<labaRugi[]>([])
  let [isDirty, setDirty] = React.useState(false)
  let [dateFrom, setDateFrom] = React.useState(dateOnly(dateParam(null)))
  let [dateTo, setDateTo] = React.useState(dateOnly(dateParam(null)))
  let [tab, setTab] = React.useState(0)
  let info = [
    { id: 1, group: 1, title: 'Biaya Order', division: 'trx-order' },
    { id: 2, group: 1, title: 'Biaya Pinjaman Unit', division: 'trx-lent' },
    { id: 3, group: 1, title: 'Biaya Piutang', division: 'trx-loan' },
    { id: 4, group: 2, title: 'Pendapatan Invoice', division: 'trx-invoice' },
    { id: 5, group: 2, title: 'Pendapatan Cicilan Unit', division: 'trx-cicilan' },
    { id: 6, group: 2, title: 'Pendapatan Angsuran Piutang', division: 'trx-angsuran' },
    { id: 7, group: 3, title: 'Beban', division: 'trx-auto' },
  ]

  const {items: tabs, isLoading: branchIsLoading} = useBranchList();

  const isFromValid = React.useMemo(
    () => {
      const d = new Date(dateFrom);
      const t = new Date(dateTo);
      
      return d <= t
    },
    [dateFrom, dateTo]
  )  

  React.useEffect(() => {
    let isLoaded = true;

    async function load() {
      const headers = {
        'Content-Type': 'application/json'
      }

      const d = dari ? dari : dateParam(null);
      const k = ke ? ke : dateParam(null);

      let res = await axios
        .get(`/labarugi/bydate/${d}/${k}`, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {console.log(error)})

      return res
    }

    setLoaded(true);
    load().then(res => {
      if (isLoaded) {
        setData(res)
        setLoaded(false)
        setDateTo(ke ? ke : dateParam(null))
        setDateFrom(dari ? dari : dateParam(null))
      }
    })

    return () => { isLoaded = false }

  }, [dari, ke])

  function getData() {
    return tab === 0 ? data : data.filter(f => f.branch === tab);
  }

  return (
    <View>
      <Flex direction='row' columnGap='size-200' marginTop={'size-200'} marginBottom={'size-400'}>
       <View><span className="div-h2 font-bold">Laporan Laba Rugi</span></View>
        {(isLoading || branchIsLoading) && <View><ProgressCircle aria-label="Loading…" isIndeterminate /></View>}
      </Flex>
      <Flex direction={{base:'column', M: 'row'}} rowGap={'size-75'} columnGap='size-200' marginTop={'size-200'} marginBottom={'size-400'}>
        <TextField
          type={'date'}
          labelAlign={'end'}
          label={<View width={{base: '88px', M:'auto'}}>Dari tanggal</View>}
          labelPosition={'side'}
          validationState={isFromValid ? 'valid' : 'invalid'}
          width={'auto'}
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(dateOnly(e))
            setDirty(true)
          }}
        />
        <TextField
          type={'date'}
          labelAlign={'end'}
          labelPosition={'side'}
          validationState={isFromValid ? 'valid' : 'invalid'}
          label={<View width={{base: '88px', M:'auto'}}>Sampai</View>}
          width={'auto'}
          value={dateTo}
          onChange={(e) => {
            setDateTo(dateOnly(e))
            setDirty(true)
          }}
        />
        <Button variant="cta" isDisabled={!isDirty || !(isFromValid)} onPress={()=> {
          navigate(`/labarugi/tanggal/${dateFrom}/${dateTo}`)
          setDirty(false)
        }}>
          <Find />
          <Text>Load</Text>
        </Button>        
      </Flex>
      <View>
        <Tabs
          aria-label="Tab-Order"
          density='compact'
          items={[{ id: 0, name: "All", headBranch: "" },...tabs]}
          defaultSelectedKey={tab}
          onSelectionChange={(e) => {
            if(!branchIsLoading || !isLoading) {
              setTab(+e)
            }
          }}>
          <TabList aria-label="Tab-Order-List">
            {(item: iBranch) => <Item key={item.id}>{item.name}</Item>}
          </TabList>
        </Tabs>
      </View>
      <View>
        <View><span className={'div-h2'}>1) Biaya yang dikeluarkan</span></View>
        <View marginY={'size-200'}>
          Yaitu biaya-biaya yang dikeluarkan untuk <i>Biaya Tarik Matel</i>
          {' '}karena adanya <b>Order</b> atau <b>Pinjaman unit</b>, ditambah <i>biaya pokok</i> dari <b>Piutang</b>,
          {' '}dengan rincian mulai dari {FormatDate(dari ? dari : dateParam(null))} sampai{' '}
          {FormatDate(ke ? ke : dateParam(null))} adalah sebagai berikut:
        </View>
        <table className="table-small collapse-none" cellPadding={6}>
          <thead>
            <tr className="border-b-1 border-t-1 bg-green-600 text-white">
              <th className="text-left">Jenis Biaya</th>
              <th className="text-right">Jumlah Biaya</th>
            </tr>
          </thead>
          <tbody>
            {
              getData().filter(f => f.index === 1).map((item) => (
                <tr key={item.id} className="border-b-gray-50">
                  <td>
                    {info.filter(f => f.division === item.division)[0].title}
                    {tab === 0 ? ` (${tabs.filter(f => f.id === item.branch)[0].name})` : ''}
                  </td>
                  <td className="text-right">{FormatNumber(item.debt, 2)}</td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="border-b-1">
              <th>Total</th>
              <th className="text-right">{FormatNumber(getData().filter(f => f.index === 1).reduce((t, c) => t + c.debt, 0), 2)}</th>
            </tr>
          </tfoot>
        </table>
      </View>
      <View marginY={'size-400'}>
        <View><span className={'div-h2'}>2) Pendapatan</span></View>
        <View marginY={'size-200'}>
          Yaitu penerimaan yang didapatkan dari <i>Invoice</i>, <i>Cicilan Pinjaman Unit</i>, dan <i>Piutang</i>,{' '}
          dan pendatan lain-lain. Penerimaan dipecah menjadi 2 yaitu <i>modal yang dikembalikan</i> dan{' '}
          <i>keuntungan bruto</i>, khusus untuk modal atau keuntungan bruto, baik <b>cicilan</b> maupun{' '}
          <b>angsuran</b> diambil berdasarkan prosentase masing-masing, sedangkan keuntungan bruto dari{' '}
          <b>invoice</b> diambil dari selisih BT-Finance dan Bl-Matel. Adapun detail dari pendapatan{' '}
          mulai dari {FormatDate(dari ? dari : dateParam(null))} sampai {FormatDate(ke ? ke : dateParam(null))}{' '}
          bisa dilihat pada tabel berikut:
        </View>
        <Flex direction={{ base: 'column', L: 'column' }} rowGap={'size-100'} columnGap={'size-200'}>
          <View flex>
            <table className="table-small table-100 collapse-none" cellPadding={6}>
              <thead>
                <tr className="border-b-1 border-t-1 bg-green-600 text-white">
                  <th className="text-left">Jenis Pendapatan</th>
                  <th className="text-right">Jumlah Pendapatan</th>
                  <th className="text-right">Modal Dikembalikan</th>
                  <th className="text-right">Keuntungan Bruto</th>
                </tr>
              </thead>
              <tbody>
                {
                  getData().filter(f => f.index === 2).map((item) => (
                    <tr key={item.id} className="border-b-gray-50">
                      <td>
                        {info.filter(f => f.division === item.division)[0].title}
                        {tab === 0 ? ` (${tabs.filter(f => f.id === item.branch)[0].name})` : ''}
                      </td>
                      <td className="text-right">{FormatNumber(item.cred, 2)}</td>
                      <td className="text-right">{FormatNumber(item.debt, 2)}</td>
                      <td className="text-right">{FormatNumber(item.profit, 2)}</td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-b-1">
                  <th>Total</th>
                  <th className="text-right">{FormatNumber(getData().filter(f => f.index === 2).reduce((t, c) => t + c.cred, 0), 2)}</th>
                  <th className="text-right">{FormatNumber(getData().filter(f => f.index === 2).reduce((t, c) => t + c.debt, 0), 2)}</th>
                  <th className="text-right">{FormatNumber(getData().filter(f => f.index === 2).reduce((t, c) => t + c.profit, 0), 2)}</th>
                </tr>
              </tfoot>
            </table>
          </View>
          <View>
            <View><b>Rumus Cicilan Unit</b></View>
            <code className="code-sm">
              Keuntungan = Prosentase x Penerimaan<br />
              Modal      = Penerimaan - Keuntungan<br /><br />

              dik:<br />
              Prosentase = (BT-Finance - BT-Matel) / BT-Finance<br />
              Penerimaan = Pendapatan
            </code>
          </View>
          <View>

          </View>
        </Flex>
      </View>
      <View marginY={'size-400'}>
        <View><span className={'div-h2'}>3) Beban</span></View>
        <View marginY={'size-200'}>
          Yaitu kewajiban yang dikeluarkan karena adanya kegiatan usaha, mulai dari{' '}
          {FormatDate(dari ? dari : dateParam(null))} sampai{' '}
          {FormatDate(ke ? ke : dateParam(null))}{' '}
          beban yang dikeluarkan perusahaan sebesar yang tertera pada tabel di bawah ini:
        </View>
        <table className="table-small collapse-none" cellPadding={6}>
          <thead>
            <tr className="border-b-1 border-t-1 bg-green-600 text-white">
              <th className="text-left">Jenis Beban</th>
              <th className="text-right">Jumlah Beban</th>
            </tr>
          </thead>
          <tbody>
            {
              getData().filter(f => f.index === 3).map((item) => (
                <tr key={item.id} className="border-b-gray-50">
                  <td>{item.division}</td>
                  <td className="text-right">{FormatNumber(item.debt, 2)}</td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="border-b-1">
              <th>Total</th>
              <th className="text-right">{FormatNumber(getData().filter(f => f.index === 3).reduce((t, c) => t + c.debt, 0), 2)}</th>
            </tr>
          </tfoot>
        </table>
      </View>
      <View marginY={'size-400'}>
        <View><span className={'div-h2'}>4) Keuntungan bersih</span></View>
        <View marginY={'size-200'}>Keuntungan bersih didapatkan dari <b>Keuntungan Bruto</b> dikurangi <b>Beban</b></View>
        <View>
          <b>{FormatNumber(getData().filter(f => f.index === 2).reduce((t, c) => t + c.profit, 0) - getData().filter(f => f.index === 3).reduce((t, c) => t + c.debt, 0), 2)}</b>
          {' '}<b>=</b>
          {' '}{FormatNumber(getData().filter(f => f.index === 2).reduce((t, c) => t + c.profit, 0), 2)}
          {' '}<b>-</b>
          {' '}{FormatNumber(getData().filter(f => f.index === 3).reduce((t, c) => t + c.debt, 0), 2)}
        </View>
      </View>
    </View>
  );
}

export default LabaRugiTanggal;