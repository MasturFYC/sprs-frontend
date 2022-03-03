import React, { Fragment } from "react";
import axios from "../axios-base";
import { iFinance } from '../interfaces'
import FinanceForm, { initFinance } from './Form'
import { View } from "@react-spectrum/view";
import { Divider, Flex, Link, useAsyncList } from "@adobe/react-spectrum";

const Finance = () => {
    const [selectedId, setSelectedId] = React.useState<number>(-1);
    let Finances = useAsyncList<iFinance>({
        async load({ signal }) {
            const headers = {
                'Content-Type': 'application/json'
            }

            let res = await axios
                .get("/finances/", { headers: headers })
                .then(response => response.data)
                .then(data => {
                    return data ? data : []
                })
                .catch(error => {
                    console.log(error)
                })

            return { items: [initFinance, ...res] }
        },
        getKey: (item: iFinance) => item.id
    })

    return (
        <Fragment>
            <h1>Pengelola Keuangan (Finance)</h1>
            <Divider size={'S'} />
            {Finances.items.map(o => {
                return o.id === selectedId ?
                    <FinanceForm key={o.id} finance={o} callback={(e) => formResponse(e)} />
                    :
                    <View key={o.id}>
                    <Flex direction={{ base: 'column', M: 'row' }} gap={'size-100'} marginY='size-100' >
                        <View width={{base:'auto', M:'size-3400'}}>
                            <Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700, fontSize: '16px' }}
                                onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                                {o.id === 0 ? 'Finance baru' : `${o.name} - (${o.shortName})`}
                            </Link>
                        </View>
                        <View flex width={'auto'}>
                            <div>{o?.street}{o.city ? `, ${o.city}` : ''}
                                {o.zip ? ` - ${o.zip}` : ''}
                            </div>
                            <div>{o.phone ? `Telp. ${o.phone}` : ''}
                                    {o.cell && o.phone ? ` / ` : ''}
                                    {o.cell && o.phone === '' ? `Cellular: ` : ''}
                                {o.cell ?? ''}
                            </div>
                            <div>{o.email ? `e-mail: ${o.email}` : ''}</div>
                        </View>
                    </Flex>
                    <Divider size={'S'} />
                    </View>
            })}
        </Fragment>
    );

    function formResponse(params: { method: string, data?: iFinance }) {
        const { method, data } = params

        if (method === 'save' && data) {
            if (selectedId === 0) {
                Finances.insert(1, data)
            } else {
                Finances.update(data.id, data)
            }
        } else if (method === 'remove' && data) {
            Finances.remove(data.id)
        }

        setSelectedId(-1)
    }
}

export default Finance;