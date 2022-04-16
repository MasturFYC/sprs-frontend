import { useEffect, useState } from 'react'
import { Flex, ProgressCircle, View } from '@adobe/react-spectrum';
import axios from "../lib/axios-base";
import { tOrderInvoiced } from './interface';
import { TableContent } from "./TableContent";

type ReportOrderAllWaitingProps = {
  financeId?: string
  branchId?: string
  typeId?: string
}

export function ReportOrderAllWaiting({
  financeId,
  branchId,
  typeId
}: ReportOrderAllWaitingProps) {
  const [orders, setOrders] = useState<tOrderInvoiced[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isLoaded = false

    const load = async () => {
      const headers = {
        'Content-Type': 'application/json'
      }

      const url = `/report/order-all-waiting/${financeId}/${branchId}/${typeId}`

      const res = await axios
        .get(url, { headers: headers })
        .then(response => response.data)
        .then(data => data)
        .catch(error => {
          console.log(error)
        })

      return res ? res : []
    }


    setIsLoading(true)
    load().then(data => {
      if (!isLoaded) {
        setOrders(data)
        setIsLoading(false)
      }
    })

    return () => { isLoaded = true }

  }, [financeId, branchId, typeId])

  if (isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View marginTop={'size-200'} marginBottom={'size-200'}>
      <View marginTop={'size-200'} marginBottom={'size-200'}>
        <span className='div-h2'>Semua data order yang belum dicairkan (semua tanggal)</span>
      </View>

      {TableContent(2, orders)}
    </View>
  )

}
