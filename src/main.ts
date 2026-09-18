import './style.css';
import { Input } from './core/Input';
import { TitleScene } from './scenes/TitleScene';
import { RegionSelectScene } from './scenes/RegionSelectScene';
import { PlayScene } from './scenes/PlayScene';

type Mode = 'title' | 'select' | 'play';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

const input = new Input(canvas);

let mode: Mode = 'title';
let title = new TitleScene();
let select = new RegionSelectScene();
let play: PlayScene | null = null;
let lastRegion = 1;

let last = performance.now();
const MAX_DT = 1 / 20;

function frame(now: number) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > MAX_DT) dt = MAX_DT;

  if (mode === 'title') {
    const r = title.update(dt, input);
    title.draw(ctx);
    if (r === 'start') {
      mode = 'select';
      select = new RegionSelectScene();
    }
  } else if (mode === 'select') {
    const r = select.update(dt, input);
    select.draw(ctx);
    if (r?.action === 'back') {
      mode = 'title';
      title = new TitleScene();
    } else if (r?.action === 'play') {
      lastRegion = r.regionId;
      play = new PlayScene(r.regionId);
      mode = 'play';
    }
  } else if (mode === 'play' && play) {
    const result = play.update(dt, input);
    play.draw(ctx);
    if (result === 'quit') {
      mode = 'select';
      play = null;
    } else if (result === 'dead') {
      play = new PlayScene(lastRegion);
    } else if (result === 'complete') {
      mode = 'select';
      play = null;
    }
  }

  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
