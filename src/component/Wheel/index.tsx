import React, { Fragment } from "react";
import axios from "../../lib/axios-base";
import WheelForm, { initWheel } from './Form'
import { iWheel } from '../../lib/interfaces'
import { View } from "@react-spectrum/view";
import { Link, useAsyncList } from "@adobe/react-spectrum";

const Wheel = () => {
    const [selectedId, setSelectedId] = React.useState<number>(-1);
    let wheels = useAsyncList<iWheel>({
        async load({ signal }) {
            const headers = {
                'Content-Type': 'application/json'
            }

            let res = await axios
                .get("/wheels/", { headers: headers })
                .then(response => response.data)
                .then(data => {
                    return data ? data : []
                })
                .catch(error => {
                    console.log(error)
                })

            return { items: [initWheel, ...res] }
        },
        getKey: (item: iWheel) => item.id
    })

    return (
        <Fragment>
            <h1>Jenis Roda Kendaraan</h1>
            {wheels.items.map(o => {
                return o.id === selectedId ?
                    <WheelForm key={o.id} wheel={o} callback={(e) => formResponse(e)} />
                    :
                    <View key={o.id} marginY='size-100' >
                        <Link isQuiet variant={'primary'} UNSAFE_style={{fontWeight: 700}}
                            onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                            {o.id === 0 ? 'Jenis roda baru' : `(${o.shortName}) - ${o.name}`}
                        </Link>
                    </View>
            })}
        </Fragment>
    );

    function formResponse(params: { method: string, data?: iWheel }) {
        const { method, data } = params

        if (method === 'save' && data) {
            if (selectedId === 0) {
                wheels.insert(1, data)
            } else {
                wheels.update(data.id, data)
            }
        } else if (method === 'remove' && data) {
            wheels.remove(data.id)
        }

        setSelectedId(-1)
    }
}

export default Wheel;