import state from './state.ts';
import actions from './action.ts';
import mutations from './mutations.ts';
import getters from './getters.ts';
import { createStore } from 'vuex';


export default createStore({
    state,
    mutations,
    actions,
    getters,
});