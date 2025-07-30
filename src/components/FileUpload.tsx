import React, { useRef } from "react";
import "./FileUpload.css";

interface FileUploadProps {
	onFileUpload: (content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				onFileUpload(content);
			};
			reader.readAsText(file);
		}
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		if (file && file.name.endsWith(".xml")) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				onFileUpload(content);
			};
			reader.readAsText(file);
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	return (
		<div className="file-upload">
			<div 
				className="drop-zone"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onClick={() => fileInputRef.current?.click()}
			>
				<svg className="upload-icon" viewBox="0 0 24 24" width="48" height="48">
					<path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor"/>
				</svg>
				<p>Drop your X4 blueprint XML file here</p>
				<p className="sub-text">or click to browse</p>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept=".xml"
				onChange={handleFileChange}
				style={{ display: "none" }}
			/>
		</div>
	);
};

export default FileUpload;