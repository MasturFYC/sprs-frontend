import React from "react";
import axios from "../../../lib/axios-base";
import { iAccCodeType, iTrxDetail } from '../../../lib/interfaces'
import { View } from "@react-spectrum/view";
import TrxDetailForm, { initDetail } from './form'
import { Button, useAsyncList } from "@adobe/react-spectrum";
import AddIcon from '@spectrum-icons/workflow/Add'

type TrxDetailsParam = {
  trxId: number,
  accs: iAccCodeType[],
}
const TrxDetails = (props: TrxDetailsParam) => {
  const { accs, trxId } = props;

  let details = useAsyncList<iTrxDetail>({
    async load({ signal }) {
      const headers = {
        'Content-Type': 'application/json'
      }

      let res = await axios
        .get(`/trx-detail/${trxId}/`, { headers: headers })
        .then(response => response.data)
        .then(data => {
          return data ? data : []
        })
        .catch(error => {
          console.log('-------', error)
          return []
        })

      return { items: res }
    },
    getKey: (item: iTrxDetail) => item.id
  })

  return (
    <View>
      {[...details.items].map((o, i) => (
          <TrxDetailForm
            key={`${o.id + i}`}
            isNew={o.id === 0}
            accs={accs}
            detail={o}
            callback={(e) => {
              formResponse(e);
            }}
          />
      ))}
      <View marginTop={'size-100'}>
        <Button variant="secondary" onPress={() => addNewItem()}><AddIcon size='S' /></Button>
      </View>
    </View>
  );

  function formResponse(params: { method: string, data?: iTrxDetail }) {
    const { method, data } = params

    const test = [...details.items.filter(o => o.id !== 0)];

    switch (method) {
      case 'insert':
        if (data) {

          let c = 1;

          const filters = details.items.filter(o => o.id > 0)

          if (filters) {
            const i = filters.length;
            if (i > 0) {
              c = filters[i - 1].id + 1
            }
          }

          const newData = { ...data, id: c }

          details.remove(0)
          details.append(newData)

          test.push(newData)
        }
        break;
      case 'update':
        if (data) {
          details.update(data.id, data)
          let i = -1;
          for (var c = 0; c < test.length; c++) {
            if (test[c].id === data.id) {
              i = c;
              break;
            }
          }

          if (i >= 0) {
            test.splice(i, 1, data)
          }
        }
        break;
      case 'delete':
        if (data) {
          details.remove(data.id);
          let i = -1;
          for (var x = 0; x < test.length; x++) {
            if (test[x].id === data.id) {
              i = x;
              break;
            }
          }

          if (i >= 0) {
            test.splice(i, 1)
          }
        }
        break;
      case 'cancel':
        if (data && data.id === 0) {
          details.remove(0);
        }
        return;
    }


    console.log(test)

  }

  function addNewItem() {
    details.append({ ...initDetail, trxId: trxId });
  }
}

export default TrxDetails;