import React from 'react';
//import { FormatNumber } from '../lib/format';


export type TableFooterProps = {
  children: {
    count: React.ReactNode,
    btFinance: React.ReactNode,
    btMatel: React.ReactNode,
  }
}
export function TableFooter({
  children
}: TableFooterProps) {
  return (<tfoot>
    <tr>
      {children.count}
      {children.btFinance}
      {children.btMatel}
    </tr>
  </tfoot>);
}
