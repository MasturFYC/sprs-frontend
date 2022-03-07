import React, { Fragment } from "react";
import axios from "../../lib/axios-base";
import { iBranch } from '../../lib/interfaces'
import BranchForm, { initBranch } from './Form'
import { View } from "@react-spectrum/view";
import { Divider, Flex, Link, useAsyncList } from "@adobe/react-spectrum";

const Branch = () => {
    const [selectedId, setSelectedId] = React.useState<number>(-1);
    let branchs = useAsyncList<iBranch>({
        async load({ signal }) {
            const headers = {
                'Content-Type': 'application/json'
            }

            let res = await axios
                .get("/branchs/", { headers: headers })
                .then(response => response.data)
                .then(data => {
                    return data ? data : []
                })
                .catch(error => {
                    console.log(error)
                })

            return { items: [initBranch, ...res] }
        },
        getKey: (item: iBranch) => item.id
    })

    return (
        <Fragment>
            <h1>Cabang Kantor</h1>
            <Divider size={'S'} />
            {branchs.items.map(o => {
                return o.id === selectedId ?
                    <BranchForm key={o.id} branch={o} callback={(e) => formResponse(e)} />
                    :
                    <View key={o.id}>
                    <Flex direction={{ base: 'column', M: 'row' }} gap={'size-100'} marginY='size-100' >
                        <View width={{base:'auto', M:'size-3400'}}>
                            <Link isQuiet variant={'primary'} UNSAFE_style={{ fontWeight: 700, fontSize: '16px' }}
                                onPress={() => setSelectedId(selectedId === o.id ? -1 : o.id)}>
                                {o.id === 0 ? 'Cabang baru' : `${o.name} - (${o.headBranch})`}
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

    function formResponse(params: { method: string, data?: iBranch }) {
        const { method, data } = params

        if (method === 'save' && data) {
            if (selectedId === 0) {
                branchs.insert(1, data)
            } else {
                branchs.update(data.id, data)
            }
        } else if (method === 'remove' && data) {
            branchs.remove(data.id)
        }

        setSelectedId(-1)
    }
}

export default Branch;