/**
 * Holographic Loader Component
 * A futuristic, sci-fi style loader with holographic effects
 */

import React from 'react';


interface HolographicLoaderProps {
    className?: string;
}

export function HolographicLoader({ className }: HolographicLoaderProps) {
    return (
        <div className={`holographic-loader-wrapper ${className || ''}`}>
            <div className="nebula"></div>
            <div className="grid-plane"></div>
            <div className="stars-container">
                <div className="star-layer"></div>
                <div className="star-layer"></div>
                <div className="star-layer"></div>
            </div>

            <div className="loader-container">
                <div className="hologram-platform"></div>
                <div className="platform-rings">
                    <div className="platform-ring"></div>
                    <div className="platform-ring"></div>
                    <div className="platform-ring"></div>
                </div>

                <div className="projection-beams">
                    <div className="beam"></div>
                    <div className="beam"></div>
                    <div className="beam"></div>
                    <div className="beam"></div>
                </div>

                <div className="holo-container">
                    <div className="holo-sphere">
                        <div className="holo-ring"></div>
                        <div className="holo-ring"></div>
                        <div className="holo-ring"></div>
                        <div className="holo-ring"></div>
                        <div className="holo-ring"></div>

                        <div className="holo-particles">
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                            <div className="holo-particle"></div>
                        </div>
                    </div>

                    <div className="glitch-effect"></div>
                    <div className="lightning"></div>
                </div>

                <div className="code-lines">
                    <div className="code-line">
                        01001001 01001110 01001001 01010100 01001001 01000001 01001100 01001001
                        01011010 01001001 01001110 01000111
                    </div>
                    <div className="code-line">
                        function initHolographicMatrix() {`{`} connectNodes(); renderQuantumState(); {`}`}
                    </div>
                    <div className="code-line">
                        01010011 01011001 01010011 01010100 01000101 01001101 00100000 01001100
                        01001111 01000001 01000100 01001001 01001110 01000111
                    </div>
                    <div className="code-line">
                        class QuantumProcessor {`{`} constructor() {`{`} this.entanglement = new Map(); {`}`}{`}`}
                    </div>
                    <div className="code-line">
                        01010010 01000101 01001110 01000100 01000101 01010010 01001001 01001110
                        01000111 00100000 01001000 01001111 01001100 01001111
                    </div>
                    <div className="code-line">
                        const matrix = [1.2, 0.8, 3.1, 2.7, 5.9, 4.3, 7.2, 9.0];
                    </div>
                    <div className="code-line">
                        01010000 01010010 01001111 01000011 01000101 01010011 01010011 01001001
                        01001110 01000111 00100000 01000100 01000001 01010100 01000001
                    </div>
                    <div className="code-line">
                        async function loadHolographicData() {`{`} await fetch(&apos;/api/quantum&apos;); {`}`}
                    </div>
                </div>

                <div className="holo-numbers">
                    <div className="number" style={{ top: '40%', left: '30%', animationDelay: '0.5s' }}>
                        0xFF
                    </div>
                    <div className="number" style={{ top: '50%', left: '60%', animationDelay: '1.5s' }}>
                        0x0A
                    </div>
                    <div className="number" style={{ top: '60%', left: '40%', animationDelay: '2.5s' }}>
                        0xB4
                    </div>
                    <div className="number" style={{ top: '30%', left: '50%', animationDelay: '3.5s' }}>
                        0x3D
                    </div>
                    <div className="number" style={{ top: '70%', left: '20%', animationDelay: '4.5s' }}>
                        0xC2
                    </div>
                    <div className="number" style={{ top: '20%', left: '70%', animationDelay: '5.5s' }}>
                        0x19
                    </div>
                </div>

                <div className="radial-indicators">
                    <div className="radial-indicator"></div>
                    <div className="radial-indicator"></div>
                    <div className="radial-indicator"></div>
                    <div className="radial-indicator"></div>
                </div>

                <div className="corner-decorations">
                    <div className="corner"></div>
                    <div className="corner"></div>
                    <div className="corner"></div>
                    <div className="corner"></div>
                </div>

                <div className="loading-text">SYSTEM INITIALIZATION</div>
                <div className="progress-container">
                    <div className="progress-bar"></div>
                </div>
            </div>
        </div>
    );
}
