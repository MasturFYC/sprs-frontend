import React, { Fragment } from "react";
import axios from "../axios-base";
import { iVehicle } from '../interfaces'
import VehicleForm, { initVehicle } from './Form'
import { View } from "@react-spectrum/view";
import { Link, useAsyncList } from "@adobe/react-spectrum";

const Vehicle = () => {
    const [selectedId, setSelectedId] = React.useState<number>(-1);
    let vehicles = useAsyncList<iVehicle>({
        async load({ signal }) {
            const headers = {
                'Content-Type': 'application/json'
            }

            let res = await axios
                .get("/types/", { headers: headers })
                .then(response => response.data)
                .then(data => {
                    return data ? data : []
                })
                .catch(error => {
                    console.log(error)
                })

            return { items: [initVehicle, ...res] }
        },
        getKey: (item: iVehicle) => item.id
    })

    return (
        <Fragment>
            <h1>Tipe Kendaraan</h1>
            {vehicles.items.map(o => {
                return o.id === selectedId ?
                    <VehicleForm key={o.id} vehicle={o} callback={(e) => formResponse(e)} />
                    :
                    <View key={o.id} marginY='size-100' >
                        <Link isQuiet variant={'primary'} UNSAFE_style={{fontWeight: 700}}
                            onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                            {o.id === 0 ? 'Tipe kendaraan baru' : `(${o.wheel?.shortName}) - ${o.merk?.name} ${o.name}`}
                        </Link>
                    </View>
            })}
        </Fragment>
    );

    function formResponse(params: { method: string, data?: iVehicle }) {
        const { method, data } = params

        if (method === 'save' && data) {
            if (selectedId === 0) {
                vehicles.insert(1, data)
            } else {
                vehicles.update(data.id, data)
            }
        } else if (method === 'remove' && data) {
            vehicles.remove(data.id)
        }

        setSelectedId(-1)
    }
}

export default Vehicle;