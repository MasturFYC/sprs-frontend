//import React from 'react';

type TableHeadProps = {
  status: number;
};
export function TableHead({ status }: TableHeadProps) {
  const backColor = ['bg-orange-600', 'back-green-700', 'bg-purple-700', 'bg-indigo-700'];
  return (
    <thead>
      <tr className={`text-white ${backColor[status]}`}>
        <th className='text-center font-bold'>NO.</th>
        <th className='text-center font-bold'>TANGGAL</th>
        <th className='font-bold text-no-wrap'>ORDER (SPK)</th>
        <th className='font-bold'>CABANG</th>
        <th className='font-bold'>FINANCE</th>
        <th className='font-bold'>TIPE</th>
        <th className='font-bold'>MERK</th>
        <th className='font-bold'>NOPOL</th>
        <th className='text-center font-bold'>TAHUN</th>
        <th className={'text-center font-bold'}>STNK?</th>
        <th className='text-right font-bold text-no-wrap'>BT-FINANCE</th>
        <th className='text-right font-bold text-no-wrap'>BT-MATEL</th>
      </tr>
    </thead>
  );
}
