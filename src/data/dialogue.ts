import type { DialogueTree } from '../core/types';

export const DIALOGUES: Record<string, DialogueTree> = {
  civic_archivist: {
    id: 'civic_archivist',
    lines: [
      { speaker: 'Archivarin', text: 'Du bist wach. Die meisten hier träumen nur noch Vorschriften.' },
      { speaker: 'Archivarin', text: 'Die Grid-Wächter patrouillieren die unteren Ebenen. Wechsle die Form, wenn du kämpfen musst.' },
      { speaker: 'Archivarin', text: 'Anima sieht. Animus schneidet. Beide brauchst du, um den Ausgang zu finden.' },
    ],
  },
  civic_clerk: {
    id: 'civic_clerk',
    lines: [
      { speaker: 'Beamter', text: 'Papiere. Immer Papiere. Die Stadt frisst Formulare und spuckt Ordnung aus.' },
      { speaker: 'Beamter', text: 'Hinter dem roten Banner wartet etwas Größeres. Sei vorsichtig.' },
    ],
  },
  civic_rebel: {
    id: 'civic_rebel',
    lines: [
      { speaker: 'Abtrünniger', text: 'Sie nennen es Civic Grid. Ich nenne es Käfig mit guter Beleuchtung.' },
      { speaker: 'Abtrünniger', text: 'Wenn du den Elite-Wächter besiegst, öffnet sich der Weg. Folge dem Weißen Hasen.' },
    ],
  },
  media_journalist: {
    id: 'media_journalist',
    lines: [
      { speaker: 'Journalistin', text: 'Wahrheit. Das Wort steht auf jedem Screen — und bedeutet nichts mehr.' },
      { speaker: 'Journalistin', text: 'Die Maskenträger wiederholen nur, was der Erzähler diktiert. Frag dich: Wer schreibt deine Geschichte?' },
      { speaker: 'Journalistin', text: 'Tausend Gesichter. Eine Lüge. Du wirst sie sehen.' },
    ],
  },
  media_drucker: {
    id: 'media_drucker',
    lines: [
      { speaker: 'Drucker', text: 'Ich druckte früher Zeitungen. Jetzt drucke ich Masken.' },
      { speaker: 'Drucker', text: 'Jede Maske eine Stimme. Jede Stimme dieselbe Lüge. Nimm das als Warnung.' },
    ],
  },
  media_actress: {
    id: 'media_actress',
    lines: [
      { speaker: 'Schauspielerin', text: 'Auf der Bühne bin ich frei. Hinter der Maske... weiß ich es nicht mehr.' },
      { speaker: 'Schauspielerin', text: 'Der Erzähler kommt. Wenn die Screens aufleuchten — wechsle die Form. Licht gegen Lüge. Klinge gegen Spiegel.' },
    ],
  },
  media_erzahler_tease: {
    id: 'media_erzahler_tease',
    lines: [
      { speaker: 'Der Erzähler', text: 'Willkommen in meiner Geschichte, Wanderer.' },
      { speaker: 'Der Erzähler', text: 'Du glaubst, du wählst Anima oder Animus. Ich wähle, was du siehst.' },
      { speaker: 'Der Erzähler', text: 'Tausend Gesichter warten. Eine davon... ist deine.' },
    ],
  },
  level_complete_civic: {
    id: 'level_complete_civic',
    lines: [
      { speaker: 'Erzähler', text: 'Die Oberfläche bricht. Gut. Es gibt tieferen Traum.' },
      { speaker: 'Erzähler', text: 'Civic Grid — bestanden. Der Media District flüstert bereits deinen Namen.' },
    ],
  },
  level_complete_media: {
    id: 'level_complete_media',
    lines: [
      { speaker: 'Erzähler', text: 'Die Screens erlöschen. Die Masken fallen. Für einen Moment.' },
      { speaker: 'Erzähler', text: 'Zwei Regionen. Zwei Wahrheiten. Babylon City hat noch fünf Träume für dich.' },
    ],
  },
};
