import { DitheringShader } from "@/components/ui/dithering-shader";

export default function Wave({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen w-full">
            {/* Full screen background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden z-0 wave-background">
                <DitheringShader
                    width={2000}
                    height={2000}
                    shape="wave"
                    type="8x8"
                    colorBack="#B07949"
                    colorFront="#96474D"
                    pxSize={1}
                    speed={0.6}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100vw',
                        height: '100vh',
                        minWidth: '100vw',
                        minHeight: '100vh'
                    }}
                />
            </div>

            {/* Content layer */}
            <div className="relative z-10 min-h-screen w-full">
                {children}
            </div>
        </div>
    )
}