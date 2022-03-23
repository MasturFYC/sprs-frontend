import { View } from '@adobe/react-spectrum';
import React, { FormEvent, useState } from 'react'
import axios from './axios-base';

type SimpleReactFileUploadProps = {
  fileName?: string
  imageId: number
  onSuccess: (fileName: string) => void
}
const SimpleReactFileUpload: React.FC<SimpleReactFileUploadProps> = ({ imageId, onSuccess, fileName }) => {

  const [file, setFile] = useState<File | null | undefined>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [imgFile, setImgFile] = React.useState<string | undefined | null>(null)

  function selectFile() {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }

  function onFormSubmit(e: FormEvent) {
    e.preventDefault() // Stop form submit
    if (file) {
      fileUpload(file).then(res => {
        onSuccess(res.message)
        setFile(null)
      })
    }
  }

  async function fileUpload(file: File) {
    const url = `/actions/upload-file/${imageId}/`;
    const formData = new FormData();
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    const res = await axios.post(url, formData, config)
      .then((response) => response.data)
      .then(data => data)
      .catch(error => console.log(error))

    return res;
  }

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      if (fileName) {
        setImgFile(fileName)
      }
    }

    return () => { isLoaded = true }
  }, [fileName])

  return (
    <View>
      <View>
        {imgFile &&
          <a href={`/api/actions/file/${imgFile}`}>
            <img width={96} alt="Document" src={`/api/actions/file/${imgFile}`} />
          </a>
        }
      </View>
      <form onSubmit={onFormSubmit}>
        <View marginTop={'size-100'}>
          <input type="file" style={{ display: 'none' }} multiple={false} onChange={(e) => {
            if (e.target.files) {
              const file = e.target.files[0];
              setFile(file)
            }
          }}
            ref={fileRef} />

          <button type="button" onClick={() => selectFile()}>Pilih file</button>{' '}
          <button type="submit" style={{ display: file ? 'inline' : 'none', marginLeft: '6px' }}>Upload</button>
        </View>
      </form >
    </View>
  )

}



export default SimpleReactFileUpload