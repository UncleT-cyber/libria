export default function CanvasView({ src, className }: { src: string; className?: string }) {
  return (
    <video
      src={src}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      onTimeUpdate={(event) => {
        if (event.currentTarget.currentTime >= 8) event.currentTarget.currentTime = 0;
      }}
    />
  );
}
