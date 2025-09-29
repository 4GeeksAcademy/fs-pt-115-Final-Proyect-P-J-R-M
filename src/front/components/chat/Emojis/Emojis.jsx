import { useEffect, useRef, useState } from 'react'
import 'emoji-picker-element/picker'
import { SmilePlus } from 'lucide-react'

export default function Emojis({ getEmojis }) {
	const pickerRef = useRef(null)
	const btnRef = useRef(null)
	const [showPicker, setShowPicker] = useState(false)

	useEffect(() => {
		if (!showPicker || !pickerRef.current) return
		const picker = pickerRef.current

		const handleEmojiClick = (event) => {
			getEmojis(event.detail.unicode)
		}

		picker.addEventListener('emoji-click', handleEmojiClick)
		return () => {
			picker.removeEventListener('emoji-click', handleEmojiClick)
		}
	}, [showPicker, getEmojis])
	
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(e.target) &&
				btnRef.current &&
				!btnRef.current.contains(e.target)
			) {
				setShowPicker(false)
			}
		}

		if (showPicker) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showPicker])

	return (
		<div>
			<div>
				<span
					ref={btnRef}
					className='emoji-btn'
					onClick={() => setShowPicker(prev => !prev)}
				>
					<SmilePlus size={35} color="#d4af37" strokeWidth={2} />
				</span>
			</div>
			{showPicker && (
				<div style={{ position: 'absolute', bottom: 120, left: 400, zIndex: 999, marginTop: '5px' }}>
					<emoji-picker ref={pickerRef} locale="es"></emoji-picker>
				</div>
			)}
		</div>
	)
}
