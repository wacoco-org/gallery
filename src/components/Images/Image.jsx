export default function Image({ src, alt, className, onClick }) {
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={className}
            onClick={onClick}
        />
    );
}
