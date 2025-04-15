import { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ImageUploader({ handleImageUpload }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      if (inputRef.current) {
        inputRef.current.files = dataTransfer.files;

        const syntheticEvent = {
          target: inputRef.current,
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        handleImageUpload(syntheticEvent);
      }
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className="flex justify-center"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={triggerFileInput} // move click trigger here
    >
      <div
        className={`w-full max-w-xs flex flex-col items-center px-4 py-6 rounded-lg border-2 border-dashed cursor-pointer transition
        ${dragActive ? "bg-blue-100 border-blue-400" : "bg-gray-50 border-gray-300 hover:bg-gray-100"}`}
      >
        <Upload className="h-12 w-12 text-gray-400" />
        <span className="mt-2 text-base text-gray-600">
          Drag & drop or click to upload
        </span>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
}

export default ImageUploader;
