import type { State, Achievement, Badge } from './types';
const today=()=>new Date().toISOString().slice(0,10);
export function calculateLevel(xp:number){if(xp>=2000)return 5;if(xp>=1000)return 4;if(xp>=500)return 3;if(xp>=100)return 2;return 1}
export function levelRange(level:number){switch(level){case 1:return{current:0,next:100};case 2:return{current:100,next:500};case 3:return{current:500,next:1000};case 4:return{current:1000,next:2000};default:return{current:2000,next:2000}}}
export function levelProgress(xp:number,level:number){const r=levelRange(level);return level===5?100:Math.min(100,Math.round((xp-r.current)/(r.next-r.current)*100))}
function unlock(a:Achievement):Achievement{return a.unlocked?a:{...a,unlocked:true,unlockedDate:today()}}
export function evaluateAchievements(s:State){return s.achievements.map(a=>{switch(a.id){case'first-challenge':return s.totalChallenges>=1?unlock(a):a;case'first-favorite':return s.favorites.length>=1?unlock(a):a;case'first-master':return Object.values(s.progress).some(p=>p.status==='master')?unlock(a):a;case'ten-challenges':return s.totalChallenges>=10?unlock(a):a;case'hundred-correct':return s.totalCorrectAnswers>=100?unlock(a):a;case'thousand-xp':return s.xp>=1000?unlock(a):a;default:return a}})}
export function evaluateBadges(s:State):Badge[]{const b:Badge[]=[];if(s.totalChallenges>=1)b.push('Starter');if(s.streak>=7)b.push('Consistent Learner');if(s.learned.length>=100)b.push('Vocabulary Builder');if(Object.values(s.progress).filter(p=>p.status==='master').length>=10)b.push('Word Master');return b}
export function updateGamification(s:State):State{return{...s,level:calculateLevel(s.xp),achievements:evaluateAchievements(s),badges:evaluateBadges(s)}}
export const unlockedCount=(s:State)=>s.achievements.filter(a=>a.unlocked).length;
export const nextLockedAchievement=(s:State)=>s.achievements.find(a=>!a.unlocked);
