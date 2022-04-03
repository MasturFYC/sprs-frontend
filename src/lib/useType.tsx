import { useEffect, useState } from "react";
import axios from 'lib/axios-base';
import {iType } from "./interfaces";

export function useTypeList() {
  const [list, setList] = useState<iType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isLoaded = false;
    async function load() {
      const headers = {
        'Content-Type': 'application/json'
      };

      await axios
        .get("/types", { headers: headers })
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
    append: (e: iType) => list.push(e),
  };

}
