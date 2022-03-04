import React, { FormEvent } from 'react';
import { iCustomer } from '../component/interfaces'
import { Button, Flex, TextField, View } from '@adobe/react-spectrum';
import axios from '../component/axios-base';

export const initCustomer: iCustomer = {
    orderId: 0,
    name: '',
    agreementNumber: '',
    paymentType: ''
}

type CustomerFormOptions = {
    customer: iCustomer,
    isNew: boolean,
    callback: (params: { method: string, customer?: iCustomer }) => void
}

const CustomerForm = (props: CustomerFormOptions) => {
    const { customer, callback, isNew } = props;
    const [data, setData] = React.useState<iCustomer>(initCustomer)

    const isNameValid = React.useMemo(
        () => data && data.name && data.name.length > 0,
        [data]
    )
    const isAgreementValid = React.useMemo(
        () => data && data.agreementNumber && data.agreementNumber.length > 0,
        [data]
    )
    const isPaymentValid = React.useMemo(
        () => data && data.paymentType && data.paymentType.length > 0,
        [data]
    )

    React.useEffect(() => {
        let isLoaded = true;

        if (isLoaded) {
            setData(customer)
        }

        return () => { isLoaded = false }

    }, [customer])

    return (
        <form onSubmit={(e) => handleSubmit(e)}>
            <h3>DATA KONSUMEN</h3>
            <Flex gap='size-100' direction={'column'}>
                <Flex flex direction={{ base: 'column', M: 'row' }} gap='size-100'>
                    <TextField
                        validationState={isNameValid ? 'valid' : 'invalid'}
                        label='Nama konsumen'
                        flex
                        autoComplete='name'
                        width={{ base: 'auto' }}
                        value={data.name}
                        maxLength={50}
                        onChange={(e) => setData(prev => ({ ...prev, name: e }))}
                    />
                    <TextField
                        flex
                        label='Nomor perjanjian'
                        validationState={isAgreementValid ? 'valid' : 'invalid'}
                        width={'auto'}
                        value={data.agreementNumber}
                        maxLength={25}
                        onChange={(e) => setData((prev) => ({ ...prev, agreementNumber: e }))}
                    />
                    <TextField
                        label='Jenis pembayaran'
                        width={{ base: 'auto', M: '25%' }}
                        value={data.paymentType}
                        validationState={isPaymentValid ? 'valid' : 'invalid'}
                        maxLength={25}
                        onChange={(e) => setData((prev) => ({ ...prev, paymentType: e }))}
                    />
                </Flex>
                <Flex direction={'row'} gap='size-100' marginBottom={'size-200'} marginTop={'size-50'}>
                    <Flex flex direction={'row'} columnGap={'size-100'}>
                        <Button type='submit' variant='secondary'>Update</Button>
                        {/* <Button type='button' variant='primary'
                            onPress={() => callback({ method: 'cancel' })}>Cancel</Button> */}
                    </Flex>
                    {data.orderId > 0 &&
                        <View>
                            <Button 
                            isDisabled={isNew}
                            type='button' alignSelf={'flex-end'} variant='negative'
                                onPress={() => deleteData(data)}>Clear</Button>
                        </View>
                    }
                </Flex>
            </Flex>
        </form>
    );

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!isNameValid) {
            return
        }
        if (!isAgreementValid) {
            return
        }
        if (!isPaymentValid) {
            return
        }

        if (isNew) {
            await inserData(data);
        } else {
            await updateData(data);
        }
    }

    async function updateData(p: iCustomer) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        const xData = JSON.stringify(p)

        await axios
            .put(`/customers/${p.orderId}/`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                //console.log(data)
                callback({ method: 'save', customer: p })
            })
            .catch(error => {
                console.log(error)
            })
    }

    async function inserData(p: iCustomer) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        const xData = JSON.stringify(p)

        await axios
            .post(`/customers/`, xData, { headers: headers })
            .then(response => response.data)
            .then(data => {
                callback({ method: 'save', customer: p })
            })
            .catch(error => {
                console.log(error)
            })
    }


    async function deleteData(p: iCustomer) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }

        await axios
            .delete(`/customers/${p.orderId}/`, { headers: headers })
            .then(response => response.data)
            .then(data => {
                callback({ method: 'remove' })
            })
            .catch(error => {
                console.log(error)
            })
    }

}

export default CustomerForm;