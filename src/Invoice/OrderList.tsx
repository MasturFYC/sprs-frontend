import React from "react";
import axios from "../lib/axios-base";
import { Button,Flex, ProgressCircle,  useAsyncList, View } from "@adobe/react-spectrum";
import TableOrder, { OrderLists } from "./TableOrder";

type OrderListProps = {
  financeId: number,
  invoiceId: number,
  onFinish: (list: OrderLists[]) => void,
  onCancel: () => void
}
const OrderList = ({ financeId, onFinish, onCancel, invoiceId }: OrderListProps) => {

  let orders = useAsyncList<OrderLists>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get(`/invoice/order/${financeId}/${invoiceId}`, { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data
        })
        .catch(error => {
          console.log(error)
        })

      return { items: res ? res : [] }
    },
    getKey: (item: OrderLists) => item.id
  })

  if (orders.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return (
    <View>
      <TableOrder list={orders.items} onCheck={(id, e) => {
        orders.update(id, {...orders.getItem(id), isSelected: e})
      }} />
      <Flex direction={'row'} columnGap={'size-200'} marginTop={'size-200'}>
          <Button variant="cta" onPress={() => onFinish(orders.items.filter(f=>f.isSelected)) }>
            Selesai
          </Button>
        <Button variant="primary" onPress={() => onCancel()}>Cancel</Button>
      </Flex>
    </View>
  )
}

export default OrderList;
