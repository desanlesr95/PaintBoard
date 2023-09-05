import { fromEvent, merge } from "rxjs";
import { map, mergeAll , takeUntil} from "rxjs/operators";

const canvas = document.getElementById("reactive-canvas");
const restartButton = document.getElementById("restart-button");

const cursorPosition = { x: 0, y: 0 };

const updateCursorPosition = (event) => {
  cursorPosition.x = event.clientX - canvas.offsetLeft;
  cursorPosition.y = event.clientY - canvas.offsetTop;
};

const onMouseDown$ = fromEvent(canvas, "mousedown");
let mouseDownSubcriptionCursorPostion = onMouseDown$.subscribe(updateCursorPosition);
const onMouseUp$ = fromEvent(canvas, "mouseup");
const onMouseMove$ = fromEvent(canvas, "mousemove").pipe(
  takeUntil(onMouseUp$)
);


let mouseDownSubcription = onMouseDown$.subscribe();

const canvasContext = canvas.getContext("2d");
canvasContext.lineWidth = 8;
canvasContext.lineJoin ="round";
canvasContext.lineCap = "round";
canvasContext.strokeStyle = "white";


const paintStroke = (event) => {
  canvasContext.beginPath();
  canvasContext.moveTo(cursorPosition.x, cursorPosition.y);
  updateCursorPosition(event);
  canvasContext.lineTo(cursorPosition.x, cursorPosition.y);
  canvasContext.stroke();
  canvasContext.closePath();
};


const startPaint$ = onMouseDown$.pipe(
  map(() => onMouseMove$),
  mergeAll()
);

let startPaintSubscription = startPaint$.subscribe(paintStroke);


const onLoadWindow$ = fromEvent(window, "load");;
const onRestartClick$ = fromEvent(restartButton,"click");


const restartBoard$ = merge(onLoadWindow$,onRestartClick$);

restartBoard$.subscribe(
  () => {
    canvasContext.clearRect(0,0, canvas.width,canvas.height);
    startPaintSubscription.unsubscribe();
    mouseDownSubcription.unsubscribe();
    mouseDownSubcriptionCursorPostion.unsubscribe();
    startPaintSubscription = startPaint$.subscribe(paintStroke);
    mouseDownSubcriptionCursorPostion = onMouseDown$.subscribe(updateCursorPosition);
    mouseDownSubcription = onMouseDown$.subscribe();
  }
)
