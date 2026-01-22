import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const GEOJSON_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

export function WorldMap({ validCities, cityData }) {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const markersLayer = useRef(null);
    const [ready, setReady] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (mapInstance.current || !mapContainer.current) return;

        const map = L.map(mapContainer.current, {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 18,
            zoomControl: true,
            attributionControl: false,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            dragging: true,
            worldCopyJump: true,
            maxBounds: [[-90, -180], [90, 180]],
            maxBoundsViscosity: 1.0
        });

        // Realistic Satellite Imagery ("Actual Color")
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19,
            noWrap: false
        }).addTo(map);

        // Bold Labels
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        // Create markers layer group
        markersLayer.current = L.layerGroup().addTo(map);

        mapInstance.current = map;
        setReady(true);

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    // Update city markers when validCities changes
    useEffect(() => {
        if (!mapInstance.current || !markersLayer.current || !cityData) return;

        // Clear previous markers
        markersLayer.current.clearLayers();

        // Add markers for valid cities
        validCities.forEach(cityId => {
            const city = cityData[cityId];
            if (!city || !city.lat || !city.lng) return;

            // Neo-Brutalism Markers: Squares or Bold Circles with thick borders
            const marker = L.circleMarker([city.lat, city.lng], {
                radius: 8,
                fillColor: '#84cc16', // lime-500
                color: '#000000',     // black border
                weight: 3,            // thick border
                opacity: 1,
                fillOpacity: 1
            });

            marker.bindTooltip(`${city.name}`, {
                permanent: false,
                direction: "top",
                className: "bg-yellow-300 text-black border-2 border-black font-mono font-bold text-xs px-2 py-1 shadow-[4px_4px_0px_0px_#000]"
            });

            markersLayer.current.addLayer(marker);
        });

        // Auto-zoom to valid cities if narrowed down
        if (validCities.length > 0 && validCities.length < 100) {
            const validCoords = validCities
                .map(id => cityData[id])
                .filter(c => c && c.lat && c.lng)
                .map(c => [c.lat, c.lng]);

            if (validCoords.length > 0) {
                const bounds = L.latLngBounds(validCoords);
                mapInstance.current.flyToBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 8,
                    duration: 1.5
                });
            }
        } else if (validCities.length >= 100) {
            // Reset to world view
            mapInstance.current.flyTo([20, 0], 2, { duration: 1 });
        }

    }, [validCities, cityData, ready]);

    return (
        <div ref={mapContainer} className="w-full h-full min-h-[500px] z-0 outline-none" />
    );
}
