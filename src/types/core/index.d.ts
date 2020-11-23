import './types';
import { publicMethods, eventNames } from './const';
import { optionsTypes, RoiOptions } from './options';
export { publicMethods, eventNames, optionsTypes };
interface PointSwitch {
    (point: Point, useSize?: boolean): Point;
}
declare type ElementOrSelector = HTMLElement | string;
interface BaseRoi {
    readonly $el: HTMLElement;
    readonly $opts: RoiOptions;
    readonly $cvs?: HTMLCanvasElement;
    readonly $ctx?: CanvasRenderingContext2D;
    readonly $size?: Size;
    readonly $cvsSize?: Size;
    mount(elementOrSelector?: ElementOrSelector): void;
    resetOptions(options: RoiOptions): void;
    resetCanvas(): void;
    scale: PointSwitch;
    invert: PointSwitch;
    setValue(value: Array<RoiPath>): void;
    clearCanvas(): void;
    redrawCanvas(isClear: boolean): void;
    exportImageFromCanvas(callback: (url: string) => void): void;
    customDrawing(callback: (this: this) => void): void;
    choosePath(index: number): void;
    destroy(): void;
}
export default class CanvasRoi implements BaseRoi {
    private isEventsListening;
    private drawing;
    private needDrag;
    private dragging;
    private modifying;
    private operateCursor;
    private lastMoveEvent;
    private newPath;
    private value;
    private paths;
    private curSingleType;
    private pathPointsCoincide;
    private hasInvertPath;
    private choseIndex;
    private resizeTicker;
    private _events;
    private _ElObserver;
    private _keyPress;
    private _cvsMouseUp;
    private _cvsMouseDown;
    private _cvsMouseMove;
    private _cvsMouseClick;
    private _checkMouseCanOperate;
    private _setCtxStyles;
    private _createCvsPath;
    private _drawExistRoiPath;
    private _drawRoiPaths;
    private _drawRoiPathsWithOpe;
    $el: HTMLElement;
    $opts: RoiOptions;
    $cvs?: HTMLCanvasElement;
    $ctx?: CanvasRenderingContext2D;
    $size?: Size;
    $cvsSize?: Size;
    constructor(elementOrSelector?: ElementOrSelector, options?: RoiOptions);
    _initInstanceVars(): void;
    _init(): void;
    _initObserver(): void;
    _sizeChangeWatcher(): void;
    _autoFitChange(newValue: boolean): void;
    _mergeOptions(options: RoiOptions): void;
    _emitEvent(name: ROIEvents, ...args: any[]): void;
    /**
     * check methods
     */
    _checkSingleType(): void;
    _isPathMax(): boolean;
    _isSingleTypeAllow(isDrag: boolean): boolean;
    _floatToFixed(value: number): number;
    _emitValue(changeType?: string, index?: number): void;
    _completePathsInfo(values: RoiPath[]): void;
    _switchCoordsScale(values: RoiPath[], toPx?: boolean): RoiPath[];
    _addEventHandler(readonly?: boolean): void;
    _removeEventHandler(forceAll?: boolean): void;
    _resetNewPath(): void;
    _createNewPath(startPoint: Point, type?: PathTypes, needDrag?: boolean): void;
    _addNewPath(): void;
    _resetChooseState(): void;
    _deletePath(): void;
    _invertChosePath(): void;
    mount(elementOrSelector: ElementOrSelector): void;
    resetOptions(options: RoiOptions): void;
    resetCanvas(): void;
    scale(coords: Point, useSize?: boolean): {
        x: number;
        y: number;
    };
    invert(scaleCoords: Point, useSize?: boolean): {
        x: number;
        y: number;
    };
    setValue(value: RoiPath[]): void;
    choosePath(index: number): void;
    clearCanvas(): void;
    redrawCanvas(isClear?: boolean): void;
    exportImageFromCanvas(resolve: (url: string) => any): void;
    customDrawing(fn: (...args: any[]) => any): void;
    destroy(): void;
}
