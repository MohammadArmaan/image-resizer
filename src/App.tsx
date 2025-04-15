import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Download, Image as ImageIcon } from "lucide-react";
import ImageUploader from "./ImageUploader";

type PresetSize = {
    name: string;
    width: number;
    height: number;
};

function App() {
    const [image, setImage] = useState<string | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [originalWidth, setOriginalWidth] = useState<number>(0);
    const [originalHeight, setOriginalHeight] = useState<number>(0);
    const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(0);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [quality, setQuality] = useState<number>(90);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const presetSizes: PresetSize[] = [
        { name: "Original", width: originalWidth, height: originalHeight },
        { name: "HD", width: 1920, height: 1080 },
        { name: "Full HD", width: 1280, height: 720 },
        { name: "Social Media", width: 1200, height: 630 },
        { name: "Instagram Square", width: 1080, height: 1080 },
        { name: "Thumbnail", width: 400, height: 300 },
    ];

    useEffect(() => {
        if (maintainAspectRatio) {
            if (width > 0 && originalAspectRatio > 0) {
                setHeight(Math.round(width / originalAspectRatio));
            }
        }
    }, [maintainAspectRatio, width, originalAspectRatio]);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalWidth(img.width);
                    setOriginalHeight(img.height);
                    setWidth(img.width);
                    setHeight(img.height);
                    setOriginalAspectRatio(img.width / img.height);
                    setImage(event.target?.result as string);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePresetChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedSize = presetSizes.find(
            (size) => size.name === e.target.value
        );
        if (selectedSize) {
            if (selectedSize.name === "Original") {
                setWidth(originalWidth);
                setHeight(originalHeight);
            } else {
                if (maintainAspectRatio) {
                    // Adjust width and height while maintaining aspect ratio
                    const targetAspectRatio =
                        selectedSize.width / selectedSize.height;

                    if (targetAspectRatio > originalAspectRatio) {
                        // Height is the limiting factor
                        const adjustedWidth = Math.round(
                            selectedSize.height * originalAspectRatio
                        );
                        setHeight(selectedSize.height);
                        setWidth(adjustedWidth);
                    } else {
                        // Width is the limiting factor
                        const adjustedHeight = Math.round(
                            selectedSize.width / originalAspectRatio
                        );
                        setWidth(selectedSize.width);
                        setHeight(adjustedHeight);
                    }
                } else {
                    // Directly set width and height from preset
                    setWidth(selectedSize.width);
                    setHeight(selectedSize.height);
                }
            }
        }
    };

    const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newWidth = parseInt(e.target.value);
        if (!isNaN(newWidth) && newWidth > 0) {
            if (maintainAspectRatio) {
                const newHeight = Math.round(newWidth / originalAspectRatio);
                setHeight(newHeight);
            }
            setWidth(newWidth);
        }
    };

    const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newHeight = parseInt(e.target.value);
        if (!isNaN(newHeight) && newHeight > 0) {
            if (maintainAspectRatio) {
                const newWidth = Math.round(newHeight * originalAspectRatio);
                setWidth(newWidth);
            }
            setHeight(newHeight);
        }
    };

    const handleQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuality(parseInt(e.target.value));
    };

    const handleDownload = () => {
        if (!canvasRef.current || !image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        const img = new Image();
        img.onload = () => {
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // Draw the image with the specified dimensions
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to data URL with specified quality
            const link = document.createElement("a");
            link.download = "resized-image.jpg";
            link.href = canvas.toDataURL("image/jpeg", quality / 100);
            link.click();
        };
        img.src = image;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Image Resizer
                        </h1>
                        <p className="text-gray-600">
                            Upload, resize, compress, and maintain aspect ratio
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Upload Section */}
                        <div className="flex justify-center">
                            {/* <label className="w-full max-w-xs flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100">
                                <Upload className="h-12 w-12 text-gray-400" />
                                <span className="mt-2 text-base text-gray-600">
                                    Upload image
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label> */}
                            <ImageUploader handleImageUpload={handleImageUpload} />
                        </div>

                        {/* Preview and Controls */}
                        {image && (
                            <div className="space-y-6">
                                <div className="flex justify-center">
                                    <div className="relative max-w-md">
                                        <img
                                            src={image}
                                            alt="Preview"
                                            className="max-w-full h-auto rounded-lg shadow-md"
                                            style={{ maxHeight: "400px" }}
                                        />
                                    </div>
                                </div>

                                {/* Preset Sizes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preset Sizes
                                    </label>
                                    <select
                                        onChange={handlePresetChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Select a preset size
                                        </option>
                                        {presetSizes.map((size) => (
                                            <option
                                                key={size.name}
                                                value={size.name}
                                            >
                                                {size.name} ({size.width}x
                                                {size.height})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Custom Dimensions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Width (px)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={width}
                                            onChange={handleWidthChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Height (px)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={height}
                                            onChange={handleHeightChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <label className="text-sm flex items-center gap-3 mt-5">
                                    <input
                                        type="checkbox"
                                        checked={maintainAspectRatio}
                                        onChange={() =>
                                            setMaintainAspectRatio(
                                                (prev) => !prev
                                            )
                                        }
                                    />
                                    Maintain Aspect Ratio
                                </label>

                                {/* Quality Control */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image Quality: {quality}%
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={quality}
                                        onChange={handleQualityChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Lower quality = smaller file size
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleDownload}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Download className="h-5 w-5 mr-2" />
                                        Download Resized Image
                                    </button>
                                </div>
                            </div>
                        )}

                        {!image && (
                            <div className="text-center py-12">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    No image uploaded yet
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
}

export default App;
