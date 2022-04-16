import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iTrx } from "./interfaces";

export function useTransactionList() {
  const [list, setList] = useState<iTrx[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isLoaded = false;
    async function load() {
      const headers = {
        'Content-Type': 'application/json'
      };

      const res = await axios
        .get("/trx", { headers: headers })
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
    insert: (e: iTrx) => {
      const arr = [...list]
      arr.unshift(e);
      setList(arr)
    },
    update: (id: number, e: iTrx) => {
      let i = -1;
      for (let c = 0; c < list.length; c++) {
        if (list[c].id === id) {
          i = c;
          break;
        }
      }

      if (i >= 0) {
        const arr = [...list];
        arr.splice(i, 1, e)
        setList(arr)
      }
    },
    remove: (id: number) => {
      let i = -1;
      for (let c = 0; c < list.length; c++) {
        if (list[c].id === id) {
          i = c;
          break;
        }
      }

      if (i >= 0) {
        const arr = [...list];
        arr.splice(i, 1)
        setList(arr)
      }
    },
    search: async (e: string) => {
      setList([])
      const headers = {
        'Content-Type': 'application/json'
      }
      await axios
        .post(`/trx/search`, { txt: e }, { headers: headers })
        .then(response => response.data)
        .catch(error => console.log(error))
        .then(data => data && setList(data || []))
    },
    getByMonth: async (id: number) => {

      const headers = {
        'Content-Type': 'application/json'
      }

      await axios
        .get(`/trx/month/${id}`, { headers: headers })
        .then(response => response.data)
        .catch(error => console.log(error))
        .then(data => setList(data ? data : []))
    },
    reload: () => {
      const counter = count +1;
      setCount(counter)
    }
  };
}
