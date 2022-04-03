import React, { Fragment } from "react";
import { iFinance } from '../../lib/interfaces'
import FinanceForm, { initFinance } from './Form'
import { View } from "@react-spectrum/view";
import { Divider, Flex, Link, ProgressCircle } from "@adobe/react-spectrum";
import { useFinanceList } from "lib/useFinance";

const Finance = () => {
    const [selectedId, setSelectedId] = React.useState<number>(-1);

    let finances = useFinanceList()

    if (finances.isLoading) {
        return <Flex flex justifyContent={'center'}><ProgressCircle aria-label="Loading…" isIndeterminate /></Flex>
    }    

    return (
        <Fragment>
            <h1>Pengelola Keuangan (Finance)</h1>
            <Divider size={'S'} />
            {[initFinance, ...finances.items].map(o => {
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
                finances.insert(data)
            } else {
                finances.update(data.id, data)
            }
        } else if (method === 'remove' && data) {
            finances.remove(data.id)
        }

        setSelectedId(-1)
    }
}

export default Finance;