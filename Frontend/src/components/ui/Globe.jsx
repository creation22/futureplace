import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function Globe({ className }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 1],
            glowColor: [1, 1, 1],
            markers: [
                // longitude latitude
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.006], size: 0.1 },
            ],
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.01;
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <div
            className={`relative flex max-w-full items-center justify-center overflow-hidden pb-40 pt-8 md:pb-60 ${className}`}
        >
            <div className="absolute top-0 w-full h-full bg-gradient-to-b from-transparent to-black pointer-events-none z-10" />
            <canvas
                ref={canvasRef}
                style={{
                    width: 600,
                    height: 600,
                    maxWidth: "100%",
                    aspectRatio: 1,
                }}
                className="size-full opacity-100 transition-opacity duration-500 [contain:layout_paint_size]"
            />
        </div>
    );
}
