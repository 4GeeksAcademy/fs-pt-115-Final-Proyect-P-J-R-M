import React from 'react';

export const VideoPerrete = ({  width = "100%", height = "auto" }) => {
  const videoUrl = "https://res.cloudinary.com/ddmzvbbef/video/upload/v1758069404/perro_hand_to_hand_wnulbn.mp4";

  return (
    <video
      src={videoUrl}
      loop
      autoPlay
      muted
      playsInline
      width={width}
      height={height}
      style={{ display: 'block' }}
    >
      Tu navegador no soporta la reproducción de video.
    </video>
  );
};
