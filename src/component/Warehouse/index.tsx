import React, { Fragment } from "react";
import axios from "../../lib/axios-base";
import WheelForm, { initWarehouse } from './Form'
import { iWarehouse } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Link, useAsyncList } from "@adobe/react-spectrum";

const Wheel = () => {
    const [selectedId, setSelectedId] = React.useState<number>(-1);
    let warehouses = useAsyncList<iWarehouse>({
        async load({ signal }) {
            const headers = {
                'Content-Type': 'application/json'
            }

            let res = await axios
                .get("/warehouses/", { headers: headers })
                .then(response => response.data)
                .then(data => {
                    return data ? data : []
                })
                .catch(error => {
                    console.log(error)
                })

            return { items: [initWarehouse, ...res] }
        },
        getKey: (item: iWarehouse) => item.id
    })

    return (
        <Fragment>
            <h1>Gudang</h1>
            {warehouses.items.map(o => {
                return o.id === selectedId ?
                    <WheelForm key={o.id} warehouse={o} callback={(e) => formResponse(e)} />
                    :
                    <View key={o.id} marginY='size-100' >
                        <Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700 }}
                            onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                            {o.id === 0 ? 'Gudang baru' : o.name }
                        </Link>
                        <div>{o.descriptions}</div>
                    </View>
            })}
        </Fragment>
    );

    function formResponse(params: { method: string, data?: iWarehouse }) {
        const { method, data } = params

        if (method === 'save' && data) {
            if (selectedId === 0) {
                warehouses.insert(1, data)
            } else {
                warehouses.update(data.id, data)
            }
        } else if (method === 'remove' && data) {
            warehouses.remove(data.id)
        }

        setSelectedId(-1)
    }
}

export default Wheel;