import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import { iAccCode } from "./interfaces";

export function useAccountCodeList(typeId: number): [
  items: iAccCode[],
  isLoading: boolean,
  func: {
    count: () => number;    
    getItem: (id: number) => iAccCode;
    insert: (e: iAccCode) => void;
    update: (id: number, e: iAccCode) => void;
    remove: (id: number) => void;
    reload: () => void;
    search: (e: string) => void;
    getByType: (id: number) => void;
  },
  reload: React.Dispatch<React.SetStateAction<number>>
] {
  const [list, setList] = useState<iAccCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isLoaded = false;
    async function load() {
      const headers = {
        'Content-Type': 'application/json'
      };

      const res = await axios
        .get(`/acc-code/group-type/${typeId}`, { headers: headers })
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
  }, [count, typeId]);

  return [list,
    isLoading,
    {
      count: () => list.length,
      getItem: (id: number) => list.filter(f => f.id === id)[0],
      insert: (e: iAccCode) => {
        const arr = [...list]
        arr.unshift(e);
        setList(arr)
      },
      update: (id: number, e: iAccCode) => {
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
      reload: () => {
        const counter = count + 1;
        setCount(counter);
      },
      search: async (e: string) => {
        setList([])

        const headers = {
          'Content-Type': 'application/json'
        }

        await axios
          .get(`/acc-code/search-name/${e}`, { headers: headers })
          .then(response => response.data)
          .then(data => setList(data))
          .catch(error => console.log(error))

      },

      getByType: async (id: number) => {
        setList([]);
        const headers = {
          'Content-Type': 'application/json'
        }

        await axios
          .get(`/acc-code/group-type/${id}`, { headers: headers })
          .then(response => response.data)
          .then(data => setList(data))
          .catch(error => console.log(error))

      }
    },
    setCount];

}