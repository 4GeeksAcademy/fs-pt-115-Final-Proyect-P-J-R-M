import { useEffect, useRef, useState } from 'react'
import 'emoji-picker-element/picker'

export default function Emojis() {
    const pickerRef = useRef(null)
    const [showPicker, setShowPicker] = useState(false)
    useEffect(() => {
        if (!showPicker || !pickerRef.current) return
        const picker = pickerRef.current
        const handleEmojiClick = (event) => {
            console.log(event.detail.unicode)
            setShowPicker(false)
        }
        picker.addEventListener('emoji-click', handleEmojiClick)
        return () => {
            picker.removeEventListener('emoji-click', handleEmojiClick)
        }
    }, [showPicker])
    return (
        <div>
            <div style={{ marginTop: '10px' }}>
                <button onClick={() => setShowPicker(prev => !prev)}>emoji mamahuevo</button>
            </div>
            {showPicker && (
                <div style={{ position: 'absolute', zIndex: 999, marginTop: '5px' }}>
                    <emoji-picker ref={pickerRef} locale="es"></emoji-picker>
                </div>
            )}
        </div>
    )
}