import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import {formatBytes} from "../lib/utils";
// import { bytesToString } from "pdfjs-dist/types/src/shared/util";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

function FileUploader({onFileSelect} : FileUploaderProps) {
  // const [file, setFile] = useState();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    const file = acceptedFiles[0] || null;

    onFileSelect?.(file);
  }, [onFileSelect]);

  const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({
    onDrop,
    multiple: false,
    accept: {'application/pdf': ['.pdf']},
    maxSize: MAX_FILE_SIZE,
  });

  const file = acceptedFiles[0] || null;

  return (
    <div className='w-full gradient-border'>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">

          {file ? (
            <div className="uploader-selected-file" onClick={event => event?.stopPropagation()}>
              <img
                src="/images/pdf.png"
                alt="pdf"
                className="size-10"
              />
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-rm font-medium text-gray-700 truncate max-w-xs">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <button className="p2 cursor-pointer" onClick={e => onFileSelect?.(null)}>
                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                <img src="/icons/info.svg" alt="upload" className="size-20" />
              </div>

              <p className="text-lg text-gray-500">
                <span className="font-semibold">
                  Click to upload
                </span>
                or drag-and-drop
              </p>
              <p className="text-lg text-gray-500">PDF (max {formatBytes(MAX_FILE_SIZE)})</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileUploader
