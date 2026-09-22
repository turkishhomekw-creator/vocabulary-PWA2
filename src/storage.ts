import type {State} from './types';
const KEY='wordlock-v2-sprint1';
export const defaults:State={version:1,learningDay:1,settings:{dailyWords:5,challengeSize:20,showTurkishAfterWrong:true,showExamplesAfterWrong:true,includeFavorites:true,favoriteReminder:true},favorites:[],learned:[],todayIds:[],todayCursor:0,todayCompleted:false};
export function loadState():State{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}'),settings:{...defaults.settings,...JSON.parse(localStorage.getItem(KEY)||'{}').settings}}}catch{return defaults}}
export function saveState(s:State){localStorage.setItem(KEY,JSON.stringify(s))}
export function resetState(){localStorage.removeItem(KEY)}