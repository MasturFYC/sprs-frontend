import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iAccCode, iFinance } from "lib/interfaces";
import { iInvoice } from "lib/invoice-interfaces";

export interface InvoiceInfo extends iInvoice {
  finance?: iFinance
  account?: iAccCode
}

export function useInvoiceList() {
  const [list, setList] = useState<InvoiceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isLoaded = false;
    async function load() {
      const headers = {
        'Content-Type': 'application/json'
      };

      const res = await axios
        .get("/invoice", { headers: headers })
        .then(response => response.data)
        .catch(error => console.log(error))
        .then(data => data);

      return res ? res : [];
    }
    setIsLoading(true)
    load().then(data => {
      if (!isLoaded) {
        setList(data)
        setIsLoading(false)
      }
    });

    return () => { isLoaded = true; };
  }, [count]);

  return {
    items: list,
    count: () => list.length,
    isLoading: isLoading,
    getItem: (id: number) => list.filter(f => f.id === id)[0],
    search: async (e: string) => {
      setList([]);
      const headers = {
        'Content-Type': 'application/json'
      }
      await axios
        .post(`/invoice/search`, { txt: e }, { headers: headers })
        .then(response => response.data)
        .then(data => setList(data))
        .catch(error => {
          console.log(error)
        })
    },

    getByMonth: async (month: number, year: number) => {
      setList([]);
      const headers = {
        'Content-Type': 'application/json'
      }

      await axios
        .get(`/invoice/month-year/${month}/${year}`, { headers: headers })
        .then(response => response.data)
        .then(data => setList(data))
        .catch(error => console.log(error))
    },

    getByFinance: async (id: number) => {
      setList([]);

      const headers = {
        'Content-Type': 'application/json'
      }

      await axios
        .get(`/invoice/finance/${id}`, { headers: headers })
        .then(response => response.data)
        .then(data => setList(data))
        .catch(error => console.log(error))
    },
    reload: () => {
      setCount(count + 1);
    },
  };

}
