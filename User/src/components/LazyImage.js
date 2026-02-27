import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, className, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          {!isLoaded && !hasError && (
            <div className="animate-pulse bg-gray-200 rounded-lg" style={{ aspectRatio: '1/1' }}>
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="bg-gray-200 rounded-lg flex items-center justify-center" style={{ aspectRatio: '1/1' }}>
              <span className="text-gray-500 text-sm">Failed to load</span>
            </div>
          )}
          
          <img
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        </>
      )}
    </div>
  );
};

export default LazyImage;
