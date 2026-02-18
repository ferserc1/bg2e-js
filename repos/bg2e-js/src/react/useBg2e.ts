import { useEffect, useMemo, useRef, useState } from "react";

import Canvas from "../app/Canvas";
import MainLoop from "../app/MainLoop";
import type AppController from "../app/AppController";
import Renderer from "../render/Renderer";

const mainLoopByCanvas = new WeakMap<HTMLCanvasElement, MainLoop>();

function resolveCanvas(canvas: string | HTMLCanvasElement): HTMLCanvasElement | null {
    if (typeof canvas === "string") {
        return document.querySelector(canvas);
    } else {
        return canvas;
    }
}

type RendererConstructor<T extends Renderer> = new () => T;
type AppControllerConstructor<T extends AppController> = new () => T;

export default function useBg2e<R extends Renderer, A extends AppController>(
    target: string | HTMLCanvasElement,
    RendererType: RendererConstructor<R>,
    AppControllerType: AppControllerConstructor<A>
) {
    const canvas = useMemo(() => {
        if (typeof document === "undefined") return null; // SSR guard
        return resolveCanvas(target);
    }, [target]);
    const mainLoopRef = useRef<MainLoop | null>(null);
    const createdRef = useRef(false);

    const [, forceUpdate] = useState(0);

    useEffect(() => {
        createdRef.current = false;

        if (!canvas) {
            mainLoopRef.current = null;
            forceUpdate((x) => x + 1);
            return;
        }

        const existing = mainLoopByCanvas.get(canvas);
        if (existing) {
            mainLoopRef.current = existing;
            forceUpdate((x) => x + 1);
            return;
        }

        const renderer = new RendererType();
        const appController = new AppControllerType();

        const bg2Canvas = new Canvas(canvas, renderer);
        const mainLoop = new MainLoop(bg2Canvas, appController);
        
        mainLoop.run();  // Background execution

        mainLoopByCanvas.set(canvas, mainLoop);
        mainLoopRef.current = mainLoop;
        createdRef.current = true;

        forceUpdate((x) => x + 1);
    }, [canvas, RendererType, AppControllerType]);

    return {
        mainLoop: mainLoopRef.current,
        canvas
    }
}
