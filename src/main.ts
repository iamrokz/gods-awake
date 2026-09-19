import './style.css';
import { Input } from './core/Input';
import { TitleMenu, RegionSelectMenu } from './ui/Menus';
import { PlayScene } from './scenes/PlayScene';

type Mode = 'title' | 'select' | 'play';

const app = document.getElementById('app')!;
const canvas = document.getElementById('game') as HTMLCanvasElement;
const overlay = document.getElementById('overlay')!;

const input = new Input(app);

let mode: Mode = 'title';
let title = new TitleMenu(overlay);
let select = new RegionSelectMenu(overlay);
select.show(false);
let play: PlayScene | null = null;
let lastRegion = 1;

let last = performance.now();
const MAX_DT = 1 / 20;

function clearPlay() {
  if (play) {
    play.dispose();
    play = null;
  }
}

function frame(now: number) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > MAX_DT) dt = MAX_DT;

  if (mode === 'title') {
    title.show(true);
    select.show(false);
    const r = title.update(input);
    if (r === 'start') {
      mode = 'select';
      title.show(false);
      select.show(true);
    }
  } else if (mode === 'select') {
    title.show(false);
    select.show(true);
    const r = select.update(input);
    if (r?.action === 'back') {
      mode = 'title';
      select.show(false);
      title.show(true);
    } else if (r?.action === 'play') {
      lastRegion = r.regionId;
      clearPlay();
      select.show(false);
      play = new PlayScene(r.regionId, canvas, overlay);
      mode = 'play';
    }
  } else if (mode === 'play' && play) {
    title.show(false);
    select.show(false);
    const result = play.update(dt, input);
    play.render();
    if (result === 'quit') {
      clearPlay();
      mode = 'select';
      select.show(true);
    } else if (result === 'dead') {
      clearPlay();
      play = new PlayScene(lastRegion, canvas, overlay);
    } else if (result === 'complete') {
      clearPlay();
      mode = 'select';
      select.show(true);
    }
  }

  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
