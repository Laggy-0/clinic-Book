import { useEffect, useRef, useState } from 'react';

export default function ScrollAnimation({
    children,
    className = '',
    variant = 'fade-up',
    delay = 0,
    style
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry) return;
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const variants = {
        'fade-up': 'translate-y-10',
        'fade-down': '-translate-y-10',
        'fade-left': 'translate-x-10',
        'fade-right': '-translate-x-10',
        'zoom-in': 'scale-95'
    };

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible
                ? 'opacity-100 transform-none'
                : `opacity-0 ${variants[variant]}`
            } ${className}`}
            style={{ transitionDelay: `${delay}ms`, ...style }}
        >
            {children}
        </div>
    );
}
