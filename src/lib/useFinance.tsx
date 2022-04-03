import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import {iFinance } from "./interfaces";

export function useFinanceList() {
  const [list, setList] = useState<iFinance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isLoaded = false;
    async function load() {
      const headers = {
        'Content-Type': 'application/json'
      };

      await axios
        .get("/finances/", { headers: headers })
        .then(response => response.data)
        .catch(error => console.log(error))
        .then(data => {
          setList(data ? data : [])
          setIsLoading(false)
        });
    }

    if (!isLoaded) {
      setIsLoading(true)
      load();
    }

    return () => { isLoaded = true; };
  }, []);

  return {
    items: list,
    count: () => list.length,
    isLoading: isLoading,
    getItem: (id: number) => list.filter(f => f.id === id)[0],
    insert: (e: iFinance) => {
      const arr = [...list]
      arr.unshift(e);
      setList(arr)
    },
    update: (id: number, e: iFinance) => {
      let i = -1;
      for(let c=0; c<list.length; c++ ) {
        if(list[c].id === id) {
          i = c;
          break;
        }
      }

      if(i >= 0) {
        const arr = [...list];
        arr.splice(i,1,e)
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
