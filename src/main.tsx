import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Word, State, Screen, ChallengeState, Status } from './types';
import { loadState, saveState, resetState, defaultProgress } from './storage';
import { dailySet, buildChallenge, recordAnswer, stats, dueWords } from './engine';
import { updateGamification } from './achievement';
import LevelCard from './components/LevelCard';
import Achievements from './components/Achievements';
import GoalWidget from './components/GoalWidget';
import BadgePanel from './components/BadgePanel';
import './styles.css';

const App = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [state, setState] = useState<State>(loadState);
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<number>();

  useEffect(() => {
    fetch('./words.json').then(r => r.json()).then(setWords);
  }, []);

  useEffect(() => saveState(state), [state]);
  useEffect(() => { navigator.serviceWorker?.register('./sw.js'); }, []);

  useEffect(() => {
    if (words.length && !state.todayIds.length) {
      const set = dailySet(words, state.settings.dailyWords, state.learningDay, state.learned);
      setState(s => ({ ...s, todayIds: set.map(w => w.id), todayCursor: 0, todayCompleted: false }));
    }
  }, [words, state.todayIds.length]);

  if (!words.length) return <div className="splash"><div className="logo">W</div><b>WordLock yükleniyor…</b></div>;

  const today = state.todayIds.map(id => words.find(w => w.id === id)).filter(Boolean) as Word[];
  const st = stats(state);
  const due = dueWords(words, state);
  const list = (ids: number[]) => ids.map(id => words.find(w => w.id === id)).filter(Boolean) as Word[];

  const toggle = (id: number) => setState(s => {
    const favorites = s.favorites.includes(id) ? s.favorites.filter(x => x !== id) : [...s.favorites, id];
    return updateGamification({ ...s, favorites });
  });

  const open = (id: number) => { setDetail(id); setScreen('word'); };

  const start = (kind: 'daily' | 'risky' | 'favorites' | 'master' | 'review') => {
    const questions = buildChallenge(kind, words, state);
    if (!questions.length) return;
    const preStatuses = Object.fromEntries(
      questions.map(q => [q.wordId, state.progress[q.wordId]?.status || 'new'])
    ) as Record<number, Status>;
    setState(s => ({
      ...s,
      challenge: { kind, questions, index: 0, answers: [], score: 0, bestRun: 0, currentRun: 0, preStatuses }
    }));
    setSelected(null);
    setScreen('challenge');
  };

  return <div className="app">
    <Header go={setScreen} />
    {screen === 'home' && <Home s={state} st={st} today={today} due={due.length} go={setScreen} />}
    {screen === 'today' && <Today words={today} s={state} setS={setState} toggle={toggle} back={() => setScreen('home')} start={() => start('daily')} />}
    {screen === 'challenge' && state.challenge && <Challenge s={state} setS={setState} words={words} selected={selected} setSelected={setSelected} done={() => setScreen('result')} />}
    {screen === 'result' && <Result s={state} go={setScreen} start={start} />}
    {screen === 'learned' && <WordList title="Öğrenilen Kelimeler" words={list(state.learned)} s={state} open={open} back={() => setScreen('home')} />}
    {screen === 'favorites' && <WordList title="Favoriler" words={list(state.favorites)} s={state} open={open} back={() => setScreen('home')} action={() => start('favorites')} actionText="Favori Challenge Başlat" />}
    {screen === 'risky' && <WordList title="Riskli Kelimeler" words={words.filter(w => state.progress[w.id]?.status === 'risky')} s={state} open={open} back={() => setScreen('home')} action={() => start('risky')} actionText="Risk Challenge Başlat" empty="Bir kelimenin Riskli olması için en az 3 puanlanan cevap ve %60'ın altında doğruluk gerekir." />}
    {screen === 'master' && <WordList title="Master Kelimeler" words={words.filter(w => ['master', 'masterReview'].includes(state.progress[w.id]?.status))} s={state} open={open} back={() => setScreen('home')} action={() => start('master')} actionText="Master Challenge Başlat" empty="Master için %95'in üzerinde doğruluk, en az 10 cevap ve farklı tekrar döngüleri gerekir." />}
    {screen === 'all' && <AllWords words={words} s={state} open={open} back={() => setScreen('home')} />}
    {screen === 'review' && <WordList title="Bugünkü Tekrarlar" words={due} s={state} open={open} back={() => setScreen('home')} action={() => start('review')} actionText="Tekrar Challenge Başlat" empty="Bugün için planlanmış tekrar bulunmuyor." />}
    {screen === 'achievements' && <Achievements state={state} back={() => setScreen('home')} />}
    {screen === 'settings' && <Settings s={state} setS={setState} back={() => setScreen('home')} />}
    {screen === 'word' && detail && <WordDetail w={words.find(w => w.id === detail)!} s={state} toggle={toggle} back={() => setScreen('home')} />}
    <Nav current={screen} go={setScreen} />
  </div>;
};

