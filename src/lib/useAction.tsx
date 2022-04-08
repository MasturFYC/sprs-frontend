import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iAction } from "./interfaces";

export function useActionList(orderId: number) {
  const [list, setList] = useState<iAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isLoaded = true;
    async function load() {
      const headers = {
        'Content-Type': 'application/json'
      };

      let res = await axios
        .get(`/action/order/${orderId}`, { headers: headers })
        .then(response => response.data)
        .catch(error => console.log(error))
        .then(data => data)

        return res ?  res : [];
    }

    //if (isLoaded) {
      setIsLoading(true)
      load().then(data => {
        if ( isLoaded ) {
          setList(data)
          setIsLoading(false)
        } 
      });
    //}

    return () => { isLoaded = false; };
  }, [orderId]);

  return {
    items: list,
    count: () => list.length,
    isLoading: isLoading,
    getItem: (id: number) => list.filter(f => f.id === id)[0],
    insert: (e: iAction) => {
      const arr = [...list]
      arr.unshift(e);
      setList(arr)
    },
    update: (id: number, e: iAction) => {
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
  };

}
