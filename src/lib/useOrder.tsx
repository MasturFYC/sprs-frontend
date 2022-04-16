import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iOrder } from "./interfaces";
import { AxiosRequestConfig } from "axios";

export function useOrderList(search: string | undefined, filter: string | undefined) {
  const [list, setList] = useState<iOrder[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    let isLoaded = false;
    async function load() {

      const headers = {
        'Content-Type': 'application/json'
      }

      const config: AxiosRequestConfig = search === 'search' ? {
        method: "post",
        data: { txt: filter },
      } : {
        method: "get",
      }

    const res = await axios({
        ...config,
        url: `/order/${search}/${filter}`,
        headers: headers,
      })
        .then(response => response.data)
        .catch(error => console.log(error))
        .then(data => data);

      return res ? res : [];
    }
    setLoading(true)
    load().then(data => {
      if (!isLoaded) {
        setList(data)
        setLoading(false)
      }
    });

    return () => { isLoaded = true; };
  }, [search, filter]);


  const getLength = (): number => list.length

  const getIndex = (id: number): number => {
    for (let c = 0; c < list.length; c++) {
      if (list[c].id === id) {
        return c
      }
    }
    return -1;
  }

  const removeItem = (id: number) => {
    const i = getIndex(id)

    if (i >= 0) {
      const orders = [...list]
      orders.splice(i, 1)
      setList(orders)
    }
  }

  const updateItem = (id: number, data: iOrder) => {
    const i = getIndex(id)

    if (i >= 0) {
      const orders = [...list]
      orders.splice(i, 1, data)
      setList(orders)
    }
  }

  const getItem = (id: number): iOrder | undefined => {
    const i = getIndex(id);
    if (i >= 0) {
      return list[i]
    }
    return undefined
  }
  return {
    items: list,
    isLoading: isLoading,
    getLength: getLength,
    getIndex: getIndex,
    removeItem: removeItem,
    updateItem: updateItem,
    getItem: getItem,
    addNewItem: (p: iOrder) => {
      if(!getItem(0)) {
        setList(o => ([p, ...o]))
      }
    },
  }
}