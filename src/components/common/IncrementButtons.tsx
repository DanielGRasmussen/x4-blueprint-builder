import React from "react";
import "./IncrementButtons.css";

interface IncrementButtonsProps {
	x: number;
	y: number;
	z: number;
	onUpdateX: (value: number) => void;
	onUpdateY: (value: number) => void;
	onUpdateZ: (value: number) => void;
}

const IncrementButtons: React.FC<IncrementButtonsProps> = ({
	x,
	y,
	z,
	onUpdateX,
	onUpdateY,
	onUpdateZ
}) => {
	return (
		<div className="increment-buttons">
			<button type="button" onClick={() => onUpdateX(x + 100)}>
				+100 X
			</button>
			<button type="button" onClick={() => onUpdateX(x - 100)}>
				-100 X
			</button>
			<button type="button" onClick={() => onUpdateY(y + 100)}>
				+100 Y
			</button>
			<button type="button" onClick={() => onUpdateY(y - 100)}>
				-100 Y
			</button>
			<button type="button" onClick={() => onUpdateZ(z + 100)}>
				+100 Z
			</button>
			<button type="button" onClick={() => onUpdateZ(z - 100)}>
				-100 Z
			</button>
		</div>
	);
};

export default IncrementButtons;