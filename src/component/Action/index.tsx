import React, { Fragment } from "react";
import axios from "../axios-base";
import { iAction } from '../interfaces'
import ActionForm, { initAction } from './Form'
import { View } from "@react-spectrum/view";
import { Divider, Flex, Link, useAsyncList } from "@adobe/react-spectrum";
import { FormatDate } from "../format";

const Action = () => {
    const [selectedId, setSelectedId] = React.useState<number>(-1);
    const orderId = 2;
    let actions = useAsyncList<iAction>({
        async load({ signal }) {
            const headers = {
                'Content-Type': 'application/json'
            }

            let res = await axios
                .get(`/actions/${orderId}/`, { headers: headers })
                .then(response => response.data)
                .then(data => {
                    console.log(data)
                    return data ? data : []
                })
                .catch(error => {
                    console.log({'Error': error})
                })

            return { items: [initAction, ...res] }
        },
        getKey: (item: iAction) => item.id
    })

    return (
        <Fragment>
            <h2>Tindakan</h2>
            <Divider size={'S'} />
            {actions.items.map(o => {
                return o.id === selectedId ?
                    <ActionForm key={o.id} action={o} callback={(e) => formResponse(e)} />
                    :
                    <View key={o.id}>
                        <Flex direction={{ base: 'column', M: 'row' }} gap={'size-100'} marginY='size-100' >
                            <View width={{ base: 'auto', M: 'size-3400' }}>
                                <Link isQuiet variant={'primary'}
                                    onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                                    {o.id === 0 ? 'Tindakan baru' : `${FormatDate(o.actionAt)} - (${o.descriptions})`}
                                </Link>
                            </View>
                        </Flex>
                        <Divider size={'S'} />
                    </View>
            })}
        </Fragment>
    );

    function formResponse(params: { method: string, data?: iAction }) {
        const { method, data } = params

        if (method === 'save' && data) {
            if (selectedId === 0) {
                actions.insert(1, data)
            } else {
                actions.update(data.id, data)
            }
        } else if (method === 'remove' && data) {
            actions.remove(data.id)
        }

        setSelectedId(-1)
    }
}

export default Action;