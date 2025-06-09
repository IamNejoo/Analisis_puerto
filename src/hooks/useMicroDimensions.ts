import { useState, useEffect } from "react";

export interface MicroDimensions {
    containerWidth: number;
    containerHeight: number;
    containerMargin: number;
    labelFontSize: number;
    blockStartX: number;
    blockStartY: number;
}

interface Config {
    numCols: number;
    numRows: number;
    targetVisibleCols: number;
    blockAspectRatio: number;
    marginToWidthRatio: number;
    paddingFactor: number;
}

export function useMicroDimensions(
    containerRef: React.RefObject<HTMLDivElement>,
    config: Config
): MicroDimensions {
    const [dims, setDims] = useState<MicroDimensions>({
        containerWidth: 60,
        containerHeight: 30,
        containerMargin: 3,
        labelFontSize: 10,
        blockStartX: 5,
        blockStartY: 5,
    });

    useEffect(() => {
        function calculaDimensiones() {
            const daVisibleWidth = containerRef.current?.clientWidth || 0;
            if (daVisibleWidth <= 0) {
                setDims({
                    containerWidth: 60,
                    containerHeight: 30,
                    containerMargin: 3,
                    labelFontSize: 10,
                    blockStartX: 5,
                    blockStartY: 5,
                });
                return;
            }
            const padding = daVisibleWidth * config.paddingFactor;
            const blockStartX = Math.max(5, padding);
            const blockStartY = Math.max(5, padding);

            const drawableVisibleWidth = daVisibleWidth - blockStartX * 2;
            let ch_from_width;
            const denom =
                config.blockAspectRatio *
                (config.targetVisibleCols +
                    (config.targetVisibleCols - 1) * config.marginToWidthRatio);
            if (denom > 0 && config.targetVisibleCols > 0) {
                ch_from_width = drawableVisibleWidth / denom;
            } else if (config.targetVisibleCols > 0) {
                ch_from_width =
                    drawableVisibleWidth / (config.blockAspectRatio * config.targetVisibleCols);
            } else {
                ch_from_width = 30;
            }

            let containerHeight = Math.max(10, ch_from_width);
            let containerWidth = containerHeight * config.blockAspectRatio;
            let containerMargin = containerWidth * config.marginToWidthRatio;
            if (config.marginToWidthRatio > 0 && containerMargin < 1) {
                containerMargin = 1;
            }
            if (containerMargin > containerWidth / 2 && containerWidth > 4) {
                containerMargin = Math.max(1, containerWidth / 3);
            }

            let labelFontSize = Math.max(6, Math.floor(containerHeight * 0.42));
            if (containerWidth < 30) {
                labelFontSize = Math.max(5, Math.floor(containerHeight * 0.38));
            }
            containerWidth = Math.max(10, containerWidth);
            containerMargin = Math.max(0, containerMargin);

            setDims({
                containerWidth,
                containerHeight,
                containerMargin,
                labelFontSize,
                blockStartX,
                blockStartY,
            });
        }

        calculaDimensiones();
        window.addEventListener("resize", calculaDimensiones);
        return () => window.removeEventListener("resize", calculaDimensiones);
        // eslint-disable-next-line
    }, [containerRef, config]);

    return dims;
}
