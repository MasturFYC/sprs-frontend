import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from "../lib/axios-base";
import { iBranch, iFinance } from '../lib/interfaces'
import { ProgressCircle } from "@react-spectrum/progress";
import { Flex } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import { useAsyncList } from '@react-stately/data'

const OrderForm = React.lazy(() => import('./OrderForm'))

const OrderPage = () => {
  const {state} = useLocation();
  let { pid } = useParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(0)


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

  let branches = useAsyncList<iBranch>({
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

    if (!isLoaded) {
      setOrderId(pid ? +pid : 0)
    }

    return () => { isLoaded = true }
  }, [pid])

  if (finances.isLoading || branches.isLoading) {
    return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
  }

  return <View marginX={{base: 'size-50', M:'size-400', L:'size-1250'}}>
    <OrderForm
      orderId={orderId}
      finances={finances.items}
      branches={branches.items}
      onCancle={() => {
        navigate(`${(state as any).from}`)
      }}
      onDelete={() => {
        navigate(`${(state as any).from}`)
      }}
      onUpdate={() => {
        navigate(`${(state as any).from}`)
      }}
    />
  </View>
}

export default OrderPage;