const Header = ({ go }: any) => <header>
  <button className="brand" onClick={() => go('home')}><span>WORDLOCK</span><b>V4A</b></button>
  <button className="gear" onClick={() => go('settings')}>⚙</button>
</header>;

function Home({ s, st, today, due, go }: any) {
  return <main className="page">
    <section className="welcome">
      <p>ÖĞRENME GÜNÜ {s.learningDay}</p>
      <h1>{s.todayCompleted ? 'Bugünün kelimeleri tamamlandı.' : 'Bugünkü kelimeler hazır.'}</h1>
      <p className="heroText">{today.length} yeni kelimeyi sırayla çalış, sonra challenge'a geç.</p>
      <button className="heroButton" onClick={() => go('today')}>{s.todayCompleted ? 'Kelimeleri Tekrar Gör' : 'Bugünkü Kelimelere Başla'} →</button>
    </section>

    <section className="gamificationGrid">
      <LevelCard state={s} />
      <button className="achievementSummary" onClick={() => go('achievements')}>
        <small>ACHIEVEMENTS</small>
        <b>🏅 {s.achievements.filter((a: any) => a.unlocked).length} / {s.achievements.length}</b>
        <span>Tüm başarıları görüntüle →</span>
      </button>
    </section>

    <BadgePanel state={s} />

    <section className="stats">
      <button onClick={() => go('learned')}><span>Öğrenilen</span><b>{s.learned.length}<small>/384</small></b></button>
      <button onClick={() => go('master')}><span>Master</span><b>{st.master}</b></button>
      <button onClick={() => go('risky')}><span>Riskli</span><b>{st.risky}</b></button>
      <button onClick={() => go('favorites')}><span>Favoriler</span><b>{s.favorites.length}</b></button>
    </section>

    <section className="intelligence">
      <button onClick={() => go('all')}><small>KELİME KÜTÜPHANESİ</small><b>384 Kelimenin Tamamı</b><span>{384 - s.learned.length} kelime henüz başlamadı →</span></button>
      <button onClick={() => due ? go('review') : undefined}><small>BUGÜNKÜ TEKRAR</small><b>{due} Kelime Due</b><span>{due ? 'Planlı tekrarları görüntüle →' : 'Bugün tekrar yok'}</span></button>
    </section>

    <GoalWidget state={s} />

    <section className="panel todayPanel">
      <div className="sectionTitle"><div><small>BUGÜNÜN SETİ</small><h2>{s.todayCompleted ? 'Tamamlandı' : 'Devam ediyor'}</h2></div><b>{Math.min(s.todayCursor + 1, today.length)}/{today.length}</b></div>
      <div className="wordPills">{today.map((w: Word, i: number) => <span className={i <= s.todayCursor ? 'seen' : ''} key={w.id}>{w.word}</span>)}</div>
      <div className="homeActions"><button className="secondary" onClick={() => go('today')}>{s.todayCompleted ? 'Kelimeleri Yeniden İncele' : 'Kaldığın Yerden Devam Et'}</button>{s.todayCompleted && <button className="primary" onClick={() => go('today')}>Challenge'a Geç</button>}</div>
    </section>
  </main>;
}

function Today({ words, s, setS, toggle, back, start }: any) {
  const i = Math.min(s.todayCursor, words.length - 1), w = words[i];
  if (!w) return null;
  const move = (n: number) => setS((x: State) => ({ ...x, todayCursor: n, learned: [...new Set([...x.learned, ...words.slice(0, n + 1).map((a: Word) => a.id)])] }));
  return <main className="page"><div className="topline"><button className="back" onClick={back}>← Ana Sayfa</button><b>{i + 1}/{words.length}</b></div><div className="progress"><i style={{ width: `${(i + 1) / words.length * 100}%` }} /></div><WordCard w={w} fav={s.favorites.includes(w.id)} toggle={toggle} /><div className="actions"><button className="secondary" disabled={!i} onClick={() => move(i - 1)}>← Önceki</button>{i === words.length - 1 ? <button className="primary" onClick={() => { setS((x: State) => updateGamification({ ...x, todayCompleted: true, learned: [...new Set([...x.learned, ...words.map((a: Word) => a.id)])] })); start(); }}>Challenge'a Başla</button> : <button className="primary" onClick={() => move(i + 1)}>Öğrendim, Sonraki →</button>}</div></main>;
}

const WordCard = ({ w, fav, toggle }: any) => <article className="wordCard"><div className="wordHead"><span className="pos">{w.pos}</span><button className={fav ? 'star on' : 'star'} onClick={() => toggle(w.id)}>★</button></div><h1>{w.word}</h1><section><label>ENGLISH DEFINITION</label><p>{w.definition}</p></section><section><label>TÜRKÇE</label><p className="turkish">{w.turkish}</p></section><div className="two"><section><label>SYNONYMS</label><div className="tags">{w.synonyms.map((x: string) => <span key={x}>{x}</span>)}</div></section><section><label>ANTONYMS</label><div className="tags red">{w.antonyms.length ? w.antonyms.map((x: string) => <span key={x}>{x}</span>) : <span>N/A</span>}</div></section></div><section><label>EXAMPLES</label>{w.examples.map((x: string, k: number) => <p className="example" key={k}><b>{k + 1}</b>{x}</p>)}</section></article>;

function Challenge({ s, setS, words, selected, setSelected, done }: any) {
  const c = s.challenge as ChallengeState, q = c.questions[c.index], w = words.find((x: Word) => x.id === q.wordId), isCorrect = selected === q.correctAnswer;
  const answer = (value: string | null, unknown = false) => {
    if (selected !== null) return;
    const correct = !unknown && value === q.correctAnswer, next = recordAnswer(s, q.wordId, correct, unknown, q.type), run = correct ? c.currentRun + 1 : 0;
    setS({ ...next, challenge: { ...c, answers: [...c.answers, { wordId: q.wordId, correct, unknown }], score: c.score + (correct ? 10 : 0), currentRun: run, bestRun: Math.max(c.bestRun, run) } });
    setSelected(unknown ? '__unknown__' : value);
  };
  const next = () => {
    const cc = s.challenge as ChallengeState;
    if (cc.index < cc.questions.length - 1) { setS((x: State) => ({ ...x, challenge: { ...x.challenge!, index: x.challenge!.index + 1 } })); setSelected(null); return; }
    const a = cc.answers, ids = [...new Set(a.map(x => x.wordId))], newRisky = ids.filter(id => cc.preStatuses[id] !== 'risky' && s.progress[id]?.status === 'risky'), newMaster = ids.filter(id => cc.preStatuses[id] !== 'master' && s.progress[id]?.status === 'master'), daily = cc.kind === 'daily', bonus = daily ? 50 + (cc.bestRun >= 10 ? 40 : cc.bestRun >= 5 ? 20 : 0) : 0, stamp = new Date().toISOString().slice(0, 10), newStreak = daily && s.lastCompleted !== stamp ? s.streak + 1 : s.streak;
    setS((x: State) => updateGamification({
      ...x,
      xp: x.xp + cc.score + bonus,
      streak: newStreak,
      lastCompleted: daily ? stamp : x.lastCompleted,
      totalChallenges: x.totalChallenges + 1,
      totalCorrectAnswers: x.totalCorrectAnswers + a.filter(y => y.correct).length,
      lastResult: { kind: cc.kind, correct: a.filter(y => y.correct).length, wrong: a.filter(y => !y.correct && !y.unknown).length, unknown: a.filter(y => y.unknown).length, xp: cc.score + bonus, newRisky, newMaster }
    }));
    done();
  };
  return <main className="page"><div className="topline"><b>Question {c.index + 1}/{c.questions.length}</b><span>{c.score} XP</span></div><div className="progress"><i style={{ width: `${(c.index + 1) / c.questions.length * 100}%` }} /></div><section className="panel question"><h2 style={{ whiteSpace: 'pre-line' }}>{q.prompt}</h2>{q.options.map((o: string) => <button key={o} disabled={selected !== null} className={selected !== null ? (o === q.correctAnswer ? 'correct' : o === selected ? 'wrong' : '') : ''} onClick={() => answer(o)}>{o}</button>)}{selected === null && <button className="unknown" onClick={() => answer(null, true)}>I don't know</button>}{selected !== null && <div className="feedback"><h3>{isCorrect ? '✓ Correct, +10 XP' : `Correct answer: ${q.correctAnswer}`}</h3>{!isCorrect && s.settings.showTurkishAfterWrong && <p><b>Türkçe:</b> {w.turkish}</p>}{!isCorrect && s.settings.showExamplesAfterWrong && <p>{w.examples[0]}</p>}<button className="primary" onClick={next}>{c.index === c.questions.length - 1 ? 'View Result' : 'Next Question'}</button></div>}</section></main>;
}

function Result({ s, go, start }: any) {
  const r = s.lastResult;
  if (!r) return null;
  return <main className="page"><section className="panel result"><div className="trophy">🏆</div><h1>Challenge Tamamlandı</h1><div className="resultGrid"><div><b>{r.correct}</b><span>Doğru</span></div><div><b>{r.wrong + r.unknown}</b><span>Yanlış/Bilmiyorum</span></div><div><b>{r.xp}</b><span>XP</span></div></div>{r.newRisky.length ? <button onClick={() => go('risky')}>Tekrar Gerekli: {r.newRisky.length}</button> : <p className="explain">Henüz yeni Riskli kelime yok. Risk sınıflandırması için bir kelimenin en az 3 puanlanan cevabı gerekir.</p>}{r.newMaster.length ? <button onClick={() => go('master')}>Yeni Master: {r.newMaster.length}</button> : <p className="explain">Henüz yeni Master kelime yok. Master seviyesi en az 10 cevap ve farklı tekrar döngüleri gerektirir.</p>}<div className="actions"><button className="secondary" onClick={() => go('home')}>Ana Sayfa</button>{r.newRisky.length > 0 && <button className="primary" onClick={() => start('risky')}>Riskli Kelimeleri Tekrarla</button>}</div></section></main>;
}

function WordList({ title, words, s, open, back, action, actionText, empty }: any) {
  return <main className="page"><button className="back" onClick={back}>← Ana Sayfa</button><div className="title"><h1>{title}</h1><p>{words.length} kelime</p></div>{!words.length ? <section className="panel empty"><h2>Henüz kelime yok</h2><p>{empty || 'Bu liste ilerledikçe otomatik oluşacak.'}</p></section> : <><div className="list">{words.map((w: Word) => { const p = s.progress[w.id] || defaultProgress(); return <button key={w.id} onClick={() => open(w.id)}><div><b>{w.word}</b><small>{w.turkish}</small></div><span>{p.seen ? `${p.accuracy}% · ${p.status}` : 'Yeni'}</span></button>; })}</div>{action && <button className="primary wide" onClick={action}>{actionText}</button>}</>}</main>;
}

function AllWords({ words, s, open, back }: any) {
  const [q, setQ] = useState(''), [filter, setFilter] = useState('all');
  const filtered = words.filter((w: Word) => { const p = s.progress[w.id] || defaultProgress(), match = w.word.toLowerCase().includes(q.toLowerCase()) || w.turkish.toLowerCase().includes(q.toLowerCase()); if (!match) return false; if (filter === 'notStarted') return !s.learned.includes(w.id); if (filter === 'learned') return s.learned.includes(w.id); if (filter === 'favorites') return s.favorites.includes(w.id); if (filter === 'risky') return p.status === 'risky'; if (filter === 'master') return p.status === 'master'; return true; });
  return <main className="page"><button className="back" onClick={back}>← Ana Sayfa</button><div className="title"><h1>Tüm Kelimeler</h1><p>384 kelimelik kütüphane</p></div><input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Kelime veya Türkçe anlam ara..." /><div className="filters">{[['all', 'Tümü'], ['notStarted', 'Başlanmadı'], ['learned', 'Öğrenildi'], ['risky', 'Riskli'], ['master', 'Master'], ['favorites', 'Favoriler']].map(([v, t]) => <button key={v} className={filter === v ? 'active' : ''} onClick={() => setFilter(v)}>{t}</button>)}</div><p>{filtered.length} kelime gösteriliyor</p><div className="list">{filtered.map((w: Word) => { const p = s.progress[w.id] || defaultProgress(); return <button key={w.id} onClick={() => open(w.id)}><div><b>{w.word}</b><small>{w.turkish}</small></div><span>{s.learned.includes(w.id) ? `${p.accuracy}% · ${p.status}` : 'Başlanmadı'}</span></button>; })}</div></main>;
}

function WordDetail({ w, s, toggle, back }: any) {
  const p = s.progress[w.id] || defaultProgress();
  return <main className="page"><button className="back" onClick={back}>← Geri</button><WordCard w={w} fav={s.favorites.includes(w.id)} toggle={toggle} /><section className="panel"><h3>İlerleme</h3><p>Görülme: {p.seen} · Doğru: {p.correct} · Yanlış: {p.wrong}</p><p>Accuracy: {p.accuracy}% · Durum: {p.status}</p><div className="accuracyTrack"><i style={{ width: `${p.accuracy}%` }} /></div><p>Son görülme: {p.lastSeen || 'Henüz yok'} · Sonraki tekrar: {p.nextReview || 'Planlanmadı'}</p><p>Soru tipleri: {p.questionTypes.length} · Doğru gün sayısı: {p.daysCorrect.length}</p></section></main>;
}

function Settings({ s, setS, back }: any) {
  const set = (k: string, v: any) => setS((x: State) => ({ ...x, settings: { ...x.settings, [k]: v }, ...(k === 'dailyWords' ? { todayIds: [], todayCursor: 0, todayCompleted: false } : {}) }));
  return <main className="page"><button className="back" onClick={back}>← Ana Sayfa</button><div className="title"><h1>Öğrenme Planı</h1></div><section className="panel settings"><h2>Günlük Öğrenme</h2><Setting label="Yeni kelime sayısı"><Choices v={s.settings.dailyWords} vals={[3, 5, 7, 10]} set={(v: number) => set('dailyWords', v)} /></Setting><Setting label="Challenge soru sayısı"><Choices v={s.settings.challengeSize} vals={[10, 20, 30]} set={(v: number) => set('challengeSize', v)} /></Setting></section><section className="panel settings"><h2>Challenge Tercihleri</h2><Toggle label="Yanlışta Türkçe anlamı göster" v={s.settings.showTurkishAfterWrong} set={(v: boolean) => set('showTurkishAfterWrong', v)} /><Toggle label="Yanlışta örnek cümleyi göster" v={s.settings.showExamplesAfterWrong} set={(v: boolean) => set('showExamplesAfterWrong', v)} /><Toggle label="Favorileri günlük challenge'a dahil et" v={s.settings.includeFavorites} set={(v: boolean) => set('includeFavorites', v)} /></section><section className="panel danger"><button onClick={() => { resetState(); location.reload(); }}>Tüm İlerlemeyi Sıfırla</button></section></main>;
}

const Setting = ({ label, children }: any) => <div className="setting"><b>{label}</b>{children}</div>;
const Choices = ({ v, vals, set }: any) => <div className="choices">{vals.map((x: number) => <button className={v === x ? 'selected' : ''} onClick={() => set(x)} key={x}>{x}</button>)}</div>;
const Toggle = ({ label, v, set }: any) => <label className="toggle"><span>{label}</span><input type="checkbox" checked={v} onChange={e => set(e.target.checked)} /></label>;
const Nav = ({ current, go }: any) => <nav><button className={current === 'home' ? 'active' : ''} onClick={() => go('home')}>⌂<span>Ana Sayfa</span></button><button className={current === 'today' ? 'active' : ''} onClick={() => go('today')}>▣<span>Bugün</span></button><button className={current === 'achievements' ? 'active' : ''} onClick={() => go('achievements')}>🏅<span>Başarılar</span></button><button className={current === 'settings' ? 'active' : ''} onClick={() => go('settings')}>⚙<span>Ayarlar</span></button></nav>;

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
