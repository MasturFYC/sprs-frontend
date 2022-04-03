import React from 'react';

type TableHeadProps = {
  status: number;
};
export function TableHead({ status }: TableHeadProps) {
  const backColor = ['back-orange-700', 'back-green-700', 'back-purple-700', 'back-indigo-700'];
  return (
    <thead>
      <tr className={`text-white ${backColor[status]}`}>
        <td className='text-center font-bold'>NO.</td>
        <td className='text-center font-bold'>TANGGAL</td>
        <td className='font-bold text-no-wrap'>ORDER (SPK)</td>
        <td className='font-bold'>CABANG</td>
        <td className='font-bold'>FINANCE</td>
        <td className='font-bold'>TIPE</td>
        <td className='font-bold'>MERK</td>
        <td className='font-bold'>NOPOL</td>
        <td className='text-center font-bold'>TAHUN</td>
        <td className={'text-center font-bold'}>STNK?</td>
        <td className='text-right font-bold text-no-wrap'>BT-FINANCE</td>
        <td className='text-right font-bold text-no-wrap'>BT-MATEL</td>
      </tr>
    </thead>
  );
}
